// src/pages/Home.jsx
import { useEffect, useState, } from "react";
import { useLocation } from "react-router-dom";
import { C, REVIEWS, FRESH_BOARD } from "../../data/menu";
import { HelpCircle } from "lucide-react"
import Footer from "../../components/Footer";
import HomeComboSection from "../../components/homeCombo";
import ReviewsSection from "../website/Reviews";
import { useFQAStore, useStoreStore, useMenuStore } from "../../store";
import ItemCard from "../../components/ItemCard";
import { FaqItem } from "../../section/FqaItem";
import { toast } from "sonner";


// ── Category config ───────────────────────────────────────────
const CATS = [
  { key: "pizza", label: "Pizza", emoji: "🍕" },
  { key: "cake", label: "Cake", emoji: "🎂" },
  { key: "cookies", label: "Cookies", emoji: "🍪" },
  { key: "ice", label: "Ice Cream", emoji: "🍦" },
];



// ─────────────────────────────────────────────────────────────
const Home = ({ go, cart, add }) => {
  const { store, fetchStore } = useStoreStore();
  const { FAQS, fetchFaqs } = useFQAStore();

  const {
    items,
    loading,
    fetchMenu,
    setCategory,
  } = useMenuStore();

  const [cat, setCat] = useState("pizza");
const location =
  useLocation();

  // ── Fetch store info once ─────────────────────────────────
  useEffect(() => {
    fetchStore();
    fetchFaqs();
  }, []);


  // ── Fetch menu on mount and when category changes ─────────
  useEffect(() => {
    fetchMenu({ category: cat === "Pizza" ? null : cat });
  }, [fetchMenu, cat]);

  const handleCategoryChange = (category) => {
    setCat(category);
    setCategory(category);
    fetchMenu({ category: category === "Pizza" ? null : category });
  };

  // Featured = Bestseller tag, or first 6 if none tagged
  const featured = items.filter((i) => i.tag === "Bestseller").slice(0, 6);
  const displayItems = items.slice(0, 4);




  // Component ke andar
  const specials = useStoreStore((s) => s.specials);


  return (
    <div style={{ background: C.bg }}>

      {/* ── Hero ───────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg,${C.dark} 0%,${C.mid} 70%)`,
        padding: "64px 16px 52px",
        textAlign: "center",
      }}>
        <div style={{ fontFamily: C.f2, color: C.gold, fontSize: 12, letterSpacing: 3, marginBottom: 12 }}>
          🍕 {store?.tagline?.toUpperCase()}
        </div>
        <h1  style={{
          fontFamily: C.f1, color: "#FFF8F0",
          fontSize: "clamp(34px,7vw,60px)", fontWeight: 700,
          lineHeight: 1.1, marginBottom: 14,
        }}>
          VK Bakes &<br /><span style={{ color: C.red }}>Pizza House</span>
        </h1>
        <p style={{ fontFamily: C.f2, color: "#C8A882", fontSize: 15, maxWidth: 440, margin: "0 auto 28px" }}>
          {store?.discription}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => go("menu")}
            style={{ background: C.red, color: "white", padding: "13px 28px", borderRadius: 8, fontFamily: C.f2, fontWeight: 700, fontSize: 14 }}
          >
            Order Now 🛒
          </button>
          <button
            onClick={() => go("cake")}
            style={{ background: "transparent", color: C.gold, border: `2px solid ${C.gold}`, padding: "13px 28px", borderRadius: 8, fontFamily: C.f2, fontWeight: 700, fontSize: 14 }}
          >
            Custom Cake 🎂
          </button>
        </div>
      </div>

      {/* ── Fresh Board ─────────────────────────────────────── */}
      <div style={{ padding: "24px 16px", background: "#FFF0E8" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", border: `2px solid ${C.red}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ background: C.red, padding: "9px 16px" }}>
            <span style={{ fontFamily: C.f2, fontWeight: 700, color: "white", fontSize: 13, letterSpacing: 1 }}>
              🟢 TODAY'S FRESH BOARD
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
            {FRESH_BOARD.map((f, i) => (
              <div key={i} style={{
                padding: "12px 14px",
                borderRight: i < 3 ? `1px solid ${C.border}` : undefined,
                background: i % 2 ? "white" : "#FFF8F4",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: f.up ? "#22C55E" : "#EF4444" }} />
                  <span style={{ fontFamily: C.f2, fontWeight: 600, fontSize: 13, color: C.mid }}>{f.name}</span>
                </div>
                <div style={{ fontFamily: C.f2, fontSize: 11, color: C.muted }}>{f.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Specials ────────────────────────────────────────── */}


<div className="bg-[#3D1A00] px-4 py-6">
  <div className="mx-auto max-w-6xl">
    
    <div className="mb-3 font-semibold text-center text-[15px] tracking-[3px] text-[#D4A574]">
      🔥 TODAY'S SPECIALS
    </div>

    {specials?.length > 0 ? (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {specials.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border-l-4 border-red-600 bg-[#4A2105] p-4 shadow-sm"
          >
            <span className="text-2xl">
              {item.e}
            </span>

            <div>
              <h3 className="text-sm font-bold text-[#FFF8F0]">
                {item.t}
              </h3>

              <p className="text-xs text-[#D4A574]">
                {item.d}
              </p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="rounded-lg bg-[#4A2105] p-5 text-center text-sm text-[#D4A574]">
        😴 Aaj koi special offer nahi hai —
        kal dobara check karein!
      </div>
    )}
  </div>
  {/* <HomeComboSection  onNavigate={(page, params) => setPage(page)} /> */}
</div>

      {/* ── Category filter + Items grid ─────────────────────── */}
      <div style={{ padding: "36px 16px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          {/* Section heading */}
          <div style={{ fontFamily: C.f2, color: C.muted, fontSize: 11, letterSpacing: 3, marginBottom: 6 }}>
            {cat === "pizza" ? "POPULAR PICKS" : "BROWSE CATEGORY"}
          </div>
          <h2 style={{ fontFamily: C.f1, color: C.mid, fontSize: 26, fontWeight: 700, marginBottom: 20 }}>
            {`${CATS.find(c => c.key === cat)?.emoji} ${CATS.find(c => c.key === cat)?.label}`} </h2>

          {/* ── Category tabs ─────────────────────────────── */}
          <div className="flex gap-2 flex-wrap mb-6">
            {CATS.map((c) => (
              <button
                key={c.key}
                onClick={() => handleCategoryChange(c.key)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  fontFamily: C.f2,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  border: cat === c.key ? "none" : `1px solid ${C.border}`,
                  background: cat === c.key ? C.red : "white",
                  color: cat === c.key ? "white" : C.mid,
                  boxShadow: cat === c.key ? "0 2px 8px rgba(212,75,26,0.25)" : "none",
                }}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          {/* ── Items grid ────────────────────────────────── */}
          {loading ? (
            // Skeleton loader
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 20 }}>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  style={{ height: 280, borderRadius: 16, background: "#F0E0D0", opacity: 0.5 }}
                  className="animate-pulse"
                />
              ))}
            </div>
          ) : displayItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: C.muted, fontFamily: C.f2 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
              <p style={{ fontSize: 15, fontWeight: 600 }}>No items in this category yet</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Check back soon!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 20 }}>
              {displayItems.map((item) => (
                <ItemCard key={item._id || item.id} item={item} cart={cart} add={add} />
              ))}
            </div>
          )}

          <button
            onClick={() => go("menu")}
            style={{ background: C.red, color: "white", padding: "11px 24px", borderRadius: 8, fontFamily: C.f2, fontWeight: 600, fontSize: 14 }}
          >
            View Full Menu →
          </button>
        </div>
      </div>
      {/* <Reviews /> */}
  <ReviewsSection
  autoOpen={
    location.pathname ===
    "/reviews"
  }
/>

      {/* FAQ Section */}
      <div className="mt-12 px-5 mx-auto mb-4">
        <div className="flex ml-3  items-center gap-2 mb-6">
          <HelpCircle size={18} className="text-orange-500" />
          <h2 className="text-xl font-bold text-stone-800" style={{ fontFamily: C.f1 }}>
            Frequently Asked Questions
          </h2>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 px-6">
          {FAQS.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} last={i === FAQS.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;