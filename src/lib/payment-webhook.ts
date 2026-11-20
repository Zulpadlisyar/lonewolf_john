import { Prisma, PaymentStatus, OrderStatus, type PrismaClient } from "@prisma/client";
import {
  verifyMidtransSignature,
  mapMidtransPaymentStatus,
  type PaymentWebhookPayload,
} from "@/lib/payment";

export interface WebhookOutcome {
  status: number;
  body: Record<string, unknown>;
}

function isPaymentPayload(value: unknown): value is PaymentWebhookPayload {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.order_id === "string" &&
    typeof v.status_code === "string" &&
    typeof v.gross_amount === "string" &&
    typeof v.signature_key === "string" &&
    typeof v.transaction_status === "string"
  );
}

/**
 * Applies a Midtrans payment notification.
 *
 * - Fails closed when no server key is configured (503).
 * - Requires a valid SHA512 signature (403).
 * - Requires the notified amount to equal the order total (400).
 * - Idempotent: a status that was already applied, or a notification that would
 *   overwrite a successful payment (except a refund), changes nothing.
 */
export async function handlePaymentNotification(
  db: PrismaClient,
  serverKey: string | undefined,
  payload: unknown
): Promise<WebhookOutcome> {
  if (!serverKey || serverKey.includes("your-sandbox")) {
    console.error("[PaymentWebhook] MIDTRANS_SERVER_KEY is not configured; rejecting callback.");
    return { status: 503, body: { error: "Payment gateway not configured" } };
  }

  if (!isPaymentPayload(payload)) {
    return { status: 400, body: { error: "Malformed payment notification" } };
  }

  if (!verifyMidtransSignature(payload, serverKey)) {
    console.error("[PaymentWebhook] Invalid signature for order:", payload.order_id);
    return { status: 403, body: { error: "Invalid signature" } };
  }

  const nextStatus = mapMidtransPaymentStatus(payload);
  if (!nextStatus) {
    return { status: 200, body: { received: true, orderId: payload.order_id, ignored: true } };
  }

  const order = await db.order.findUnique({
    where: { orderNumber: payload.order_id },
    include: { payment: true },
  });

  if (!order || !order.payment) {
    console.error("[PaymentWebhook] No payment record for order:", payload.order_id);
    return { status: 404, body: { error: "Order not found" } };
  }

  let notifiedAmount: Prisma.Decimal;
  try {
    notifiedAmount = new Prisma.Decimal(payload.gross_amount);
  } catch {
    return { status: 400, body: { error: "Invalid gross_amount" } };
  }
  if (!notifiedAmount.equals(order.totalAmount)) {
    console.error("[PaymentWebhook] Amount mismatch for order:", payload.order_id);
    return { status: 400, body: { error: "Amount mismatch" } };
  }

  // A refund may still follow a successful payment, so REFUNDED is the only
  // target allowed to move a SUCCESS payment. Nothing else may overwrite it.
  const blocked: PaymentStatus[] =
    nextStatus === PaymentStatus.REFUNDED
      ? [PaymentStatus.REFUNDED]
      : [PaymentStatus.SUCCESS, PaymentStatus.REFUNDED, nextStatus];

  const applied = await db.$transaction(async (tx) => {
    const update = await tx.paymentTransaction.updateMany({
      where: { id: order.payment!.id, status: { notIn: blocked } },
      data: {
        status: nextStatus,
        paymentMethod: payload.payment_type ?? undefined,
        signatureKey: payload.signature_key,
        rawPayload: payload as unknown as Prisma.InputJsonValue,
        paidAt: nextStatus === PaymentStatus.SUCCESS ? new Date() : undefined,
      },
    });

    if (update.count === 0) return false;

    const orderStatus =
      nextStatus === PaymentStatus.SUCCESS
        ? OrderStatus.PAID
        : nextStatus === PaymentStatus.REFUNDED
          ? OrderStatus.REFUNDED
          : undefined;

    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: nextStatus,
        ...(orderStatus ? { orderStatus } : {}),
      },
    });

    return true;
  });

  console.log(`[PaymentWebhook] Order ${payload.order_id}: status=${nextStatus} applied=${applied}`);

  return {
    status: 200,
    body: {
      received: true,
      orderId: payload.order_id,
      status: nextStatus,
      idempotent: !applied,
      timestamp: new Date().toISOString(),
    },
  };
}
