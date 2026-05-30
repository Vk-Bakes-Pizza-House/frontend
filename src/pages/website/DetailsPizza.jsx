// src/pages/PizzaDetail.jsx
// ─────────────────────────────────────────────────────────────
// Public product detail page for any menu item (Pizza, Bake, etc.)
// Props: itemId (string) — pass from router or parent
// Falls back to a demo pizza if no itemId given.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useMemo } from "react";
import {
  Star, Plus, Minus, ShoppingCart, ArrowLeft,
  Clock, Truck, Shield, Flame, Leaf,
  Heart, Share2, ChevronRight, Info,
} from "lucide-react";
import useCartStore from "../../store/cartStore";
import { useSearchParams } from "react-router-dom";
import api from "../../store/api";
import { endpoints } from "../../utils/endpoints";
import { toast } from "sonner";

// ── Design tokens ─────────────────────────────────────────────
const C = {
  bg: "#FFF8F0",
  dark: "#1A0A00",
  mid: "#2D1400",
  red: "#D44B1A",
  gold: "#F5A623",
  muted: "#8B6A4F",
  border: "#E8D5C0",
  green: "#16A34A",
  f1: "'Playfair Display', serif",
  f2: "'DM Sans', sans-serif",
};

// ── Mock item data ─────────────────────────────────────────────
const ITEM = {
  id: "1",
  name: "Paneer Tikka Pizza",
  category: "pizza",
  price: 279,
  description: "A fiery fusion of smoky marinated paneer, crisp bell peppers, red onions, and tangy tikka sauce on a hand-tossed base. Topped with a generous mozzarella blanket and finished with fresh coriander.",
  tag: "🌶️ Spicy",
  available: true,
  deliverable: true,
  rating: 4.7,
  reviewCount: 38,
  prepTime: "20–25 min",
  isVeg: true,
  calories: "~620 kcal",
  serves: "1–2",
  sizes: [
    { label: "Regular (7\")", price: 199, tag: "" },
    { label: "Medium (9\")", price: 279, tag: "Popular ✨" },
    { label: "Large (11\")", price: 359, tag: "" },
  ],
  extras: [
    { label: "Extra Cheese", price: 30 },
    { label: "Extra Paneer", price: 40 },
    { label: "Stuffed Crust", price: 50 },
    { label: "Chilli Flakes", price: 0 },
  ],
  ingredients: ["Hand-tossed dough", "Tikka sauce", "Marinated paneer", "Mozzarella", "Bell peppers", "Red onion", "Coriander"],
  reviews: [
    { name: "Priya S.", rating: 5, text: "Best pizza in the area! The paneer is perfectly spiced.", time: "2 days ago" },
    { name: "Rahul M.", rating: 5, text: "Crispy base and so much cheese. Will definitely order again!", time: "1 week ago" },
    { name: "Anita K.", rating: 4, text: "Really tasty. Slightly less spicy than expected but loved it.", time: "2 weeks ago" },
  ],
};

const RELATED = [
  { id: "2", name: "Margherita Pizza", price: 199, emoji: "🍕", tag: "Bestseller", rating: 4.8 },
  { id: "3", name: "Veg Supreme Pizza", price: 249, emoji: "🍕", tag: "", rating: 4.5 },
  { id: "4", name: "Veg Cheese Bake", price: 89, emoji: "🥐", tag: "Bestseller", rating: 4.6 },
];

// ── Star display ──────────────────────────────────────────────
function Stars({ n, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size}
          fill={i <= Math.round(n) ? C.gold : "none"}
          color={i <= Math.round(n) ? C.gold : "#D0C0B0"}
        />
      ))}
    </div>
  );
}

// ── Rating bar ────────────────────────────────────────────────
function RatingBar({ stars, pct }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-stone-500 w-8 text-right">{stars}★</span>
      <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-stone-400 w-6">{pct}%</span>
    </div>
  );
}

