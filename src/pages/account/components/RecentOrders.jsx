import { Link } from "react-router-dom";

const statusStyles = {
  Pending: "bg-[#FFF7ED] text-[#E96400]",
  Processing: "bg-[#EFF6FF] text-[#2563EB]",
  "In Progress": "bg-[#EFF6FF] text-[#2563EB]",
  Completed: "bg-[#ECFDF3] text-[#12A467]",
  Shipped: "bg-[#F0F9FF] text-[#0284C7]",
  Delivered: "bg-[#ECFDF3] text-[#12A467]",
  Cancelled: "bg-[#FEF2F2] text-[#DC2626]",
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] || statusStyles.Pending}`}>
      {status}
    </span>
  );
}

export default function RecentOrders({ orders = [], showViewAll = true, loading = false, error = "" }) {
  return (
    <section className="rounded-2xl border border-[#E6EAF0] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#07182E]">Recent Orders</h2>
          <p className="mt-1 text-sm font-medium text-[#64748B]">Track your latest purchases and delivery progress.</p>
        </div>
        {showViewAll && (
          <Link to="/account/orders" className="text-sm font-semibold text-[#E96400] transition hover:text-[#C95500]">
            View All Orders
          </Link>
        )}
      </div>

      {loading ? (
        <p role="status" className="mt-5 text-sm text-[#64748B]">Loading recent orders...</p>
      ) : error ? (
        <p role="alert" className="mt-5 text-sm text-red-600">{error}</p>
      ) : orders.length === 0 ? (
        <p className="mt-5 text-sm text-[#64748B]">No orders yet.</p>
      ) : (
        <>
      <div className="mt-5 hidden overflow-hidden rounded-xl border border-[#E8EDF3] md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F8FAFC] text-xs uppercase text-[#64748B]">
            <tr>
              <th className="px-4 py-3 font-semibold">Order Code</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8EDF3]">
            {orders.map((order) => (
              <tr key={order.code} className="text-[#07182E]">
                <td className="px-4 py-4 font-semibold">{order.code}</td>
                <td className="px-4 py-4 text-[#64748B]">{order.date}</td>
                <td className="px-4 py-4 font-semibold">{order.total}</td>
                <td className="px-4 py-4"><StatusBadge status={order.status} /></td>
                <td className="px-4 py-4 text-right">
                  <Link to={`/account/orders?order=${encodeURIComponent(order.code)}`} className="font-semibold text-[#E96400] hover:text-[#C95500]">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-3 md:hidden">
        {orders.map((order) => (
          <article key={order.code} className="rounded-xl border border-[#E8EDF3] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#07182E]">{order.code}</p>
                <p className="mt-1 text-xs font-medium text-[#64748B]">{order.date}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-sm font-semibold text-[#07182E]">{order.total}</span>
              <Link to={`/account/orders?order=${encodeURIComponent(order.code)}`} className="text-sm font-semibold text-[#E96400]">
                View Details
              </Link>
            </div>
          </article>
        ))}
      </div>
        </>
      )}
    </section>
  );
}
