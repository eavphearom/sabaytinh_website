import test from "node:test";
import assert from "node:assert/strict";
import { createPaymentResumeSession } from "../src/services/paymentResumeSession.js";

const ready = { payment: { payment_status: "PENDING", checkout_status: "READY", qr_string: "test", expires_at: "17-11-2026 12:15:00 PM" } };
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };

test("duplicate starts and polling never overlap; paid stops once", async () => {
  let resumes = 0, checks = 0, paid = 0, stopped = 0, tick;
  const pending = deferred();
  const session = createPaymentResumeSession({
    resume: async () => { resumes++; return ready; },
    check: () => { checks++; return pending.promise; },
    onReady() {}, onMessage() {}, onPaid() { paid++; },
    schedule(fn, ms) { assert.equal(ms, 4000); tick = fn; return 7; },
    unschedule(id) { assert.equal(id, 7); stopped++; },
  });
  const start = session.start(9);
  await session.start(9);
  await tick(); await tick();
  assert.equal(resumes, 1); assert.equal(checks, 1);
  pending.resolve({ payment_status: "PAID" }); await start; await tick();
  assert.equal(paid, 1); assert.equal(stopped, 1); assert.equal(checks, 1);
});

test("already paid and unsupported recovery never show QR or poll", async () => {
  for (const payment of [{ payment_status: "PAID" }, { payment_status: "PENDING", checkout_status: "RECONCILIATION_REQUIRED", checkout_message: "Contact support" }]) {
    let paid = 0, message;
    const session = createPaymentResumeSession({ resume: async () => ({ payment }),
      check() { assert.fail("unexpected check"); }, onReady() { assert.fail("unexpected QR"); },
      onPaid() { paid++; }, onMessage(text) { message = text; } });
    await session.start(9);
    if (payment.payment_status === "PAID") assert.equal(paid, 1);
    else assert.equal(message, "Contact support");
  }
});

test("closing ignores a late resume response", async () => {
  const pending = deferred(); let signal;
  const session = createPaymentResumeSession({ resume: (id, value) => { signal = value; return pending.promise; },
    check() { assert.fail(); }, onReady() { assert.fail(); }, onPaid() { assert.fail(); }, onMessage() { assert.fail(); } });
  const start = session.start(9); session.stop(); pending.resolve(ready); await start;
  assert.equal(signal.aborted, true);
});

test("network error retries, closing ignores late paid check", async () => {
  let tick, checks = 0, messages = 0; const pending = deferred();
  const session = createPaymentResumeSession({ resume: async () => ready,
    check: async () => { if (++checks === 1) throw new Error(); return pending.promise; },
    onReady() {}, onPaid() { assert.fail("closed session"); }, onMessage() { messages++; },
    schedule(fn) { tick = fn; return 1; }, unschedule() {} });
  await session.start(9); assert.equal(messages, 1);
  const checking = tick(); session.stop(); pending.resolve({ payment_status: "PAID" }); await checking;
});