// ── Extra toggle chip ─────────────────────────────────────────
function ExtraChip({ extra, selected, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all
        ${selected
          ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-200"
          : "bg-white text-stone-600 border-stone-200 hover:border-orange-300"
        }`}
    >
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
        ${selected ? "border-white bg-white/30" : "border-stone-300"}`}>
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      {extra.label}
      {extra.price > 0
        ? <span className={selected ? "text-orange-200" : "text-orange-500"}>+₹{extra.price}</span>
        : <span className={selected ? "text-orange-200" : "text-emerald-500"}>Free</span>}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────
// import useCartStore from "../../store/cartStore";

export default function PizzaDetail({ onBack, onNavigate }) {
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get("id");

  const [item, setItem] = useState(ITEM); // fallback demo
  const [loading, setLoading] = useState(false);

  const [sizeIdx, setSizeIdx] = useState(1);           // default Medium
  const [extras, setExtras] = useState([]);           // selected extra ids
  const [qty, setQty] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [tab, setTab] = useState("description"); // description | nutrition | reviews
  const [addedAnim, setAddedAnim] = useState(false);
  const { addItem: add } = useCartStore();



  const selectedSize = (item.sizes && item.sizes[sizeIdx]) || { label: "", price: item.price || 0 };
  const extrasTotal = extras.reduce((s, e) => s + (e.price || 0), 0);
  const unitPrice = selectedSize.price + extrasTotal;
  const totalPrice = unitPrice * qty;

  const toggleExtra = (extra) => {
    setExtras(prev =>
      prev.find(e => e.label === extra.label)
        ? prev.filter(e => e.label !== extra.label)
        : [...prev, extra]
    );
  };

  const addToCart = () => {
    // Simple Rule: Agar item available nahi hai OR (price 100 se kam hai aur qty 3 se kam hai)
    if (!item.available || (totalPrice < 100 && qty < 3)) {
      toast.warning("Cannot add to cart. Min. 3 Qty or ₹100 Required.");
      return;
    }

    const cartItem = {
      _id: `${item.id}-${sizeIdx}-${extras.map((e) => e.label).join("-")}`,
      id: item.id,
      name: `${item.name} (${selectedSize.label})`,
      category: item.category,
      price: unitPrice,
      deliverable: item.deliverable,
      qty,
      extras,
      size: selectedSize.label,
    };

    // Remaining add to cart logic...

    add(cartItem, qty);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1500);
  };

  useEffect(() => {
    if (!itemId) return;
    let mounted = true;
    setLoading(true);
    api.get(endpoints.menu.getById(itemId))
      .then(({ data }) => {
        if (!mounted) return;
        if (data && data.data) setItem(data.data);
      })
      .catch((err) => {
        console.warn("Failed to load item:", err.message || err);
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [itemId]);
  const isCartDisabled = !item.available || (item.price < 100 && qty < 3);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        button { cursor: pointer; border: none; background: none; padding: 0; }
      `}</style>

      <div className="min-h-screen" style={{ background: C.bg, fontFamily: C.f2 }}>

        {/* ── Breadcrumb ──────────────────────────────────── */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-stone-200">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 text-xs text-stone-400">
            <button onClick={onBack} className="flex items-center gap-1 hover:text-orange-600 transition-colors font-medium">
              <ArrowLeft size={14} /> Menu
            </button>
            <ChevronRight size={12} />
            <span className="text-stone-500">Pizza</span>
            <ChevronRight size={12} />
            <span className="text-stone-700 font-semibold">{item.name}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* ── LEFT — Image + badges ─────────────────── */}
            <div className="flex flex-col gap-4">

              {/* Main image */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50 aspect-square flex items-center justify-center shadow-lg">
                <span className="text-[140px] select-none leading-none">🍕</span>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {item.tag && (
                    <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                      {item.tag}
                    </span>
                  )}
                  {item.isVeg && (
                    <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                      <Leaf size={10} /> VEG
                    </span>
                  )}
                </div>

                {/* Wishlist + Share */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={() => setWishlist(w => !w)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md backdrop-blur transition-all
                      ${wishlist ? "bg-red-500 text-white" : "bg-white/80 text-stone-500 hover:text-red-500"}`}
                  >
                    <Heart size={15} fill={wishlist ? "white" : "none"} />
                  </button>
                  <button className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow-md text-stone-500 hover:text-orange-600 transition-colors backdrop-blur">
                    <Share2 size={15} />
                  </button>
                </div>

                {/* Availability */}
                {!item.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-600 text-white font-bold px-5 py-2 rounded-full text-sm">
                      Currently Unavailable
                    </span>
                  </div>
                )}
              </div>

              {/* Info pills */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Clock, label: "Prep Time", value: item.prepTime },
                  { icon: Flame, label: "Calories", value: item.calories },
                  { icon: Shield, label: "Serves", value: item.serves },
                ].map(info => (
                  <div key={info.label} className="bg-white rounded-2xl border border-stone-200 p-3 text-center">
                    <info.icon size={16} className="mx-auto mb-1 text-orange-500" />
                    <p className="text-xs text-stone-400">{info.label}</p>
                    <p className="text-xs font-bold text-stone-700 mt-0.5">{info.value}</p>
                  </div>
                ))}
              </div>

              {/* Delivery badge */}
              <div className={`flex items-center gap-2.5 p-3.5 rounded-2xl border text-xs font-semibold
                ${item.deliverable
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-stone-100 border-stone-200 text-stone-500"
                }`}
              >
                <Truck size={14} />
                {item.deliverable
                  ? "🚚 Available for home delivery · ₹20 delivery charge"
                  : "🏪 Store pickup only — not available for delivery"}
              </div>

            </div>

            {/* ── RIGHT — Details + order builder ──────── */}
            <div className="flex flex-col gap-5">

              {/* Name + rating */}
              <div>
                <div className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-2">
                  {item.category}
                </div>
                <h1 className="text-3xl font-bold text-stone-800 leading-tight mb-3" style={{ fontFamily: C.f1 }}>
                  {item.name}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <Stars n={item.rating} size={16} />
                  <span className="text-sm font-bold text-stone-700">{item.rating}</span>
                  <span className="text-sm text-stone-400">({item.reviewCount} reviews)</span>
                  <span className="text-stone-300">·</span>
                  <span className="text-sm text-stone-400">{item.reviewCount} orders this week</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-orange-600">₹{unitPrice}</span>
                {qty > 1 && <span className="text-base text-stone-400">× {qty} = <strong className="text-stone-700">₹{totalPrice}</strong></span>}
                <span className="text-xs text-stone-400 self-center">Cash on delivery</span>
              </div>

              {/* Size selector */}
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5">Choose Size</p>
                <div className="flex flex-col gap-2">
                  {item.sizes.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setSizeIdx(i)}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all text-left
                        ${sizeIdx === i
                          ? "bg-orange-600 border-orange-600 shadow-md shadow-orange-200"
                          : "bg-white border-stone-200 hover:border-orange-300"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                          ${sizeIdx === i ? "border-white" : "border-stone-300"}`}>
                          {sizeIdx === i && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className={`text-sm font-semibold ${sizeIdx === i ? "text-white" : "text-stone-700"}`}>
                          {s.label}
                        </span>
                        {s.tag && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold
                            ${sizeIdx === i ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"}`}>
                            {s.tag}
                          </span>
                        )}
                      </div>
                      <span className={`text-sm font-black ${sizeIdx === i ? "text-white" : "text-orange-600"}`}>
                        ₹{s.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Extras */}
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5">
                  Add Extras <span className="text-stone-300 font-normal normal-case tracking-normal">(optional)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.extras.map(e => (
                    <ExtraChip
                      key={e.label}
                      extra={e}
                      selected={!!extras.find(x => x.label === e.label)}
                      onToggle={() => toggleExtra(e)}
                    />
                  ))}
                </div>
              </div>

              {/* Qty + Add to cart */}
              <div className="flex items-center gap-3">
                {/* Qty picker */}
                <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-2xl p-1.5">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                  >
                    <Minus size={14} className="text-stone-600" />
                  </button>
                  <span className="w-8 text-center text-base font-black text-stone-800">{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="w-9 h-9 rounded-xl bg-orange-600 hover:bg-orange-500 flex items-center justify-center transition-colors"
                  >
                    <Plus size={14} className="text-white" />
                  </button>
                </div>

                {/* Add to cart */}
                <button
                  onClick={addToCart}
                  disabled={isCartDisabled}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95 
    ${addedAnim
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                      : isCartDisabled
                        ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                        : "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-200"
                    }`}
                >
                  {addedAnim ? (
                    <><span className="text-base">✓</span> Added to Cart!</>
                  ) : !item.available ? (
                    <>Out of Stock</>
                  ) : (totalPrice < 100 && qty < 3) ? (
                    <>Min. 3 Qty</> // Shows only when BOTH rules are broken
                  ) : (
                    <><ShoppingCart size={16} /> Add to Cart · ₹{totalPrice}</>
                  )}
                </button>
              </div>

              {/* Trust row */}
              <div className="flex gap-4 flex-wrap">
                {["Fresh & Hot", "Cash on Delivery", "₹20 Delivery Fee"].map(t => (
                  <span key={t} className="text-xs text-stone-400 flex items-center gap-1">
                    <span className="text-emerald-500">✓</span> {t}
                  </span>
                ))}
              </div>

            </div>
          </div>

          {/* ── Tabs — Description / Ingredients / Reviews ─ */}
          <div className="mt-12">
            {/* Tab bar */}
            <div className="flex gap-1 bg-stone-100 rounded-2xl p-1.5 w-fit mb-6">
              {[
                { key: "description", label: "Description" },
                { key: "ingredients", label: "Ingredients" },
                // { key: "reviews",      label: `Reviews (${item.reviews.length})` },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all
                    ${tab === t.key
                      ? "bg-white text-orange-600 shadow-sm font-bold"
                      : "text-stone-500 hover:text-stone-700"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Description */}
            {tab === "description" && (
              <div className="bg-white rounded-3xl border border-stone-200 p-7">
                <p className="text-base text-stone-600 leading-relaxed">{item.description}</p>
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Prep Time", value: item.prepTime, icon: "⏱️" },
                    { label: "Serves", value: item.serves, icon: "👥" },
                    { label: "Calories", value: item.calories, icon: "🔥" },
                    { label: "Type", value: item.isVeg ? "Pure Veg" : "Non-Veg", icon: item.isVeg ? "🌿" : "🍗" },
                  ].map(s => (
                    <div key={s.label} className="bg-stone-50 rounded-2xl p-4 text-center">
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="text-xs text-stone-400 mb-1">{s.label}</div>
                      <div className="text-sm font-bold text-stone-700">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients */}
            {tab === "ingredients" && (
              <div className="bg-white rounded-3xl border border-stone-200 p-7">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">What goes in</p>
                <div className="flex flex-wrap gap-2">
                  {item.ingredients.map(ing => (
                    <span key={ing} className="bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold px-3.5 py-2 rounded-full">
                      {ing}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex items-start gap-2 text-xs text-stone-400 bg-stone-50 rounded-xl p-3.5">
                  <Info size={13} className="flex-shrink-0 mt-0.5" />
                  Contains gluten and dairy. Please inform us of any allergies before ordering.
                </div>
              </div>
            )}

            {/* Reviews */}
            {tab === "reviews" && (
              <div className="bg-white rounded-3xl border border-stone-200 p-7">
                <div className="flex flex-col sm:flex-row gap-8 mb-7">
                  {/* Overall score */}
                  <div className="text-center sm:border-r border-stone-100 sm:pr-8">
                    <div className="text-6xl font-black text-stone-800 leading-none">{item.rating}</div>
                    <Stars n={item.rating} size={18} />
                    <div className="text-xs text-stone-400 mt-1">{item.reviewCount} reviews</div>
                  </div>
                  {/* Breakdown */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    {[[5, 72], [4, 18], [3, 7], [2, 2], [1, 1]].map(([s, pct]) => (
                      <RatingBar key={s} stars={s} pct={pct} />
                    ))}
                  </div>
                </div>

                {/* Review cards */}
                <div className="flex flex-col gap-4">
                  {item.reviews.map((r, i) => (
                    <div key={i} className="border border-stone-100 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {r.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-stone-700">{r.name}</p>
                            <p className="text-xs text-stone-400">{r.time}</p>
                          </div>
                        </div>
                        <Stars n={r.rating} size={12} />
                      </div>
                      <p className="text-sm text-stone-600 leading-relaxed">"{r.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Related items ──────────────────────────────── */}
          <div className="mt-10">
            <h3 className="text-lg font-bold text-stone-800 mb-4" style={{ fontFamily: C.f1 }}>
              You might also like
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {RELATED.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-stone-200 p-4 flex items-center gap-4 hover:shadow-md hover:border-orange-200 transition-all cursor-pointer">
                  <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center text-3xl flex-shrink-0">
                    {r.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {r.tag && <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-semibold">{r.tag}</span>}
                    </div>
                    <p className="text-sm font-semibold text-stone-700 truncate">{r.name}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-sm font-black text-orange-600">₹{r.price}</span>
                      <div className="flex items-center gap-1 text-xs text-stone-400">
                        <Star size={10} fill={C.gold} color={C.gold} />{r.rating}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}