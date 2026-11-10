import useShopping from "../../hooks/useShopping";
import {
  Heart,
  Home,
  Menu,
  Search,
  ShoppingBag,
  ShoppingCart,
  Store,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const transparentHeaderRoutes = ["/"];

const desktopLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  // { label: "Blog", to: "/blog" },
];

const mobileLinks = [
  { label: "Home", to: "/", icon: Home },
  { label: "Shop", to: "/shop", icon: Store },
  { label: "Cart", to: "/cart", icon: ShoppingCart },
  { label: "Account", to: "/account", icon: User },
];

function desktopLinkClass({ isActive }) {
  return `flex items-center gap-1.5 text-sm font-bold transition lg:text-base ${
    isActive ? "text-[#F97316]" : "text-[#111827] hover:text-[#F97316]"
  }`;
}

function mobileLinkClass({ isActive }) {
  return `flex flex-1 flex-col items-center justify-center gap-1 rounded-full py-2 text-[10px] font-bold transition-all duration-300 ease-out active:scale-95 ${
    isActive
      ? "scale-[1.03] bg-white/85 text-[#F97316] shadow-[0_10px_25px_rgba(15,23,42,0.12)] ring-1 ring-white/70"
      : "text-[#64748B] hover:bg-white/45 hover:text-[#111827]"
  }`;
}

function mobileMenuLinkClass({ isActive }) {
  return `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${
    isActive
      ? "bg-[#FFF3E8] text-[#F97316]"
      : "text-[#111827] hover:bg-[#F8FAFC] hover:text-[#F97316]"
  }`;
}

function CounterBadge({ count }) {
  return (
    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F97316] px-1 text-[11px] font-bold leading-none text-white">
      {count}
    </span>
  );
}

export default function Navbar() {
  const { cartCount, favorites } = useShopping();
  const { pathname } = useLocation();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const canUseTransparentHeader = transparentHeaderRoutes.includes(pathname);
  const shouldShowTransparentHeader = canUseTransparentHeader && !hasScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <>
      <header
        className={`inset-x-0 top-0 z-40 transition-all duration-300 ${
          shouldShowTransparentHeader
            ? "absolute border-b border-transparent bg-transparent"
            : canUseTransparentHeader
              ? "fixed border-b border-[#E5E7EB] bg-white/95 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur"
              : "sticky border-b border-[#E5E7EB] bg-white"
        }`}
      >
        <div className="mx-auto flex h-[64px] max-w-[1800px] items-center justify-between px-4 sm:px-6 md:h-[74px] lg:px-12">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="flex h-10 w-10 items-center justify-center rounded-full cursor-pointer text-[#111827] transition hover:border-[#F97316] hover:text-[#F97316] md:hidden"
            >
              {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

            <Link to="/" className="flex items-end gap-0.5 sm:gap-1">
              <span className="text-xl font-extrabold leading-none tracking-tight text-[#F97316] sm:text-2xl md:text-3xl">
                Go
              </span>
              <ShoppingBag
                size={24}
                className="-mb-0.5 text-[#F97316] sm:size-7 md:-mb-1 md:size-[34px]"
              />
              <span className="text-xl font-extrabold leading-none tracking-tight text-[#111827] sm:text-2xl md:text-3xl">
                shoes
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-4 md:flex lg:gap-9">
            {desktopLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={desktopLinkClass}
              >
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-[#111827] sm:gap-4 md:hidden">
            <button
              type="button"
              aria-label="Search"
              className="cursor-pointer transition hover:text-[#F97316]"
            >
              <Search size={20} strokeWidth={2.2} />
            </button>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative cursor-pointer transition hover:text-[#F97316]"
            >
              <Heart size={20} strokeWidth={2.2} />
              <CounterBadge count={favorites.length} />
            </Link>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative cursor-pointer transition hover:text-[#F97316]"
            >
              <Heart size={20} strokeWidth={2.2} />
              <CounterBadge count={favorites.length} />
            </Link>
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative transition hover:text-[#F97316]"
            >
              <ShoppingBag size={20} strokeWidth={2.2} />
              <CounterBadge count={cartCount} />
            </Link>
          </div>

          <div className="hidden items-center gap-6 text-[#111827] md:flex">
           

            <Link
              to="/shop"
              aria-label="Wishlist"
              className="relative transition hover:text-[#F97316]"
            >
              <button
              type="button"
              aria-label="Search"
              className="cursor-pointer transition hover:text-[#F97316]"
            >
              <Search size={22} strokeWidth={2.2} />
            </button>
            </Link>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative transition hover:text-[#F97316]"
            >
              <Heart size={22} strokeWidth={2.2} />
              <CounterBadge count={favorites.length} />
            </Link>
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative transition hover:text-[#F97316]"
            >
              <ShoppingBag size={22} strokeWidth={2.2} />
              <CounterBadge count={cartCount} />
            </Link>
            <Link
              to="/account"
              aria-label="Account"
              className="transition hover:text-[#F97316]"
            >
              <User size={22} strokeWidth={2.2} />
            </Link>
          </div>
        </div>

        <div
          className={`md:hidden ${
            isMobileMenuOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-3 opacity-0"
          } absolute left-0 right-0 top-full px-4 pt-2 transition-all duration-300 ease-out`}
        >
          <nav className="rounded-[1.5rem] border border-white/70 bg-white/95 p-2 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl">
            {desktopLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={mobileMenuLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>{link.label}</span>
                <span className="text-xs text-[#94A3B8]">/</span>
              </NavLink>
            ))}
            <NavLink to="/login" className={mobileMenuLinkClass} onClick={() => setIsMobileMenuOpen(false)}>
              <span>Account</span>
              <User size={16} />
            </NavLink>
          </nav>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-4 z-50 px-4 md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around gap-1 rounded-full border border-white/60 bg-white/65 p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.2)] backdrop-blur-sm transition-all duration-300 ease-out">
          {mobileLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.label}
                to={link.to}
                className={mobileLinkClass}
              >
                <Icon size={21} strokeWidth={2.2} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}

