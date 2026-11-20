import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handlePaymentNotification } from "@/lib/payment-webhook";

/**
 * Midtrans payment notification endpoint. All rules live in
 * handlePaymentNotification so they can be tested without a database.
 */
export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
  }

  try {
    const outcome = await handlePaymentNotification(db, process.env.MIDTRANS_SERVER_KEY, payload);
    return NextResponse.json(outcome.body, { status: outcome.status });
  } catch (error) {
    console.error("[PaymentWebhook] Error processing callback:", error);
    return NextResponse.json({ error: "Internal processing error" }, { status: 500 });
  }
}
