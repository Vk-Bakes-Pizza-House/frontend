// Layout Wrapper
// ─────────────────────────────────────────────


import { useState, useCallback } from "react";
import {
  Routes,
  Route,
  BrowserRouter
} from "react-router-dom";

// Layout
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";

// Pages
import Home from "../pages/website/Home";
import Menu from "../pages/website/Menu";
import MenuApp from "../components/MenuApp";
import CustomCake from "../pages/website/CustomCake";
import ContactPage from "../pages/website/Contact";
import Cart from "../components/Cart";
import PizzaDetail from "../pages/website/DetailsPizza";
import HowToOrder from "../pages/website/HowToOrder";

// Admin
import AdminApp from "../pages/admin/AdminApp";


export default function LayoutWrapper() {
  const navigate = useNavigate();
  const location = useLocation();

  // Check admin page
  const isAdminPage =
    location.pathname.startsWith("/admin");

  // Current page key
  const currentPage =
    location.pathname === "/"
      ? "home"
      : location.pathname.slice(1);

  // Navigation handler
  const handleNavigation = useCallback(
    (page) => {
      const route =
        page === "home"
          ? "/"
          : `/${page}`;

      navigate(route);
    },
    [navigate]
  );

  return (
    <div
      className="
        min-h-screen
        flex flex-col
        bg-[#FFF8F0]
        text-[#1A0A00]
        font-sans
      "
    >

      {/* Hide Navbar on Admin */}
      {!isAdminPage && (
        <Navbar
          page={currentPage}
          go={handleNavigation}
        />
      )}

      {/* Main Content */}
      <main className="flex-1">

        <Routes>

          {/* Website */}
          <Route
            path="/"
            element={
              <Home
                go={handleNavigation}
              />
            }
          />

          <Route
            path="/menu"
            element={
              <Menu />
            }
          />

          <Route
            path="/scan"
            element={<MenuApp />}
          />

          <Route
            path="/cake"
            element={<CustomCake />}
          />

          <Route
            path="/contact"
            element={<ContactPage />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/menu/pizza/details"
            element={<PizzaDetail />}
          />

          <Route
            path="/how-to-order"
            element={<HowToOrder />}
          />

          {/* Admin */}
          <Route
            path="/admin/*"
            element={<AdminApp />}
          />

        </Routes>

      </main>

      {/* Hide Footer + WhatsApp on Admin */}
      {!isAdminPage && (
        <>
          <WhatsAppButton />
          <Footer onNavigate={handleNavigation} />
        </>
      )}

    </div>
  );
}
