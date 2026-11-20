import crypto from "crypto";
import { PaymentStatus } from "@prisma/client";

export interface CreatePaymentParams {
  orderNumber: string;
  grossAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface PaymentWebhookPayload {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
  transaction_time?: string;
}

/**
 * Verifies Midtrans SHA512 signature key:
 * SHA512(order_id + status_code + gross_amount + server_key)
 */
export function verifyMidtransSignature(
  payload: PaymentWebhookPayload,
  serverKey: string
): boolean {
  const { order_id, status_code, gross_amount, signature_key } = payload;
  const rawString = `${order_id}${status_code}${gross_amount}${serverKey}`;
  const computedHash = crypto.createHash("sha512").update(rawString).digest("hex");
  const expected = Buffer.from(computedHash, "utf8");
  const received = Buffer.from((signature_key ?? "").toLowerCase(), "utf8");
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

/**
 * Maps a verified Midtrans notification to the internal payment status.
 * Returns null for notifications that do not change payment state.
 */
export function mapMidtransPaymentStatus(payload: PaymentWebhookPayload): PaymentStatus | null {
  switch (payload.transaction_status) {
    case "settlement":
      return PaymentStatus.SUCCESS;
    case "capture":
      if (payload.fraud_status === "challenge") return PaymentStatus.PENDING;
      if (payload.fraud_status === "deny") return PaymentStatus.FAILED;
      return PaymentStatus.SUCCESS;
    case "pending":
      return PaymentStatus.PENDING;
    case "deny":
    case "cancel":
      return PaymentStatus.FAILED;
    case "expire":
      return PaymentStatus.EXPIRED;
    case "refund":
    case "partial_refund":
      return PaymentStatus.REFUNDED;
    default:
      return null;
  }
}

/**
 * Creates sandbox or mock payment transaction
 */
export async function createPaymentTransaction(params: CreatePaymentParams) {
  const isProduction = process.env.PAYMENT_MODE === "production";
  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  // In offline local / free staging without API key, use instant simulator
  if (!serverKey || serverKey.includes("your-sandbox")) {
    return {
      token: `mock-snap-token-${params.orderNumber}-${Date.now()}`,
      redirectUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-${params.orderNumber}`,
      isMock: true,
      mode: "simulator",
    };
  }

  // Call real Midtrans Sandbox API
  const endpoint = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  const authHeader = Buffer.from(`${serverKey}:`).toString("base64");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${authHeader}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: params.orderNumber,
        gross_amount: params.grossAmount,
      },
      customer_details: {
        first_name: params.customerName,
        email: params.customerEmail,
        phone: params.customerPhone,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Midtrans API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return {
    token: data.token,
    redirectUrl: data.redirect_url,
    isMock: false,
    mode: isProduction ? "live" : "sandbox",
  };
}

