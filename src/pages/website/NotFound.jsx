// src/pages/NotFound.jsx
import { ArrowLeft, Home, ShoppingCart, MessageCircle } from "lucide-react";

export default function NotFound({ onNavigate }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { cursor: pointer; border: none; background: none; }
      `}</style>

      <div
        style={{ fontFamily: "'DM Sans', sans-serif", background: "#FFF8F0", minHeight: "100vh" }}
        className="flex flex-col items-center justify-center px-5 py-16 text-center"
      >
        {/* Big 404 */}
        <div className="relative mb-6 select-none">
          <span
            className="text-[120px] sm:text-[160px] font-black leading-none text-stone-100"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center text-7xl">
            🍕
          </span>
        </div>

        {/* Heading */}
        <h1
          className="text-2xl sm:text-3xl font-bold text-stone-800 mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Page Not Found
        </h1>

        {/* Subtext */}
        <p className="text-stone-400 text-sm max-w-xs leading-relaxed mb-8">
          Looks like this page got eaten! The link may be broken or the page no longer exists.
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => onNavigate ? onNavigate("home") : (window.location.href = "/")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold transition-all shadow-md shadow-orange-200"
          >
            <Home size={15} /> Go Home
          </button>

          <button
            onClick={() => onNavigate ? onNavigate("menu") : (window.location.href = "/menu")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-stone-200 hover:border-orange-300 text-stone-600 text-sm font-bold transition-all"
          >
            <ShoppingCart size={15} /> Browse Menu
          </button>

        </div>

        {/* Back link */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 mt-8 text-xs text-stone-400 hover:text-orange-500 transition-colors font-medium"
        >
          <ArrowLeft size={13} /> Go back to previous page
        </button>

        {/* Brand watermark */}
        <p className="mt-10 text-xs text-stone-300" style={{ fontFamily: "'Playfair Display', serif" }}>
          VK Bakes & Pizza House
        </p>
      </div>
    </>
  );
}