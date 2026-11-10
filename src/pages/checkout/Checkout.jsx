import toast from "react-hot-toast";
import { motion, useReducedMotion } from "framer-motion";
import ButtonLoading from "../../components/ui/ButtonLoading";
import checkoutService from "../../services/checkoutService";
import productService from "../../services/productService";
import {
  buildCheckoutPayload,
  calculateCheckoutTotal,
  paymentOptions,
} from "../../services/checkoutPayload";
import { removeOrderedItems } from "../../stores/shoppingStore";
import useShopping from "../../hooks/useShopping";
import PaymentQrModal from "./components/PaymentQrModal";

import { ArrowRight, Check, ShieldCheck } from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";

import bannerImage from "../../assets/banner/banner5.png";

import ceLogo from "../../assets/delivery/ce.png";
import grabLogo from "../../assets/delivery/grab.png";
import jtLogo from "../../assets/delivery/j&t.png";
import vetLogo from "../../assets/delivery/vet.png";

const discount = 0;

/* =========================================================
   PAYMENT TYPES
========================================================= */

const deliveryLogos = {
  "J&T Express": jtLogo,
  "Grab Express": grabLogo,
  "VET Express": vetLogo,
  "CE Express": ceLogo,
};

const fieldClass =
  "mt-2 h-11 rounded-xl border-[#E5EAF0] bg-[#FAFBFC] px-4 text-sm text-[#07182E] focus:border-[#E96400] focus:ring-[#E96400]/10";

/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

/* =========================================================
   REQUIRED LABEL
========================================================= */

function RequiredLabel({ children }) {
  return (
    <span className="text-xs font-semibold text-[#07182E]">
      {children}

      <span className="ml-1 text-[#E96400]">*</span>
    </span>
  );
}

