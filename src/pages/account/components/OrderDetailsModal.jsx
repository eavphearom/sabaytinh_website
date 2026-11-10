import { Download, Package, ReceiptText, Truck } from "lucide-react";
import Modal from "../../../components/ui/Modal";

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
  "Pending payment": "bg-[#FFF4E8] text-[#C65A00]",
  Refunded: "bg-[#FCE7F3] text-[#BE185D]",
  Cancelled: "bg-[#FFECEF] text-[#D82745]",
};

function Badge({ children, className }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

function downloadInvoice(order) {
  const invoiceText = [
    "GO SHOES INVOICE",
    "----------------",
    `Order Code: ${order.code}`,
    `Order Date: ${order.date}`,
    `Order Status: ${order.status}`,
    `Payment Status: ${order.payment}`,
    "",
    "Product",
    `Name: ${order.product.name}`,
    `Color: ${order.product.color}`,
    `Size: ${order.product.size}`,
    `Qty: ${order.product.qty}`,
    `Price: ${order.product.price}`,
    order.items > 1 ? `Additional Items: ${order.items - 1}` : "Additional Items: 0",
    "",
    `Total Amount: ${order.total}`,
  ].join("\n");

  const blob = new Blob([invoiceText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${order.code.replace("#", "")}-invoice.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function OrderDetailsModal({ order, isOpen, onClose }) {
  if (!order) return null;

  const moreItems = order.items - 1;
  const canDownloadInvoice = order.payment === "Paid" || order.payment === "Refunded";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order Details" size="xl">
      <div className="grid gap-5">
        <div className="flex flex-col gap-4 rounded-2xl bg-[#F8FAFC] p-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-[#07182E]">{order.code}</h2>
              <Badge className={statusStyles[order.status] || statusStyles.Pending}>{order.status}</Badge>
              <Badge className={paymentStyles[order.payment] || paymentStyles.Unpaid}>{order.payment}</Badge>
            </div>
            <p className="mt-2 text-sm font-medium text-[#64748B]">{order.date}</p>
          </div>

          <button
            type="button"
            onClick={() => downloadInvoice(order)}
            disabled={!canDownloadInvoice}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#E96400] px-4 text-sm font-semibold text-white transition hover:bg-[#C95500] disabled:cursor-not-allowed disabled:bg-[#E5EAF0] disabled:text-[#94A3B8]"
          >
            <Download size={16} />
            Download Invoice
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="rounded-2xl border border-[#E8EDF3] bg-white p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#07182E]">
              <Package size={17} className="text-[#E96400]" />
              Product Preview
            </div>

            <div className="grid gap-4 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-center">
              <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-xl bg-[#F5F7FA] sm:h-24 sm:w-28">
                {order.product.image ? <img src={order.product.image} alt={order.product.name} className="h-full w-full object-contain p-3" /> : <span className="text-xs text-[#64748B]">No image</span>}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#07182E] sm:text-base">{order.product.name}</h3>
                  {moreItems > 0 && (
                    <span className="rounded-full bg-[#F4F7FB] px-3 py-1 text-xs font-semibold text-[#64748B]">
                      +{moreItems} more item{moreItems > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div className="mt-3 grid gap-2 text-xs font-medium text-[#64748B] sm:grid-cols-2">
                  <span>Color: <span className="text-[#07182E]">{order.product.color}</span></span>
                  <span>Size: <span className="text-[#07182E]">{order.product.size}</span></span>
                  <span>Qty: <span className="text-[#07182E]">{order.product.qty}</span></span>
                  <span>Price: <span className="text-[#07182E]">{order.product.price}</span></span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E8EDF3] bg-white p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#07182E]">
              <ReceiptText size={17} className="text-[#E96400]" />
              Summary
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium text-[#64748B]">Items</span>
                <span className="font-semibold text-[#07182E]">{order.items}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium text-[#64748B]">Payment</span>
                <span className="font-semibold text-[#07182E]">{order.payment}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-[#E8EDF3] pt-3">
                <span className="font-semibold text-[#07182E]">Total Amount</span>
                <span className="text-lg font-semibold text-[#E96400]">{order.total}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="rounded-2xl bg-[#FFF7F0] p-4">
          <div className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#E96400]">
              <Truck size={17} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#07182E]">Delivery update</p>
              <p className="mt-1 text-xs leading-5 text-[#64748B]">
                Your order status is currently {order.status}. Tracking details can be connected here when backend order tracking is ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
