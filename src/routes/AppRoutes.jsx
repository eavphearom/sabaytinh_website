import GoogleCallbackPage from "../pages/Auth/GoogleCallbackPage";
import RequireAuth from "../components/common/RequireAuth";
import { Route, Routes } from "react-router-dom";
import LoginPage from "../pages/Auth/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import MainLayout from "../components/layout/MainLayout";
import Home from "../pages/Home/Home";
import Shop from "../pages/shop/Shop";
import About from "../pages/about/About";
import Blog from "../pages/blog/Blog";
import Contact from "../pages/contact/Contact";
import Wishlist from "../pages/wishlist/Wishlist";
import Cart from "../pages/cart/Cart";
import Checkout from "../pages/checkout/Checkout";
import ProductDetail from "../pages/product/ProductDetail";
import RegisterPage from "../pages/Auth/RegisterPage";
import AccountLayout from "../pages/account/AccountLayout";
import AccountOverview from "../pages/account/AccountOverview";
import Profile from "../pages/account/Profile";
import Orders from "../pages/account/Orders";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/account" element={<RequireAuth><AccountLayout /></RequireAuth>}>
          <Route index element={<AccountOverview />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<Orders />} />
        </Route>
      </Route>

      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
