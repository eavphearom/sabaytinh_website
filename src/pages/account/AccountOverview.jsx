import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, ShoppingBag } from "lucide-react";
import accountService from "../../services/accountService";
import AccountStatCard from "./components/AccountStatCard";
import RecentOrders from "./components/RecentOrders";

const formatOrder = (order) => ({
  code: order.order_code,
  date: new Date(order.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }),
  total: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(order.total),
  status: (order.order_status || "Unknown").toLowerCase()
    .split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
});

export default function AccountOverview() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    accountService.getOverview(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setOverview(data);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err.response?.data?.message || err.message || "Unable to load account overview.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    accountService.getOrders(controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) {
          setRecentOrders(response.data.map(formatOrder));
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setOrdersError(err.response?.data?.message || err.message || "Unable to load recent orders.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setOrdersLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="grid gap-5">
      <header className="rounded-2xl border border-[#E6EAF0] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.04)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E96400]">Account Overview</p>
        <h1 className="mt-3 font-michroma text-2xl font-semibold text-[#07182E] sm:text-3xl">My Account</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64748B]">
          Welcome back, Bunheng. Manage your profile and follow your latest Go Shoes orders in one clean place.
        </p>
      </header>

      {loading && <p role="status" className="text-sm text-[#64748B]">Loading account overview...</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <div aria-busy={loading} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AccountStatCard icon={ShoppingBag} value={overview?.total_orders ?? "—"} label="Total Orders" />
        <AccountStatCard icon={Clock3} value={overview?.in_progress ?? "—"} label="In Progress" tone="blue" />
        <AccountStatCard icon={CheckCircle2} value={overview?.completed ?? "—"} label="Completed" tone="green" />
      </div>

      {/* <section className="rounded-2xl border border-[#E6EAF0] bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF3E8] text-[#E96400]">
              <PackageCheck size={19} />
            </div>
            <h2 className="mt-3 text-lg font-semibold text-[#07182E]">Profile Information</h2>
            <p className="mt-1 text-sm font-medium text-[#64748B]">Your main account details.</p>
          </div>
          <Link
            to="/account/profile"
            className="inline-flex h-10 w-fit items-center justify-center rounded-xl bg-[#E96400] px-4 text-sm font-semibold text-white transition hover:bg-[#C95500]"
          >
            Edit Profile
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {profileInfo.map((item) => (
            <div key={item.label} className="rounded-xl bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase text-[#94A3B8]">{item.label}</p>
              <p className="mt-2 text-sm font-semibold text-[#07182E]">{item.value}</p>
            </div>
          ))}
        </div>
      </section> */}

      <RecentOrders orders={recentOrders} loading={ordersLoading} error={ordersError} />
    </div>
  );
}
