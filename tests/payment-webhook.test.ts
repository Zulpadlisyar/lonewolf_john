import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { Prisma, type PrismaClient } from "@prisma/client";
import { handlePaymentNotification } from "@/lib/payment-webhook";

const SERVER_KEY = "SB-Mid-server-test-key-12345";

function sign(orderId: string, statusCode: string, grossAmount: string, key = SERVER_KEY) {
  return crypto.createHash("sha512").update(`${orderId}${statusCode}${grossAmount}${key}`).digest("hex");
}

function notification(
  overrides: Partial<Record<string, string>> & { transaction_status: string; order_id?: string }
) {
  const order_id = overrides.order_id ?? "ORD-TEST-001";
  const status_code = overrides.status_code ?? "200";
  const gross_amount = overrides.gross_amount ?? "349000.00";
  return {
    order_id,
    status_code,
    gross_amount,
    signature_key: overrides.signature_key ?? sign(order_id, status_code, gross_amount),
    transaction_status: overrides.transaction_status,
    payment_type: "qris",
  };
}

interface FakeState {
  orderNumber: string;
  orderId: string;
  totalAmount: string;
  paymentId: string;
  paymentStatus: string;
  orderStatus: string;
  paidAt: Date | null;
}

/**
 * In-memory stand-in for the Prisma calls the handler makes. It enforces the
 * same `status: { notIn }` guard that the real updateMany applies.
 */
function fakeDb(state: FakeState) {
  const db = {
    order: {
      async findUnique({ where }: { where: { orderNumber: string } }) {
        if (where.orderNumber !== state.orderNumber) return null;
        return {
          id: state.orderId,
          totalAmount: new Prisma.Decimal(state.totalAmount),
          payment: { id: state.paymentId },
        };
      },
      async update({ data }: { data: { paymentStatus: string; orderStatus?: string } }) {
        state.paymentStatus = data.paymentStatus;
        if (data.orderStatus) state.orderStatus = data.orderStatus;
        return {};
      },
    },
    paymentTransaction: {
      async updateMany({
        where,
        data,
      }: {
        where: { id: string; status: { notIn: string[] } };
        data: { status: string; paidAt?: Date };
      }) {
        if (where.id !== state.paymentId) return { count: 0 };
        if (where.status.notIn.includes(state.paymentStatus)) return { count: 0 };
        state.paymentStatus = data.status;
        if (data.paidAt) state.paidAt = data.paidAt;
        return { count: 1 };
      },
    },
    async $transaction<T>(fn: (tx: unknown) => Promise<T>) {
      return fn(db);
    },
  };
  return db as unknown as PrismaClient;
}

function freshState(overrides: Partial<FakeState> = {}): FakeState {
  return {
    orderNumber: "ORD-TEST-001",
    orderId: "ord_1",
    totalAmount: "349000",
    paymentId: "pay_1",
    paymentStatus: "PENDING",
    orderStatus: "PENDING_PAYMENT",
    paidAt: null,
    ...overrides,
  };
}

test("rejects every notification when the server key is not configured", async () => {
  const state = freshState();
  const outcome = await handlePaymentNotification(fakeDb(state), undefined, notification({ transaction_status: "settlement" }));
  assert.equal(outcome.status, 503);
  assert.equal(state.paymentStatus, "PENDING");

  const placeholder = await handlePaymentNotification(fakeDb(state), "SB-Mid-server-YOUR-your-sandbox", notification({ transaction_status: "settlement" }));
  assert.equal(placeholder.status, 503);
});

test("rejects a notification with a forged or wrong-key signature", async () => {
  const state = freshState();
  const forged = notification({ transaction_status: "settlement", signature_key: "00".repeat(64) });
  assert.equal((await handlePaymentNotification(fakeDb(state), SERVER_KEY, forged)).status, 403);

  const wrongKey = notification({
    transaction_status: "settlement",
    signature_key: sign("ORD-TEST-001", "200", "349000.00", "some-other-key"),
  });
  assert.equal((await handlePaymentNotification(fakeDb(state), SERVER_KEY, wrongKey)).status, 403);
  assert.equal(state.paymentStatus, "PENDING");
});

