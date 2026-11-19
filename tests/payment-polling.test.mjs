import test from "node:test";
import assert from "node:assert/strict";
import { PAYMENT_POLL_MS, watchPaymentReturn } from "../src/services/paymentPolling.js";

test("payment checks use a two-second cadence", () => assert.equal(PAYMENT_POLL_MS, 2000));
test("returning to visible payment checks immediately, coalesces events and cleans up", async () => {
  const target = new EventTarget(), page = new EventTarget();
  let time = 0, checks = 0;
  page.visibilityState = "hidden";
  const stop = watchPaymentReturn(() => { checks++; }, { target, page, now: () => time });
  target.dispatchEvent(new Event("focus")); await Promise.resolve();
  assert.equal(checks, 0);
  page.visibilityState = "visible";
  page.dispatchEvent(new Event("visibilitychange"));
  target.dispatchEvent(new Event("focus")); await Promise.resolve();
  assert.equal(checks, 1);
  time += 1001; target.dispatchEvent(new Event("focus")); await Promise.resolve();
  assert.equal(checks, 2);
  stop(); time += 1001;
  target.dispatchEvent(new Event("focus")); page.dispatchEvent(new Event("visibilitychange")); await Promise.resolve();
  assert.equal(checks, 2);
});
