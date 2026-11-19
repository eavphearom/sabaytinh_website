// Shared UI cadence; every success still comes from backend ABA verification.
export const PAYMENT_POLL_MS = 2000;

export function watchPaymentReturn(check, {
  target = typeof window === "undefined" ? null : window,
  page = typeof document === "undefined" ? null : document,
  now = Date.now,
} = {}) {
  let lastWake = -Infinity;
  const wake = () => {
    if (page?.visibilityState === "hidden" || now() - lastWake < 1000) return;
    lastWake = now();
    // Callers retain their in-flight guard and ignore closed-session responses.
    Promise.resolve().then(check).catch(() => {});
  };
  target?.addEventListener("focus", wake);
  page?.addEventListener("visibilitychange", wake);
  return () => {
    target?.removeEventListener("focus", wake);
    page?.removeEventListener("visibilitychange", wake);
  };
}
