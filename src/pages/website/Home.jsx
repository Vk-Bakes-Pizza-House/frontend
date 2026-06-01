// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { C, REVIEWS, FRESH_BOARD } from "../../data/menu";
import { HelpCircle } from "lucide-react"
import Footer from "../../components/Footer";
import ReviewsSection from "../../section/reviewSection";
import { useFQAStore, useStoreStore,useMenuStore } from "../../store";
import ItemCard from "../../components/ItemCard";
// import  from "../../store/menuStore";
import {FaqItem} from "../../section/FqaItem";
import { toast } from "sonner";


// ── Category config ───────────────────────────────────────────
const CATS = [
  { key: "pizza", label: "Pizza", emoji: "🍕" },
  { key: "cake", label: "Cake", emoji: "🎂" },
  { key: "cookies", label: "Cookies", emoji: "🍪" },
  { key: "ice", label: "Ice Cream", emoji: "🍦" },
];

// const FAQS = [
//   { q: "How long does delivery take?", a: "Usually 25–40 minutes depending on your location and order size. We'll give you an estimated time when we confirm your order." },
//   { q: "Which areas do you deliver to?", a: "We deliver locally within our neighborhood. Message us on WhatsApp to check if your area is covered." },
//   { q: "Can I change my order after placing it?", a: "Yes! Message us on WhatsApp before we start preparing. Once preparation begins, changes may not be possible." },
//   { q: "Why can't I order ice cream alone?", a: "Ice cream melts quickly, so we only deliver it alongside a Pizza, Bake or Cake order to ensure it reaches you in good condition. You can always pick it up from our store!" },
//   { q: "Can I order for pickup instead?", a: "Absolutely! Just mention 'store pickup' in your WhatsApp message and there's no delivery charge." },
//   { q: "How do I order a custom cake?", a: "Go to the Custom Cake page, fill in the size, flavour, message and delivery date, then tap 'Send Order on WhatsApp'. We confirm the price and details with you directly." },
//   { q: "What if I have a food allergy?", a: "Please mention your allergy clearly in the WhatsApp message. We'll do our best to accommodate and let you know if we can safely prepare your order." },
// ];

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
        <h1 style={{
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
      <div style={{ background: C.mid, padding: "24px 16px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ fontFamily: C.f2, color: C.gold, fontSize: 11, letterSpacing: 3, marginBottom: 12, textAlign: "center" }}>
            🔥 TODAY'S SPECIALS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
            {[
              { e: "🔥", t: "Buy 2 Pizzas, Get 1 Bake Free!", d: "Valid today only" },
              { e: "🎉", t: "Cake + Ice Cream Combo", d: "Any cake + 2 scoops at ₹50 off" },
            ].map((s, i) => (
              <div key={i} style={{
                background: "#3D1A00", borderLeft: `4px solid ${C.red}`,
                borderRadius: 8, padding: "14px 18px",
                display: "flex", gap: 12, alignItems: "center",
              }}>
                <span style={{ fontSize: 24 }}>{s.e}</span>
                <div>
                  <div style={{ fontFamily: C.f2, fontWeight: 700, color: "#FFF8F0", fontSize: 14 }}>{s.t}</div>
                  <div style={{ fontFamily: C.f2, color: C.gold, fontSize: 12 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
      <ReviewsSection />

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