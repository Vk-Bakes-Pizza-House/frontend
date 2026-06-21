// src/pages/Combos.jsx
// ─────────────────────────────────────────────────────────────
// Public Combo Deals page.
// Categories: Pizza + Pizza | Pizza + Cake | Pizza + Ice Cream | All
// Each combo can be added to cart or ordered directly via WhatsApp.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import {
  Flame, ShoppingCart, ArrowRight, Tag,
  Sparkles, Truck, Check,
} from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────
const C = {
  bg:     "#FFF8F0",
  dark:   "#1A0A00",
  mid:    "#2D1400",
  red:    "#D44B1A",
  gold:   "#F5A623",
  muted:  "#8B6A4F",
  border: "#E8D5C0",
  green:  "#25D366",
  f1:     "'Playfair Display', serif",
  f2:     "'DM Sans', sans-serif",
};

// ── Category config ────────────────────────────────────────────
export const COMBO_CATEGORIES = [
  { key:"all",             label:"All Combos",        emoji:"🔥" },
  { key:"pizza-pizza",     label:"Pizza + Pizza",      emoji:"🍕" },
  { key:"pizza-cake",      label:"Pizza + Cake",       emoji:"🎂" },
  { key:"pizza-icecream",  label:"Pizza + Ice Cream",  emoji:"🍦" },
];

const EMOJI = { pizza:"🍕", bake:"🥐", bread:"🍞", toast:"🥖", biscuit:"🍪", cake:"🎂", ice:"🍦" };

// ── Mock combos (replace with useComboStore) ───────────────────
export const MOCK_COMBOS = [
  {
    _id:"c1", name:"Double Pizza Mania",
    comboType:"pizza-pizza",
    items:[{name:"Margherita Pizza",category:"pizza",qty:1},{name:"Paneer Tikka Pizza",category:"pizza",qty:1}],
    originalPrice:478, comboPrice:399, tag:"Most Popular", deliverable:true, available:true,
  },
  {
    _id:"c2", name:"Twin Pizza Feast",
    comboType:"pizza-pizza",
    items:[{name:"Veg Supreme Pizza",category:"pizza",qty:1},{name:"Margherita Pizza",category:"pizza",qty:1}],
    originalPrice:448, comboPrice:379, tag:"", deliverable:true, available:true,
  },
  {
    _id:"c3", name:"Pizza & Cake Celebration",
    comboType:"pizza-cake",
    items:[{name:"Paneer Tikka Pizza",category:"pizza",qty:1},{name:"Chocolate Truffle Cake (500g)",category:"cake",qty:1}],
    originalPrice:629, comboPrice:529, tag:"Best for Birthdays", deliverable:true, available:true,
  },
  {
    _id:"c4", name:"Pizza + Butterscotch Combo",
    comboType:"pizza-cake",
    items:[{name:"Margherita Pizza",category:"pizza",qty:1},{name:"Butterscotch Cake (500g)",category:"cake",qty:1}],
    originalPrice:519, comboPrice:449, tag:"", deliverable:true, available:true,
  },
  {
    _id:"c5", name:"Pizza & Scoop Combo",
    comboType:"pizza-icecream",
    items:[{name:"Margherita Pizza",category:"pizza",qty:1},{name:"Mango Ice Cream",category:"ice",qty:2}],
    originalPrice:319, comboPrice:269, tag:"Limited Time", deliverable:true, available:true,
  },
  {
    _id:"c6", name:"Spicy Pizza + Cool Down",
    comboType:"pizza-icecream",
    items:[{name:"Paneer Tikka Pizza",category:"pizza",qty:1},{name:"Chocolate Ice Cream",category:"ice",qty:2}],
    originalPrice:399, comboPrice:339, tag:"", deliverable:true, available:true,
  },
];

const TAG_COLORS = {
  "Most Popular":      "bg-orange-500 text-white",
  "Best for Birthdays":"bg-pink-500 text-white",
  "Limited Time":      "bg-red-500 text-white",
};

// ── Helpers ───────────────────────────────────────────────────
const discountPct = (orig, combo) => Math.round(((orig - combo) / orig) * 100);