/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({ step, title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-[#E6EAF0] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E96400] text-sm font-semibold text-white">
          {step}
        </span>

        <div>
          <h2 className="text-lg font-semibold text-[#07182E]">{title}</h2>

          <p className="mt-1 text-xs font-medium text-[#64748B]">{subtitle}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   PAYMENT TYPE
========================================================= */

function PaymentType({ paymentTypes, selectedType, onSelectType }) {
  return (
    <section className="rounded-2xl border border-[#E6EAF0] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-[#07182E]">Payment Type</h2>

        <p className="mt-1 text-xs font-medium text-[#64748B]">
          Choose how you would like to pay for your order.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {paymentTypes.map((payment) => {
          const isSelected = selectedType === payment.value;

          return (
            <label
              key={payment.value}
              className={`
                flex cursor-pointer items-center gap-4
                rounded-xl border p-4 transition

                ${
                  isSelected
                    ? "border-[#E96400] bg-[#E96400]/5 ring-2 ring-[#E96400]/10"
                    : "border-[#E5EAF0] hover:border-[#E96400]"
                }
              `}
            >
              <input
                type="radio"
                name="payment_type"
                value={payment.value}
                checked={isSelected}
                onChange={() => onSelectType(payment.value)}
                className="h-4 w-4 shrink-0 cursor-pointer accent-[#E96400]"
              />

              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#07182E]">
                  {payment.title}
                </p>

                <p className="mt-1 text-xs font-medium leading-5 text-[#64748B]">
                  {payment.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}

/* =========================================================
   SHIPPING INFORMATION
========================================================= */

function ShippingInformation() {
  return (
    <SectionCard
      step="1"
      title="Shipping Information"
      subtitle="Please enter your shipping details."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          name="recipient_name"
          required
          autoComplete="name"
          label={<RequiredLabel>Recipient Name</RequiredLabel>}
          placeholder="Enter recipient's name"
          className={fieldClass}
        />

        <Input
          name="recipient_phone"
          required
          type="tel"
          autoComplete="tel"
          label={<RequiredLabel>Phone Number</RequiredLabel>}
          defaultValue=""
          placeholder="Enter phone number"
          className={fieldClass}
        />

        <Textarea
          name="delivery_address"
          required
          autoComplete="street-address"
          label={<RequiredLabel>Shipping Address</RequiredLabel>}
          placeholder="eg. Street, Building, Apartment"
          className={`md:col-span-1 ${fieldClass}`}
        />
        <Textarea
          name="note"
          label="Order note (optional)"
          placeholder="Please call before delivery"
          className={fieldClass}
        />
      </div>
    </SectionCard>
  );
}

/* =========================================================
   DELIVERY METHOD
========================================================= */

function DeliveryMethod({ deliveryMethods, selectedMethod, onSelectMethod }) {
  return (
    <SectionCard
      step="2"
      title="Delivery Method"
      subtitle="Choose the delivery company for your order."
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {deliveryMethods.map((method) => {
          const isSelected = selectedMethod?.id === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelectMethod(method)}
              className={`
                cursor-pointer rounded-xl border p-3
                text-left transition hover:border-[#E96400]

                ${
                  isSelected
                    ? "border-[#E96400] ring-2 ring-[#E96400]/10"
                    : "border-[#E5EAF0]"
                }
              `}
              aria-pressed={isSelected}
            >
              <span className="flex h-11 items-center justify-center rounded-lg">
                {deliveryLogos[method.name] && (
                  <img
                    src={deliveryLogos[method.name]}
                    alt={method.name}
                    className="max-h-8 max-w-full rounded-2xl object-contain"
                  />
                )}
              </span>

              <span className="mt-2 block text-xs font-semibold text-[#07182E]">
                {method.name}
              </span>

              <span className="mt-1 flex items-center justify-between gap-2 text-[11px] font-medium text-[#64748B]">
                <span>{method.time}</span>

                <span className="font-semibold text-[#E96400]">
                  {method.fee != null
                    ? formatPrice(Number(method.fee))
                    : "Fee unavailable"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

/* =========================================================
   SUMMARY ITEM
========================================================= */

function SummaryItem({ item }) {
  return (
    <div className="grid grid-cols-[64px_1fr_auto] gap-3 border-b border-[#E8EDF3] py-4 last:border-b-0">
      <div className="flex h-14 w-16 items-center justify-center rounded-xl bg-[#F4F6F8]">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-contain p-2"
        />
      </div>

      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-[#07182E]">
          {item.name}
        </p>

        <p className="mt-1 text-[11px] font-medium text-[#64748B]">
          {item.details.join(" | ")}
        </p>

        <p className="mt-1 text-[11px] font-medium text-[#64748B]">
          Qty: {item.quantity}
        </p>
      </div>

      <p className="text-xs font-semibold text-[#07182E]">
        {formatPrice(item.price * item.quantity)}
      </p>
    </div>
  );
}

/* =========================================================
   CHECKOUT SUMMARY
========================================================= */

function CheckoutSummary({
  submitting,
  disabled,
  deliveryMethod,
  shipping,
  total,
  paymentType,
}) {
  const { cart: checkoutItems, subtotal, cartCount } = useShopping();

  const isCashOnDelivery = paymentType === "COD";

  return (
    <aside className="h-fit rounded-2xl border border-[#E6EAF0] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] lg:sticky lg:top-24">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-michroma text-xl font-semibold text-[#07182E]">
            Order Summary
          </h2>

          <p className="mt-1 text-xs font-medium text-[#64748B]">
            {cartCount} items
          </p>
        </div>

        <Link
          to="/cart"
          className="text-xs font-semibold text-[#E96400] hover:text-[#C95500]"
        >
          Edit Cart
        </Link>
      </div>

      {/* Products */}
      <div className="mt-4">
        {checkoutItems.map((item) => (
          <SummaryItem key={item.key} item={item} />
        ))}
      </div>

      {/* Price */}
      <div className="mt-5 space-y-3 border-b border-[#E8EDF3] pb-5 text-sm">
        <div className="flex justify-between gap-4">
          <span className="font-medium text-[#64748B]">Subtotal</span>

          <span className="font-semibold text-[#07182E]">
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="font-medium text-[#64748B]">
            Shipping ({deliveryMethod?.name || "Choose delivery"})
          </span>

          <span className="font-semibold text-[#07182E]">
            {shipping == null ? "Fee unavailable" : formatPrice(shipping)}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="font-medium text-[#64748B]">Discount</span>

          <span className="font-semibold text-[#12A467]">
            - {formatPrice(discount)}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="mt-5 flex items-end justify-between gap-4">
        <span className="text-base font-semibold text-[#07182E]">Total</span>

        <span className="text-2xl font-semibold text-[#E96400]">
          {total == null ? "—" : formatPrice(total)}
        </span>
      </div>

      {/* Action button */}
      <button
        type="submit"
        form="checkout-form"
        disabled={disabled || submitting}
        aria-busy={submitting}
        className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#E96400] px-5 text-sm font-semibold text-white transition hover:bg-[#C95500]"
      >
        {/* <LockKeyhole size={16} /> */}

        {submitting ? (
          <ButtonLoading>
            {isCashOnDelivery ? "Place Order" : "Checkout"}
          </ButtonLoading>
        ) : (
          <>
            {isCashOnDelivery ? "Place Order" : "Checkout"}
            <ArrowRight size={16} />
          </>
        )}
      </button>

      {/* Bottom information */}
      <div className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] font-medium text-[#64748B]">
        <ShieldCheck size={15} className="text-[#12A467]" />

        {isCashOnDelivery
          ? "Your order information is securely protected."
          : "Your payment is secured with SSL encryption."}
      </div>
    </aside>
  );
}

/* =========================================================
   ORDER SUCCESS MODAL
========================================================= */

// Brief confirmation shown only after the backend reports PAID.
function PaymentSuccessPopup() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-success-title"
        className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-[0_30px_100px_rgba(15,23,42,0.25)]"
      >
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ECFDF3]"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-12 w-12 text-[#12A467]"
            fill="none"
            aria-hidden="true"
          >
            <motion.path
              d="M5 12l4 4L19 6"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reducedMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: reducedMotion ? 0 : 0.45,
                delay: reducedMotion ? 0 : 0.15,
              }}
            />
          </svg>
        </motion.div>
        <h2
          id="payment-success-title"
          role="status"
          className="mt-5 text-xl font-semibold text-[#07182E]"
        >
          Payment Successful
        </h2>
      </div>
    </div>
  );
}

function OrderSuccessModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-[0_30px_100px_rgba(15,23,42,0.25)] sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Success Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ECFDF3]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#12A467] text-white">
            <Check size={26} strokeWidth={3} />
          </div>
        </div>

        {/* Title */}
        <h2 className="mt-6 text-2xl font-semibold text-[#07182E]">
          Order Placed Successfully!
        </h2>

        {/* Description */}
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#64748B]">
          Thank you for your order. Your order has been received and will be
          processed shortly.
        </p>

        {/* Buttons */}
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link
            to="/shop"
            className="flex h-12 items-center justify-center rounded-xl border border-[#E5EAF0] px-4 text-sm font-semibold text-[#07182E] transition hover:border-[#E96400] hover:text-[#E96400]"
          >
            Continue Shopping
          </Link>

          <Link
            to="/account/orders"
            className="flex h-12 items-center justify-center rounded-xl bg-[#E96400] px-4 text-sm font-semibold text-white transition hover:bg-[#C95500]"
          >
            View Order
          </Link>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CHECKOUT PAGE
========================================================= */

export default function Checkout() {
  // Get current cart items.
  const { cart } = useShopping();

  // Navigate to another page after checkout.
  const navigate = useNavigate();

  // Store checkout options from backend.
  const [options, setOptions] = useState(null);

  // Store error when checkout options fail to load.
  const [optionsError, setOptionsError] = useState("");

  // Trigger checkout options reload.
  const [attempt, setAttempt] = useState(0);

  // Store selected payment method.
  const [selectedPaymentType, setSelectedPaymentType] = useState("ONLINE");

  // Store selected delivery method.
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  // Control checkout button loading state.
  const [submitting, setSubmitting] = useState(false);

  // Store checkout or payment error message.
  const [error, setError] = useState("");

  // Control order success modal.
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);

  // Prevent another checkout after order creation.
  const [completed, setCompleted] = useState(false);

  // Control PayWay QR modal.
  const [isPaymentQrOpen, setIsPaymentQrOpen] = useState(false);

  // Store PayWay payment data such as QR and transaction ID.
  const [paymentData, setPaymentData] = useState(null);

  // Store created ONLINE order ID for payment checking.
  const [onlineOrderId, setOnlineOrderId] = useState(null);

  // Show payment verification loading state.
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Prevent duplicate checkout requests.
  const submissionLock = useRef(false);

  // Prevent overlapping payment-check requests.
  const paymentSession = useRef(null);

  // Load delivery methods and payment methods.
  useEffect(() => {
    const controller = new AbortController();

    const loadCheckoutOptions = async () => {
      setOptionsError("");

      try {
        const data = await checkoutService.getOptions(controller.signal);

        // Ignore response if component request was cancelled.
        if (controller.signal.aborted) return;

        setOptions(data);

        // Select the first available delivery by default.
        setSelectedDelivery(data.deliveries?.[0] ?? null);

        // Select the first available payment method by default.
        // setSelectedPaymentType(
        //   paymentOptions(data["payment-methods"])[1]?.value ?? "",
        // );
        setSelectedPaymentType("ONLINE");
      } catch (error) {
        // Do not show an error for an intentionally cancelled request.
        if (!controller.signal.aborted) {
          setOptionsError(
            error.response?.data?.message ||
              error.message ||
              "Unable to load checkout options.",
          );
        }
      }
    };

    loadCheckoutOptions();

    // Cancel the request when component reloads/unmounts.
    return () => controller.abort();
  }, [attempt]);

  // Convert backend payment methods into frontend options.
  const payments = paymentOptions(options?.["payment-methods"]);

  // Get selected delivery fee.
  const fee = selectedDelivery?.fee;

  // Validate shipping fee before calculating total.
  const shipping =
    fee != null &&
    fee !== "" &&
    Number.isFinite(Number(fee)) &&
    Number(fee) >= 0
      ? Number(fee)
      : null;

  // Calculate checkout total using current cart and shipping.
  const total =
    shipping == null ? null : calculateCheckoutTotal(cart, shipping);

  // Manual checks and polling share one lock and ignore stale responses.
  const checkOnlinePayment = useCallback(async () => {
    const session = paymentSession.current;
    if (
      !session?.active ||
      session.terminal ||
      session.checking ||
      !onlineOrderId
    )
      return false;
    session.checking = true;
    setCheckingPayment(true);
    try {
      const response = await checkoutService.checkPayment(onlineOrderId);
      if (
        !session.active ||
        session !== paymentSession.current ||
        session.terminal
      )
        return false;
      const status = response.data?.payment_status?.toUpperCase();
      const messages = {
        FAILED:
          "Payment failed. Your order was created but payment was not completed.",
        CANCELLED: "Payment was cancelled.",
        EXPIRED: "Payment QR has expired.",
      };
      if (status !== "PAID" && !messages[status]) return false;

      // Stop immediately for every terminal status, before closing the QR.
      session.terminal = true;
      session.active = false;
      window.clearInterval(session.interval);
      setIsPaymentQrOpen(false);
      if (status === "PAID") {
        setIsPaymentSuccessOpen(true);
      } else {
        toast.error(messages[status], {
          id: "payment-" + onlineOrderId,
          duration: 5000,
        });
      }
      return status === "PAID";
    } catch (error) {
      // A temporary network error leaves the payment pending and polling active.
      if (session.active) console.error("Payment status check failed:", error);
      return false;
    } finally {
      session.checking = false;
      if (session === paymentSession.current) setCheckingPayment(false);
    }
  }, [onlineOrderId]);

  // Own the polling session so closing/navigating cannot process a late response.
  useEffect(() => {
    if (!isPaymentQrOpen || !onlineOrderId) return;
    const session = {
      active: true,
      terminal: false,
      checking: false,
      interval: null,
    };
    paymentSession.current = session;
    session.interval = window.setInterval(checkOnlinePayment, 4000);
    queueMicrotask(checkOnlinePayment);
    return () => {
      session.active = false;
      window.clearInterval(session.interval);
      if (paymentSession.current === session) paymentSession.current = null;
    };
  }, [isPaymentQrOpen, onlineOrderId, checkOnlinePayment]);

  // Let the check animation finish, then hand off to the existing order modal.
  useEffect(() => {
    if (!isPaymentSuccessOpen) return;
    const timer = window.setTimeout(() => {
      setIsPaymentSuccessOpen(false);
      setIsOrderSuccessOpen(true);
    }, 1250);
    return () => window.clearTimeout(timer);
  }, [isPaymentSuccessOpen]);

  // Submit checkout and create the order.
  const handleSubmitOrder = async (event) => {
    event.preventDefault();

    // Prevent invalid or duplicate checkout requests.
    if (
      submissionLock.current ||
      completed ||
      !options ||
      !selectedDelivery ||
      shipping == null
    ) {
      return;
    }

    // Read customer information from checkout form.
    const fields = Object.fromEntries(new FormData(event.currentTarget));

    // Copy cart items before removing them later.
    const ordered = cart.map((item) => ({ ...item }));

    submissionLock.current = true;
    setSubmitting(true);
    setError("");

    try {
      // Resolve missing variant stock IDs from older saved cart items.
      const products = new Map();

      for (const item of ordered) {
        if (item.variantStockId) continue;

        // Load product only once when multiple cart items use it.
        if (!products.has(item.productId)) {
          const response = await productService.getById(item.productId);

          products.set(item.productId, response.data);
        }

        // Find the selected product variant.
        const variant = products
          .get(item.productId)
          ?.variants?.find(
            (variant) => String(variant.id) === String(item.variantId),
          );

        // Find stock record for the selected size.
        const stock = variant?.stock?.find(
          (entry) => String(entry.size_id) === String(item.sizeId),
        );

        // Keep backward compatibility with old size response.
        const size = variant?.sizes?.find(
          (entry) => String(entry.size_id) === String(item.sizeId),
        );

        item.variantStockId = stock?.id ?? size?.variant_stock_id;
      }

      // Build the backend checkout request.
      const payload = buildCheckoutPayload(
        fields,
        selectedDelivery.id,
        selectedPaymentType,
        ordered,
        shipping,
      );

      // Create order and payment in backend.
      const response = await checkoutService.submit(payload);

      const order = response.data;
      const payment = order.payments?.[0];

      // Order now exists, so prevent another checkout submission.
      setCompleted(true);

      // ONLINE payment must show PayWay QR before success.
      if (selectedPaymentType === "ONLINE") {
        if (
          !payment ||
          payment.checkout_status !== "READY" ||
          !payment.qr_string
        ) {
          setError(
            payment?.checkout_message ||
              "Your order was created, but the payment QR is not available.",
          );

          return;
        }

        // Save order ID for payment status polling.
        setOnlineOrderId(order.id);

        // Save QR and PayWay payment information.
        setPaymentData(payment);

        // Open real PayWay QR modal.
        setIsPaymentQrOpen(true);
      } else {
        // COD can show order success immediately.
        setIsOrderSuccessOpen(true);
      }

      // Remove successfully ordered items from local cart.
      try {
        removeOrderedItems(ordered);
      } catch {
        setError(
          "Your order was placed, but the saved cart could not be cleared. Please remove the ordered items from your cart.",
        );
      }
    } catch (error) {
      // Show checkout API error.
      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to place your order.",
      );
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  };

  // Return to cart when there are no items before checkout.
  if (cart.length === 0 && !completed) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <div className="overflow-hidden bg-[#F7FAFC]">
      {/* =========================
          CHECKOUT BANNER
         ========================= */}
      <section className="relative overflow-hidden bg-[#EEF4F8] px-4 py-8 sm:px-6 lg:px-8">
        <img
          src={bannerImage}
          alt="Checkout banner"
          className="absolute inset-y-0 right-0 hidden h-full w-[58%] object-cover object-center opacity-90 md:block"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#EEF4F8] via-[#EEF4F8]/90 to-[#EEF4F8]/25" />

        <div className="relative mx-auto max-w-[1280px]">
          {/* Checkout breadcrumb. */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
            <Link to="/" className="transition hover:text-[#E96400]">
              Home
            </Link>

            <span>/</span>

            <Link to="/cart" className="transition hover:text-[#E96400]">
              Cart
            </Link>

            <span>/</span>

            <span>Checkout</span>
          </div>

          {/* Checkout page title. */}
          <h1 className="mt-3 font-michroma text-3xl font-semibold text-[#07182E] sm:text-4xl">
            Checkout
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-6 text-[#64748B]">
            Complete your order and make payment securely.
          </p>
        </div>
      </section>

      {/* =========================
          CHECKOUT OPTIONS ERROR
         ========================= */}
      {optionsError && (
        <div
          role="alert"
          className="mx-auto max-w-[1280px] px-6 pt-6 text-red-500"
        >
          {optionsError} {/* Reload checkout options after an error. */}
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Show when backend has no delivery methods. */}
      {options && !options.deliveries.length && (
        <p
          role="alert"
          className="mx-auto max-w-[1280px] px-6 pt-6 text-red-500"
        >
          No delivery methods are available.
        </p>
      )}

      {/* =========================
          CHECKOUT FORM
         ========================= */}
      <form
        id="checkout-form"
        onSubmit={handleSubmitOrder}
        className="mx-auto grid max-w-[1280px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-10 xl:grid-cols-[minmax(0,1fr)_390px]"
      >
        {/* Left side checkout information. */}
        <fieldset
          disabled={submitting || completed || !options}
          className="grid min-w-0 gap-5"
        >
          {/* Show loading before checkout settings arrive. */}
          {!options && !optionsError && (
            <p role="status">Loading checkout options...</p>
          )}

          {/* Show checkout/payment error. */}
          {error && (
            <p role="alert" className="text-sm text-red-500">
              {error}
            </p>
          )}

          {/* Select COD or ONLINE payment. */}
          {/* <PaymentType
            paymentTypes={payments}
            selectedType={selectedPaymentType}
            onSelectType={setSelectedPaymentType}
          /> */}

          {/* Enter customer shipping information. */}
          <ShippingInformation />

          {/* Select available delivery service. */}
          <DeliveryMethod
            deliveryMethods={options?.deliveries ?? []}
            selectedMethod={selectedDelivery}
            onSelectMethod={setSelectedDelivery}
          />
        </fieldset>

        {/* Right side order summary. */}
        <CheckoutSummary
          paymentType={selectedPaymentType}
          submitting={submitting}
          disabled={
            !options ||
            !selectedDelivery ||
            shipping == null ||
            completed ||
            !payments.length
          }
          deliveryMethod={selectedDelivery}
          shipping={shipping}
          total={total}
        />
      </form>

      {/* =========================
          PAYWAY QR MODAL
         ========================= */}
      <PaymentQrModal
        isOpen={isPaymentQrOpen}
        onClose={() => {
          // Stop immediately; ignore any response already in flight.
          if (paymentSession.current) {
            paymentSession.current.active = false;
            window.clearInterval(paymentSession.current.interval);
          }
          setIsPaymentQrOpen(false);
        }}
        payment={paymentData}
        total={paymentData?.amount ?? total}
        checkingPayment={checkingPayment}
        onPaid={checkOnlinePayment}
        size="sm"
      />

      {/* =========================
          ORDER SUCCESS MODAL
         ========================= */}
      {isPaymentSuccessOpen && <PaymentSuccessPopup />}

      <OrderSuccessModal
        isOpen={isOrderSuccessOpen}
        onClose={() => navigate("/account/orders")}
      />
    </div>
  );
}
