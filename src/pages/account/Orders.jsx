
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import accountService from "../../services/accountService";
import ResumeOrderPayment from "./components/ResumeOrderPayment";
import OrderCard from "./components/OrderCard";
import OrderDetailsModal from "./components/OrderDetailsModal";

const money = (value) =>
  value == null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);

const statusLabel = (value) =>
  (value || "Unknown")
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");

function mapOrder(order) {
  const preview = order.preview_item;

  const apiOrigin = new URL(
    import.meta.env.VITE_API_BASE_URL || "/",
    window.location.origin
  ).origin;

  const imageBase =
    import.meta.env.VITE_IMAGE_BASE_URL ||
    `${apiOrigin}/`;

  const paymentRaw = String(
    order.payment_status ?? ""
  ).toUpperCase();

  const orderRaw = String(
    order.order_status ?? ""
  ).toUpperCase();

  return {
    id: order.id,

    code: order.order_code,

    date: new Date(order.created_at).toLocaleString(
      "en-US",
      {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ),

    items: order.total_items ?? 0,

    total: money(order.total),

    // Keep original payment status for cancellation checks.
    paymentRaw,

    // Keep original order status.
    orderRaw,

    // Preserve existing Pay Now logic.
    canPay:
      paymentRaw === "PENDING" &&
      orderRaw === "PENDING",

    payment:
      paymentRaw === "COD"
        ? "COD"
        : statusLabel(paymentRaw),

    status: statusLabel(orderRaw),

    product: {
      name:
        preview?.product_name ||
        "Product unavailable",

      color: preview?.color ?? "—",

      size: preview?.size ?? "—",

      qty: preview?.qty ?? "—",

      price: money(preview?.price),

      image: preview?.image
        ? new URL(
            preview.image,
            `${imageBase.replace(/\/$/, "")}/`
          ).href
        : undefined,
    },
  };
}

export default function Orders() {
  // Existing payment resume state.
  const [payingOrder, setPayingOrder] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState("");
  const paymentLock = useRef(false);

  // Track which order is being cancelled.
  const [cancellingOrderId, setCancellingOrderId] =
    useState(null);

  // Synchronous lock prevents duplicate cancellation requests.
  const cancelLock = useRef(false);

  const closePayment = useCallback(() => {
    paymentLock.current = false;
    setPayingOrder(null);
  }, []);

  const startPayment = (order) => {
    if (
      paymentLock.current ||
      cancelLock.current ||
      !order.canPay
    ) {
      return;
    }

    paymentLock.current = true;

    setPaymentMessage("");
    setPayingOrder(order.id);
  };

  const [status, setStatus] = useState("");

  const [filters, setFilters] = useState({
    options: [],
    loading: true,
    error: "",
  });

  const [filterAttempt, setFilterAttempt] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [searchParams] = useSearchParams();

  const linkedOrder = searchParams.get("order");

  const [page, setPage] = useState(1);

  const [attempt, setAttempt] = useState(0);

  const [result, setResult] = useState({
    orders: [],
    pagination: null,
    loading: true,
    error: "",
  });

  const { orders, pagination, loading, error } = result;

  // Existing payment success callback.
  const paymentPaid = useCallback(() => {
    closePayment();

    setPaymentMessage("");

    toast.success(
      "Payment received. Your order is paid."
    );

    setAttempt((value) => value + 1);
  }, [closePayment]);

  // Cancel a customer order.
  const handleCancel = async (order) => {
    if (
      cancelLock.current ||
      paymentLock.current
    ) {
      return;
    }

    // Frontend check. Backend must check again.
    if (
      order.paymentRaw === "PAID" ||
      !["PENDING", "PROCESSING"].includes(
        order.orderRaw
      )
    ) {
      toast.error(
        "This order cannot be cancelled."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel order #${order.code}?`
    );

    if (!confirmed) return;

    cancelLock.current = true;
    setCancellingOrderId(order.id);

    try {
      await accountService.cancelOrder(order.id);

      toast.success(
        `Order #${order.code} cancelled successfully.`
      );

      // Close stale order details, if open.
      setSelectedOrder(null);

      // Reload order history from backend.
      setAttempt((value) => value + 1);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Unable to cancel order."
      );

      // Refresh to pick up payment or status changes.
      setAttempt((value) => value + 1);
    } finally {
      cancelLock.current = false;
      setCancellingOrderId(null);
    }
  };

  // Load status filter options.
  useEffect(() => {
    const controller = new AbortController();

    async function loadFilters() {
      setFilters({
        options: [],
        loading: true,
        error: "",
      });

      try {
        const options =
          await accountService.getOrderFilters(
            controller.signal
          );

        if (!controller.signal.aborted) {
          setFilters({
            options,
            loading: false,
            error: "",
          });
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setFilters({
            options: [],
            loading: false,
            error:
              err.response?.data?.message ||
              err.message ||
              "Unable to load order filters.",
          });
        }
      }
    }

    loadFilters();

    return () => controller.abort();
  }, [filterAttempt]);

  // Load order history.
  useEffect(() => {
    const controller = new AbortController();

    async function loadOrders() {
      setResult({
        orders: [],
        pagination: null,
        loading: true,
        error: "",
      });

      try {
        const response =
          await accountService.getOrders(
            controller.signal,
            {
              pageNo: page,
              perPage: 10,
              ...(status ? { status } : {}),
            }
          );

        if (controller.signal.aborted) return;

        if (
          page > 1 &&
          Number(response.pagination?.page_no) !== page
        ) {
          throw new Error(
            "This page could not be loaded. Please try again."
          );
        }

        const mappedOrders =
          response.data.map(mapOrder);

        setResult({
          orders: mappedOrders,
          pagination: response.pagination,
          loading: false,
          error: "",
        });

        if (linkedOrder) {
          setSelectedOrder(
            mappedOrders.find(
              (order) =>
                order.code === linkedOrder
            ) ?? null
          );
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setResult({
            orders: [],
            pagination: null,
            loading: false,
            error:
              err.response?.data?.message ||
              err.message ||
              "Unable to load orders.",
          });
        }
      }
    }

    loadOrders();

    return () => controller.abort();
  }, [page, attempt, linkedOrder, status]);

  const tabs = [
    { label: "All Orders", value: "" },
    ...filters.options,
  ];

  return (
    <div className="grid gap-5">
      {/* Header */}
      <header className="rounded-2xl border border-[#E6EAF0] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.04)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E96400]">
          Orders
        </p>

        <h1 className="mt-3 font-michroma text-2xl font-semibold text-[#07182E] sm:text-3xl">
          My Orders
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64748B]">
          Review your order history, payment status,
          and delivery progress.
        </p>
      </header>

      {/* Order history */}
      <section className="rounded-2xl border border-[#E6EAF0] bg-white/70 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.04)] sm:p-5">
        {/* Status filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const isActive =
              status === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
                className={`h-10 shrink-0 cursor-pointer rounded-full px-4 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#E96400] text-white shadow-[0_10px_20px_rgba(233,100,0,0.22)]"
                    : "bg-white text-[#64748B] ring-1 ring-[#E6EAF0] hover:bg-[#FFF3E8] hover:text-[#E96400]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {filters.loading && (
          <p
            role="status"
            className="mt-3 text-xs text-[#64748B]"
          >
            Loading order filters...
          </p>
        )}

        {filters.error && (
          <div
            role="alert"
            className="mt-3 text-sm text-red-600"
          >
            <p>{filters.error}</p>

            <button
              type="button"
              onClick={() =>
                setFilterAttempt(
                  (value) => value + 1
                )
              }
              className="mt-2 underline"
            >
              Retry filters
            </button>
          </div>
        )}

        {/* Order list */}
        <div
          aria-busy={loading}
          className="mt-5 grid gap-4"
        >
          {loading && (
            <p
              role="status"
              className="text-sm text-[#64748B]"
            >
              Loading orders...
            </p>
          )}

          {error && (
            <div
              role="alert"
              className="text-sm text-red-600"
            >
              <p>{error}</p>

              <button
                type="button"
                onClick={() =>
                  setAttempt(
                    (value) => value + 1
                  )
                }
                className="mt-2 underline"
              >
                Try again
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            orders.length === 0 && (
              <p className="text-sm text-[#64748B]">
                {status
                  ? "No orders with this status."
                  : "No orders yet."}
              </p>
            )}

          {orders.map((order) => (
            <OrderCard
              key={order.code}
              order={order}
              onViewDetails={setSelectedOrder}
              onPay={startPayment}
              paymentBusy={Boolean(payingOrder)}
              onCancel={handleCancel}
              cancelBusy={cancellingOrderId !== null}
            />
          ))}
        </div>

        {/* Pagination */}
        {!loading && (pagination || page > 1) && (
          <nav
            aria-label="Order pages"
            className="mt-5 flex items-center justify-between gap-3 text-sm"
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage((value) => value - 1)
              }
              className="rounded-xl border px-4 py-2 disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-[#64748B]">
              Page {pagination?.page_no ?? page}
              {pagination
                ? ` of ${Math.max(
                    1,
                    Number(pagination.total_page)
                  )} · ${pagination.total} orders`
                : ""}
            </span>

            <button
              type="button"
              disabled={
                !pagination ||
                page >= Number(
                  pagination.total_page
                )
              }
              onClick={() =>
                setPage((value) => value + 1)
              }
              className="rounded-xl border px-4 py-2 disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        )}
      </section>

      {/* Payment status messages */}
      {paymentMessage && (
        <p
          role="status"
          className="text-sm text-[#64748B]"
        >
          {paymentMessage}
        </p>
      )}

      {/* Existing ABA PayWay resume modal */}
      {payingOrder && (
        <ResumeOrderPayment
          key={payingOrder}
          orderId={payingOrder}
          onClose={closePayment}
          onPaid={paymentPaid}
          onMessage={setPaymentMessage}
        />
      )}

      {/* Order details modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() =>
          setSelectedOrder(null)
        }
        
      />
    </div>
  );
}
