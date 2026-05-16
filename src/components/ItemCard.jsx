import { Plus, Minus } from "lucide-react";
import { C } from "../data/menu";
import { EMOJI as EMOJIS } from "../data/menu";

function ItemCard({ item, cart, add }) {
  const imageUrl    = item.imageUrl || item.image || "";          // ✅ resolved once
  const category    = item.category || item.cat || "";
  const description = item.description || item.desc || "";
  const deliverable = item.deliverable !== undefined ? item.deliverable : item.dlv;
  const tag         = item.tag || "";

  const dlvLabel =
    deliverable === true    ? "🚚 Delivers"
    : deliverable === "cond" ? "🍕+🎂 only"
    : "🏪 Pickup only";

  const dlvColor =
    deliverable === true    ? { bg: "#DCFCE7", color: "#166534" }
    : deliverable === "cond" ? { bg: "#FEF9C3", color: "#854D0E" }
    : { bg: "#F3F4F6", color: "#6B7280" };

  const itemId = item._id || item.id;
  const qty    = cart?.find((c) => (c._id || c.id) === itemId)?.qty || 0;

  return (
    <div
      className="rounded-xl overflow-hidden border flex flex-col"
      style={{ background: C.card, borderColor: C.border }}
    >
      <div className="relative h-40 overflow-hidden bg-[#FFF3E0]">
        {imageUrl ? (
          <img
            src={imageUrl}              // ✅ FIX 1 — use resolved variable, not item.imageUrl
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="h-full flex items-center justify-center text-6xl"
            style={{ background: "linear-gradient(135deg,#FFF0E0,#FFE8CC)" }}
          >
            {EMOJIS[category] || "🍽️"}
          </div>
        )}

        <div className="absolute top-2 left-2">
          {tag ? (
            <span
              className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ fontFamily: C.f2 }}
            >
              {tag}
            </span>
          ) : null}
        </div>

        <span
          className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: dlvColor.bg, color: dlvColor.color, fontFamily: C.f2 }}
        >
          {dlvLabel}
        </span>
      </div>

      <div className="p-3.5 flex-1 flex flex-col gap-2" style={{ fontFamily: C.f2 }}>
        <div className="font-semibold text-sm" style={{ color: C.mid }}>
          {item.name}
        </div>
        <div className="text-xs flex-1" style={{ color: C.muted }}>
          {description}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-base" style={{ color: C.red }}>
            ₹{item.price}
          </span>

          {qty === 0 ? (
            <button
              onClick={() => add(item)}
              className="px-3.5 py-1.5 rounded text-white text-xs font-semibold"
              style={{ background: C.red, fontFamily: C.f2 }}
            >
              Add
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => add(item, -1)}
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ background: "#F0E0D0" }}
              >
                <Minus size={12} style={{ color: C.red }} />
              </button>
              <span
                className="font-bold text-xs w-4 text-center"
                style={{ color: C.mid }}
              >
                {qty}
              </span>
              <button
                onClick={() => add(item, 1)}
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ background: C.red }}
              >
                <Plus size={12} color="white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemCard;