
import {
  CheckCircle2,
  CreditCard,
  RefreshCw,
  Truck,
  XCircle,
  Clock3,
  Eye,
} from "lucide-react";

const statusStyles = {
  Pending: "bg-[#FFF4E8] text-[#C65A00]",
  Processing: "bg-[#FFF4E8] text-[#C65A00]",
  Shipped: "bg-[#FFF4E8] text-[#C65A00]",
  Delivered: "bg-[#E8F8F0] text-[#108657]",
  Completed: "bg-[#E8F8F0] text-[#108657]",
  "In Progress": "bg-[#FFF4E8] text-[#C65A00]",
  Cancelled: "bg-[#FFECEF] text-[#D82745]",
};

const paymentStyles = {
  Paid: "bg-[#E8F8F0] text-[#108657]",
  Unpaid: "bg-[#FFF4E8] text-[#C65A00]",
  Pending: "bg-[#FFF4E8] text-[#C65A00]",
  "Pending payment": "bg-[#FFF4E8] text-[#C65A00]",
  Refunded: "bg-[#FCE7F3] text-[#BE185D]",
  Cancelled: "bg-[#FFECEF] text-[#D82745]",
  COD: "bg-[#F1E9FF] text-[#7C3AED]",
};

const statusIcons = {
  Pending: Clock3,
  Processing: Clock3,
  Shipped: Truck,
  Delivered: CheckCircle2,
  Completed: CheckCircle2,
  Cancelled: XCircle,
};

function SoftBadge({ label, className, icon: Icon }) {
  return (
    <span
      className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ${className}`}
    >
      {Icon && <Icon size={14} />}
      {label}
    </span>
  );
}

function StatusBadge({ status }) {
  const Icon = statusIcons[status] || Clock3;

  return (
    <SoftBadge
      label={status}
      icon={Icon}
      className={statusStyles[status] || statusStyles.Pending}
    />
  );
}

function PaymentBadge({ status }) {
  return (
    <SoftBadge
      label={status}
      icon={CreditCard}
      className={paymentStyles[status] || paymentStyles.Unpaid}
    />
  );
}

function canBuyAgain(status) {
  return status === "Delivered";
}

// Only allow cancellation for unpaid, cancellable orders.
function canCancel(order) {
  const paymentStatus = String(
    order.paymentRaw ?? order.payment
  ).toUpperCase();

  return (
    paymentStatus !== "PAID" &&
    (order.status === "Pending" ||
      order.status === "Processing")
  );
}

function remainingText(count) {
  const remainingItems = count - 1;

  if (remainingItems <= 0) return null;

  return `+${remainingItems} more item${
    remainingItems > 1 ? "s" : ""
  }`;
}

export default function OrderCard({
  order,
  onViewDetails,
  onPay,
  paymentBusy = false,
  onCancel,
  cancelBusy = false,
}) {
  const product = order.product;
  const moreItems = remainingText(order.items);

  const showCancel = canCancel(order) && Boolean(onCancel);

  return (
    <article className="rounded-2xl border border-[#E8EDF3] bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <h2 className="text-xs font-semibold text-[#07182E] sm:text-sm">
              #{order.code}
            </h2>

            <p className="text-xs font-md text-[#64748B] sm:text-md">
              {order.date}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-center">
          <StatusBadge status={order.status} />
          <PaymentBadge status={order.payment} />
        </div>

        <div className="lg:min-w-[120px] lg:text-right">
          <p className="text-[11px] font-semibold text-[#94A3B8]">
            Total Amount
          </p>

          <p className="mt-1 text-xl font-semibold text-[#f88233]">
            {order.total}
          </p>
        </div>
      </div>

      <div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="grid gap-4 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-center">
            <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-xl bg-[#F5F7FA] sm:h-20 sm:w-28">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-contain p-3"
                />
              ) : (
                <span className="text-xs text-[#64748B]">
                  No image
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="line-clamp-2 text-sm font-semibold text-[#07182E]">
                  {product.name}
                </h3>

                {moreItems && (
                  <span className="rounded-full bg-[#F4F7FB] px-3 py-1.5 text-xs font-semibold text-[#64748B] shadow-sm">
                    {moreItems}
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-[#64748B]">
                <span>{product.color}</span>
                <span>Size {product.size}</span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-[#64748B]">
                <span>
                  Qty:{" "}
                  <span className="text-[#07182E]">
                    {product.qty}
                  </span>
                </span>

                <span className="font-semibold text-[#07182E]">
                  {product.price}
                </span>
              </div>
            </div>
          </div>

          {/* Order action buttons */}
          <div className="grid gap-2 sm:grid-cols-2 lg:flex lg:justify-end">
            {/* View order details */}
            <button
              type="button"
              aria-label="View Details"
              onClick={() => onViewDetails(order)}
              className="group relative inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-[#DDE5EF] bg-white px-3 text-xs font-semibold text-[#5c646f] transition hover:border-[#E96400] hover:text-[#E96400] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E96400]"
            >
              <Eye size={15} aria-hidden="true" />

              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 whitespace-nowrap rounded-lg bg-[#07182E] px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                View Details
              </span>
            </button>

            {/* Continue pending ONLINE payment */}
            {order.canPay && onPay && (
              <button
                type="button"
                disabled={paymentBusy || cancelBusy}
                onClick={() => onPay(order)}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[#E96400] px-5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {paymentBusy ? "Please wait…" : "Pay Now"}
              </button>
            )}

            {/* Buy again */}
            {canBuyAgain(order.status) && (
              <button
                type="button"
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#DDE5EF] bg-[#F8FAFC] px-5 text-xs font-semibold text-[#07182E] transition hover:border-[#E96400] hover:text-[#E96400]"
              >
                <RefreshCw size={15} />
                Buy Again
              </button>
            )}

            {/* Cancel: only show when payment is not PAID */}
            {showCancel && (
              <button
                type="button"
                aria-label={`Cancel order ${order.code}`}
                disabled={cancelBusy || paymentBusy}
                onClick={() => onCancel(order)}
                className="group relative inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#FFD8D8] bg-[#FFF5F5] px-3 text-xs font-semibold text-[#DC2626] transition hover:bg-[#FEE2E2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle size={15} aria-hidden="true" />

                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 whitespace-nowrap rounded-lg bg-[#DC2626] px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {cancelBusy ? "Cancelling..." : "Cancel"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
