import { useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";

// Components & Global Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Cart from "./components/Cart";

// Client Pages
import Home from "./pages/website/Home";
import Menu from "./pages/website/Menu";
import CustomCake from "./pages/website/CustomCake";
import ContactPage from "./pages/website/Contact";

// Admin App Panel Layout
import AdminApp from "./pages/admin/AdminApp";
// main.jsx or App.jsx — add the Toaster once at root level
import { Toaster } from "sonner";


function NavigationWrapper({ cart, add, cartQty }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Maps current path cleanly to the legacy navbar indicator
  const currentKey = location.pathname === "/" ? "home" : location.pathname.substring(1);
  
  const handleNavigation = useCallback((targetPage) => {
    const targetRoute = targetPage === "home" ? "/" : `/${targetPage}`;
    navigate(targetRoute);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] text-[#1A0A00] font-sans antialiased selection:bg-[#E8D5C0] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-[#FFF8F0] [&::-webkit-scrollbar-thumb]:bg-[#E8D5C0] [&::-webkit-scrollbar-thumb]:rounded-full">
      {/* Dynamic Header Component */}
      <Navbar page={currentKey} go={handleNavigation} cartQty={cartQty} />

      {/* Main Routed Area - pushes footer to the bottom */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home go={handleNavigation} cart={cart} add={add} />} />
          <Route path="/menu" element={<Menu cart={cart} add={add} />} />
          <Route path="/cake" element={<CustomCake />} />
          <Route path="/cart" element={<Cart cart={cart} add={add} />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Admin routes match sub-routes organically */}
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </main>

      {/* Persistent Global Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  const [cart, setCart] = useState([]);

  // Stable callback handler for mutation logic across menu cards
  const add = useCallback((item, delta = 1) => {
    setCart((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      if (!existingItem) return delta > 0 ? [...prev, { ...item, qty: 1 }] : prev;
      
      const newQty = existingItem.qty + delta;
      return newQty <= 0
        ? prev.filter((i) => i.id !== item.id)
        : prev.map((i) => (i.id === item.id ? { ...i, qty: newQty } : i));
    });
  }, []);

  const cartQty = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <Router>
      <NavigationWrapper cart={cart} add={add} cartQty={cartQty} />
      
<Toaster position="top-right" richColors />
    </Router>
  );
}