test("rejects malformed payloads with 400", async () => {
  const state = freshState();
  for (const payload of [null, "text", {}, { order_id: "ORD-TEST-001" }]) {
    const outcome = await handlePaymentNotification(fakeDb(state), SERVER_KEY, payload);
    assert.equal(outcome.status, 400, `payload ${JSON.stringify(payload)} should be rejected`);
  }
});

test("a valid settlement marks the payment and order as paid", async () => {
  const state = freshState();
  const outcome = await handlePaymentNotification(fakeDb(state), SERVER_KEY, notification({ transaction_status: "settlement" }));

  assert.equal(outcome.status, 200);
  assert.equal(outcome.body.idempotent, false);
  assert.equal(state.paymentStatus, "SUCCESS");
  assert.equal(state.orderStatus, "PAID");
  assert.ok(state.paidAt instanceof Date);
});

test("repeating a settlement changes nothing and reports idempotent", async () => {
  const state = freshState();
  const db = fakeDb(state);
  const payload = notification({ transaction_status: "settlement" });

  await handlePaymentNotification(db, SERVER_KEY, payload);
  const again = await handlePaymentNotification(db, SERVER_KEY, payload);

  assert.equal(again.status, 200);
  assert.equal(again.body.idempotent, true);
  assert.equal(state.paymentStatus, "SUCCESS");
});

test("a late expire or deny cannot overwrite a successful payment", async () => {
  const state = freshState({ paymentStatus: "SUCCESS", orderStatus: "PAID" });
  const db = fakeDb(state);

  const expire = await handlePaymentNotification(db, SERVER_KEY, notification({ transaction_status: "expire" }));
  const deny = await handlePaymentNotification(db, SERVER_KEY, notification({ transaction_status: "deny" }));

  assert.equal(expire.body.idempotent, true);
  assert.equal(deny.body.idempotent, true);
  assert.equal(state.paymentStatus, "SUCCESS");
  assert.equal(state.orderStatus, "PAID");
});

test("a refund after a successful payment moves both statuses to REFUNDED", async () => {
  const state = freshState({ paymentStatus: "SUCCESS", orderStatus: "PAID" });
  const outcome = await handlePaymentNotification(fakeDb(state), SERVER_KEY, notification({ transaction_status: "refund" }));

  assert.equal(outcome.body.idempotent, false);
  assert.equal(state.paymentStatus, "REFUNDED");
  assert.equal(state.orderStatus, "REFUNDED");
});

test("an amount that differs from the order total is rejected and nothing changes", async () => {
  const state = freshState();
  const outcome = await handlePaymentNotification(
    fakeDb(state),
    SERVER_KEY,
    notification({ transaction_status: "settlement", gross_amount: "1.00" })
  );

  assert.equal(outcome.status, 400);
  assert.equal(outcome.body.error, "Amount mismatch");
  assert.equal(state.paymentStatus, "PENDING");
});

test("a non-numeric gross_amount is rejected with 400, not a server error", async () => {
  const state = freshState();
  const payload = notification({ transaction_status: "settlement", gross_amount: "abc" });
  const outcome = await handlePaymentNotification(fakeDb(state), SERVER_KEY, payload);
  assert.equal(outcome.status, 400);
});

test("an unknown order returns 404", async () => {
  const outcome = await handlePaymentNotification(
    fakeDb(freshState()),
    SERVER_KEY,
    notification({ transaction_status: "settlement", order_id: "ORD-DOES-NOT-EXIST" })
  );
  assert.equal(outcome.status, 404);
});

test("a fraud challenge keeps the payment pending and the order unpaid", async () => {
  const state = freshState();
  const payload = { ...notification({ transaction_status: "capture" }), fraud_status: "challenge" };

  const outcome = await handlePaymentNotification(fakeDb(state), SERVER_KEY, payload);

  assert.equal(outcome.status, 200);
  assert.equal(state.paymentStatus, "PENDING");
  assert.equal(state.orderStatus, "PENDING_PAYMENT");
});
