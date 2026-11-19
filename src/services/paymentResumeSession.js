import { PAYMENT_POLL_MS, watchPaymentReturn } from "./paymentPolling.js";
// One order per session. Requests and timer callbacks share the same in-flight guard.
export function createPaymentResumeSession({
  resume, check, onReady, onPaid, onMessage,
  schedule = setInterval, unschedule = clearInterval,
}) {
  const controller = new AbortController();
  let active = false;
  let started = false;
  let checking = false;
  let timer;
  let unwatch;

  function stop() {
    active = false;
    if (timer !== undefined) unschedule(timer);
    unwatch?.();
    controller.abort();
  }

  function accept(payment) {
    if (payment?.payment_status === "PAID") {
      stop();
      onPaid();
      return true;
    }
    if (["FAILED", "CANCELLED", "REFUNDED"].includes(payment?.payment_status)) {
      stop();
      onMessage("This order's payment requires support review.", true);
      return true;
    }
    return false;
  }

  async function poll(orderId) {
    if (!active || checking) return;
    checking = true;
    try {
      const payment = await check(orderId, controller.signal);
      if (active) accept(payment);
    } catch {
      if (active) onMessage("Payment verification is temporarily unavailable. Checking again shortly.", false);
    } finally {
      checking = false;
    }
  }

  async function start(orderId) {
    if (started) return;
    started = true;
    active = true;
    try {
      const result = await resume(orderId, controller.signal);
      if (!active || accept(result?.payment)) return;
      const payment = result?.payment;
      if (payment?.payment_status !== "PENDING" || payment.checkout_status !== "READY"
          || !(payment.qr_string || payment.qr_image) || !payment.expires_at) {
        stop();
        onMessage(payment?.checkout_message || "This payment cannot be resumed. Please contact support.", true);
        return;
      }
      onReady(payment);
      if (!active) return;
      timer = schedule(() => poll(orderId), PAYMENT_POLL_MS);
      unwatch = watchPaymentReturn(() => poll(orderId));
      await poll(orderId);
    } catch (error) {
      if (active) {
        stop();
        onMessage(error.response?.data?.message || error.message || "Unable to resume payment.", true);
      }
    }
  }

  return { start, stop };
}
