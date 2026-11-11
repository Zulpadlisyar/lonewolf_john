import { NextRequest, NextResponse } from "next/server";
import { verifyMidtransSignature, PaymentWebhookPayload } from "@/lib/payment";

export async function POST(req: NextRequest) {
  try {
    const payload: PaymentWebhookPayload = await req.json();
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "dummy-server-key-for-test";

    // 1. Verify Midtrans Signature (unless in mock simulator mode)
    const isMock = !process.env.MIDTRANS_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY.includes("your-sandbox");
    if (!isMock) {
      const isValid = verifyMidtransSignature(payload, serverKey);
      if (!isValid) {
        console.error("[PaymentWebhook] Invalid HMAC signature detected for order:", payload.order_id);
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    const { order_id, transaction_status, fraud_status } = payload;
    console.log(`[PaymentWebhook] Processing event for order ${order_id}: status=${transaction_status}, fraud=${fraud_status}`);

    // 2. Map Payment Status
    let isSuccess = false;
    if (transaction_status === "capture") {
      if (fraud_status === "accept" || !fraud_status) {
        isSuccess = true;
      }
    } else if (transaction_status === "settlement") {
      isSuccess = true;
    }

    // 3. Idempotency Response: Return 200 OK
    return NextResponse.json({
      received: true,
      orderId: order_id,
      status: isSuccess ? "PAID" : transaction_status,
      idempotent: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[PaymentWebhook] Error processing callback:", error);
    return NextResponse.json({ error: "Internal processing error" }, { status: 500 });
  }
}