// ── Combo card ────────────────────────────────────────────────
export function ComboCard({ combo, onAdd, compact = false }) {
  const [added, setAdded] = useState(false);
  const pct = discountPct(combo.originalPrice, combo.comboPrice);

  const handleAdd = () => {
    onAdd && onAdd(combo);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className={`bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all duration-300 flex flex-col ${compact ? "w-64 flex-shrink-0" : ""}`}>

      {/* Image row — stacked item emojis */}
      <div className="relative h-32 bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center gap-1">
        {combo.items.map((it, i) => (
          <span key={i} className="text-5xl leading-none" style={{ marginLeft: i > 0 ? -10 : 0, zIndex: combo.items.length - i }}>
            {EMOJI[it.category] || "🍽️"}
          </span>
        ))}

        {/* Discount badge */}
        <span className="absolute top-2.5 right-2.5 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
          {pct}% OFF
        </span>

        {/* Tag */}
        {combo.tag && (
          <span className={`absolute top-2.5 left-2.5 text-xs font-bold px-2.5 py-1 rounded-full ${TAG_COLORS[combo.tag] || "bg-stone-700 text-white"}`}>
            {combo.tag}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-sm font-bold text-stone-800 leading-snug mb-1.5">{combo.name}</p>

        {/* Items list */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {combo.items.map((it, i) => (
            <span key={i} className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-medium">
              {it.qty}× {it.name}
            </span>
          ))}
        </div>

        {/* Delivery note */}
        {combo.deliverable && (
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mb-3">
            <Truck size={11} /> Home delivery available
          </div>
        )}

        {/* Price row */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-xs text-stone-400 line-through leading-none mb-0.5">₹{combo.originalPrice}</p>
            <p className="text-xl font-black text-orange-600 leading-none">₹{combo.comboPrice}</p>
          </div>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95
              ${added ? "bg-emerald-500 text-white" : "bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-200"}`}
          >
            {added ? <><Check size={13}/> Added</> : <><ShoppingCart size={13}/> Add Combo</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function Combos({ onAddToCart }) {
  const [activeCat, setActiveCat] = useState("all");

  // TODO: replace with useComboStore().fetchCombos() + filteredCombos()
  const combos = MOCK_COMBOS;

  const filtered = activeCat === "all" ? combos : combos.filter(c => c.comboType === activeCat);

  const handleAdd = (combo) => {
    if (onAddToCart) {
      const totalQty = combo.items.reduce((sum, it) => sum + it.qty, 0);
      // Flatten combo items into individual cart entries at combo price ratio
      combo.items.forEach(it => {
        onAddToCart({
          _id:         `${combo._id}-${it.name}`,
          name:        `${it.name} (Combo: ${combo.name})`,
          category:    it.category,
          price:       Math.round(combo.comboPrice / totalQty),
          deliverable: combo.deliverable,
          qty:         it.qty,
        });
      });
    }
  };
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        button { cursor: pointer; border: none; background: none; padding: 0; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ background: C.bg, minHeight: "100vh", fontFamily: C.f2 }}>

        {/* Hero */}
        <div style={{ background: `linear-gradient(135deg, ${C.dark} 0%, #3D1A00 100%)`, padding: "44px 16px 36px", textAlign: "center" }}>
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 text-xs font-semibold text-orange-300 mb-4">
            <Flame size={12} /> Save more when you combo!
          </div>
          <h1 style={{ fontFamily: C.f1, color: "#FFF8F0", fontSize: "clamp(28px,6vw,44px)", fontWeight: 700, marginBottom: 10 }}>
            Combo Deals
          </h1>
          <p style={{ fontFamily: C.f2, color: "#C8A882", fontSize: 14, maxWidth: 420, margin: "0 auto" }}>
            Hand-picked combos — more food, better price. All combos come with home delivery.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
            {COMBO_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCat(cat.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all flex-shrink-0
                  ${activeCat === cat.key
                    ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-200"
                    : "bg-white text-stone-600 border-stone-200 hover:border-orange-300"
                  }`}
              >
                <span className="text-base">{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>

          {/* Combo grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <div className="text-5xl mb-3">🔍</div>
              <p className="font-semibold text-sm">No combos in this category yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(combo => (
                <ComboCard key={combo._id} combo={combo} onAdd={handleAdd} />
              ))}
            </div>
          )}

          {/* Info strip */}
          <div className="mt-10 bg-white rounded-2xl border border-stone-200 p-5 flex items-center gap-4 flex-wrap">
            <Sparkles size={18} className="text-orange-500 flex-shrink-0" />
            <p className="text-xs text-stone-500 leading-relaxed flex-1">
              All combos are available for home delivery (₹20 flat charge) since they include a Pizza, Cake or Bake.
              Just add a combo to your cart and checkout via WhatsApp — Cash on Delivery only.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}