import useAuth from "../../../hooks/useAuth";
import { useState } from "react";
import { LogOut, Package, User, LayoutDashboard } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const menuItems = [
  { label: "Overview", to: "/account", icon: LayoutDashboard, end: true },
  { label: "Profile", to: "/account/profile", icon: User },
  { label: "My Orders", to: "/account/orders", icon: Package },
];

function navClass({ isActive }) {
  return `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
    isActive
      ? "bg-[#FFF3E8] text-[#E96400]"
      : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#07182E]"
  }`;
}

export default function AccountSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [failedImage, setFailedImage] = useState(null);
  const displayName = user?.username || user?.name || "My account";
  const profileImage = user?.profile;

  return (
    <aside className="rounded-2xl border border-[#E6EAF0] bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.05)] lg:sticky lg:top-24">
      <div className="flex items-center gap-3 border-b border-[#E8EDF3] pb-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FFF3E8] text-lg font-semibold text-[#E96400]">
          {profileImage && failedImage !== profileImage ? (
            <img
              src={profileImage}
              alt={`${displayName}'s profile`}
              className="h-full w-full rounded-full object-cover"
              onError={() => setFailedImage(profileImage)}
            />
          ) : (
            (user?.username || user?.name || user?.email || "U").slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#07182E]">{displayName}</p>
          <p className="mt-1 truncate text-xs font-medium text-[#64748B]">{user?.email}</p>
        </div>
      </div>

      <nav className="mt-4 grid gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={async () => { try { await logout(); } catch { /* The local session is cleared even when the server is unavailable. */ } navigate("/login"); }}
          className="mt-2 flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#E96400]"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>
    </aside>
  );
}
