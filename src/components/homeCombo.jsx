// src/components/HomeComboSection.jsx
// ─────────────────────────────────────────────────────────────
// Combo section for the Home page — shown below "Today's Specials".
// Splits combos into 3 horizontal scroll rows by category:
//   🍕 Pizza + Pizza
//   🎂 Pizza + Cake
//   🍦 Pizza + Ice Cream
// Each row has a "View All" link to the full /combos page.
// ─────────────────────────────────────────────────────────────
import { ComboCard, MOCK_COMBOS } from "../section/Combos";
import { ArrowRight, Flame } from "lucide-react";

const C = {
  dark:  "#1A0A00",
  mid:   "#2D1400",
  red:   "#D44B1A",
  gold:  "#F5A623",
  f1:    "'Playfair Display', serif",
  f2:    "'DM Sans', sans-serif",
};

const SECTIONS = [
  { type:"pizza-pizza",    label:"Pizza + Pizza",     emoji:"🍕", sub:"Double the cheese, double the fun" },
//   { type:"pizza-cake",     label:"Pizza + Cake",      emoji:"🎂", sub:"Perfect for celebrations"          },
//   { type:"pizza-icecream", label:"Pizza + Ice Cream", emoji:"🍦", sub:"Hot and cold, best of both"        },
];

// ── Single category row ────────────────────────────────────────
function ComboRow({ section, combos, onAdd, onViewAll }) {
  const items = combos.filter(c => c.comboType === section.type && c.available);
  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      {/* Row header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{section.emoji}</span>
          <div>
            <p className="text-base font-bold text-stone-800" style={{ fontFamily: C.f1 }}>{section.label}</p>
            <p className="text-xs text-stone-400">{section.sub}</p>
          </div>
        </div>
        <button
          onClick={() => onViewAll(section.type)}
          className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors flex-shrink-0"
        >
          View All <ArrowRight size={12} />
        </button>
      </div>

      {/* Horizontal scroll row */}
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {items.map(combo => (
          <ComboCard key={combo._id} combo={combo} onAdd={onAdd} compact />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN — drop this into Home.jsx
// ─────────────────────────────────────────────────────────────
export default function HomeComboSection({ onAddToCart, onNavigate }) {
  // TODO: replace with useComboStore().combos after fetchCombos() on mount
  const combos = MOCK_COMBOS;

  const handleAdd = (combo) => {
    if (!onAddToCart) return;
    const totalQty = combo.items.reduce((sum, it) => sum + it.qty, 0);
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
  };
  const handleViewAll = (type) => {
    if (onNavigate) onNavigate("combos", { type });
  };

  const hasAnyCombo = combos.some(c => c.available);
  if (!hasAnyCombo) return null;

  return (
    <div style={{ background: C.dark }} className="py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Section header */}
        <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-300 mb-2">
              <Flame size={12} /> SAVE MORE WITH COMBOS
            </div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: C.f1 }}>
              Combo Deals
            </h2>
          </div>
          <button
            onClick={() => onNavigate && onNavigate("combos")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-orange-400/30 text-orange-300 text-xs font-bold hover:bg-orange-400/10 transition-all flex-shrink-0"
          >
            View All Combos <ArrowRight size={12} />
          </button>
        </div>

        {/* Category rows */}
        {SECTIONS.map(section => (
          <ComboRow
            key={section.type}
            section={section}
            combos={combos}
            onAdd={handleAdd}
            onViewAll={handleViewAll}
          />
        ))}
      </div>
    </div>
  );
}