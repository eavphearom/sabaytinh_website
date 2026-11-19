import { useEffect, useRef, useState } from "react";
import { Download, ArrowLeft, ReceiptText } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import invoiceService from "../../../services/invoiceService";
import { invoiceError, saveInvoicePdf } from "../../../services/invoiceDownload";

export default function InvoiceModal({ orderId, onClose }) {
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const busy = useRef(false);
  const request = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    request.current = controller;
    invoiceService.get(orderId, controller.signal).then(data => { if (!controller.signal.aborted) setInvoice(data); }).catch(async failure => {
      const message = await invoiceError(failure);
      if (!controller.signal.aborted) setError(message);
    });
    return () => controller.abort();
  }, [orderId]);
  const download = async () => {
    if (busy.current || !invoice) return;
    busy.current = true; setDownloading(true); setError("");
    try {
      const blob = await invoiceService.pdf(orderId, request.current.signal);
      if (!request.current.signal.aborted) await saveInvoicePdf(blob, invoice.id);
    } catch (failure) {
      const message = await invoiceError(failure);
      if (!request.current.signal.aborted) setError(message);
    } finally { busy.current = false; setDownloading(false); }
  };
  const money = value => `${invoice.currency} ${value}`;
  return <Modal isOpen onClose={onClose} title="Invoice" size="xl">
    <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
      <button onClick={onClose} className="flex items-center gap-2 text-sm font-medium text-slate-500"><ArrowLeft size={16} /> Order details</button>
      <button onClick={download} disabled={!invoice || downloading} className="flex items-center gap-2 rounded-xl bg-[#E96400] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"><Download size={17} />{downloading ? "Preparing PDF..." : "Download PDF"}</button>
    </div>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {!invoice && !error && <p role="status" className="p-12 text-center text-slate-500">Loading invoice...</p>}
    {invoice && <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-9">
      <header className="flex flex-wrap justify-between gap-5 border-b-2 border-orange-500 pb-7">
        <div><p className="text-xl font-extrabold tracking-widest text-[#10243A]">GO SHOES<span className="text-orange-500">.</span></p><p className="mt-2 text-sm text-slate-500">Order invoice</p></div>
        <div className="sm:text-right"><h2 className="text-3xl font-semibold tracking-wide text-[#10243A]">INVOICE</h2><p className="mt-2 text-sm text-slate-500">{invoice.invoice_no}</p>
          <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${invoice.payment_status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>{invoice.payment_status}</span></div>
      </header>
      <div className="grid gap-6 py-7 sm:grid-cols-2">
        <section><h3 className="mb-3 text-xs font-bold tracking-widest text-slate-400">BILL TO / DELIVER TO</h3><p className="font-semibold text-slate-900">{invoice.recipient_name}</p><p className="mt-1 text-sm text-slate-500">{invoice.recipient_phone}</p><p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-500">{invoice.delivery_address}</p></section>
        <dl className="grid grid-cols-[auto_1fr] content-start gap-x-4 gap-y-2 text-sm"><dt className="text-slate-500">Order</dt><dd className="break-all font-semibold sm:text-right">{invoice.order_code}</dd><dt className="text-slate-500">Issued</dt><dd className="sm:text-right">{invoice.issued_at || "-"}</dd><dt className="text-slate-500">Delivery</dt><dd className="sm:text-right">{invoice.delivery_method_name}</dd>{invoice.paid_at && <><dt className="text-slate-500">Paid at</dt><dd className="sm:text-right">{invoice.paid_at}</dd></>}</dl>
      </div>
      <div className="overflow-x-auto"><table className="w-full min-w-[540px] text-left text-sm"><thead className="bg-orange-50 text-xs uppercase text-slate-600"><tr><th className="rounded-l-lg p-3">Item</th><th className="p-3 text-right">Qty</th><th className="p-3 text-right">Unit price</th><th className="rounded-r-lg p-3 text-right">Amount</th></tr></thead><tbody>{invoice.items.map(item => <tr key={item.id} className="border-b border-slate-100"><td className="max-w-[260px] break-words p-3"><p className="font-semibold text-slate-900">{item.product_name}</p><p className="mt-1 text-xs text-slate-500">{[item.color_name, item.size_name, item.sku].filter(Boolean).join(" / ")}</p></td><td className="p-3 text-right">{item.quantity}</td><td className="whitespace-nowrap p-3 text-right">{money(item.unit_price)}</td><td className="whitespace-nowrap p-3 text-right font-semibold">{money(item.subtotal)}</td></tr>)}</tbody></table></div>
      {!invoice.items.length && <p className="py-5 text-sm text-slate-500">No available item records.</p>}
      <dl className="ml-auto mt-6 grid max-w-sm grid-cols-2 gap-y-3 text-sm"><dt className="text-slate-500">Subtotal</dt><dd className="text-right">{money(invoice.subtotal)}</dd><dt className="text-slate-500">Delivery</dt><dd className="text-right">{money(invoice.shipping_fee)}</dd><dt className="text-slate-500">Discount</dt><dd className="text-right">- {money(invoice.discount_amount)}</dd><dt className="rounded-l-xl bg-orange-50 p-4 font-bold">TOTAL</dt><dd className="rounded-r-xl bg-orange-50 p-4 text-right font-bold text-orange-600">{money(invoice.total_amount)}</dd></dl>
      <footer className="mt-8 border-t border-slate-100 pt-5"><p className="flex items-center gap-2 text-sm font-semibold text-slate-700"><ReceiptText size={16} className="text-orange-500" />Thank you for shopping with Go Shoes.</p><p className="mt-2 text-xs leading-5 text-slate-400">This invoice reflects the recorded payment status. An unpaid invoice is not proof of payment.</p></footer>
    </article>}
  </Modal>;
}
