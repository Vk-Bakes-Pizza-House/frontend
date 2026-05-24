// src/components/ItemCard.jsx
import { useState } from "react";
import { Plus, Minus,ShoppingBag } from "lucide-react";
import { C, EMOJI as EMOJIS } from "../data/menu";
import OrderNowModal from "../section/oderNow";
import {isDlv} from "../config/index";

function ItemCard({ item, cart, add }) {
  const [showModal, setShowModal] = useState(false);

  // ── Normalise field names (DB: category/deliverable, legacy: cat/dlv) ──
  const imageUrl = item?.imageUrl || item?.image || "";
  const category = item?.category || item?.cat || "";
  const description = item?.description || item?.desc || "";
  const deliverable = item?.deliverable !== undefined ? item?.deliverable : item?.dlv;
  const tag = item?.tag || "";

  console.log("data",item)

  // ── Delivery badge ────────────────────────────────────────────
  const dlvLabel =
    deliverable === true ? "🚚 Delivers"
      : deliverable === "cond" ? "🍕+🎂 only"
        : "🏪 Pickup only";

  const dlvClass =
    deliverable === true ? "bg-green-100 text-green-800"
      : deliverable === "cond" ? "bg-yellow-100 text-yellow-800"
        : "bg-gray-100 text-gray-500";

  // ── Cart qty (supports both _id and id) ──────────────────────
  const itemId = item?._id || item?.id;
  const qty = cart?.find?.((c) => (c?._id || c?.id) === itemId)?.qty || 0;
  const totalPrice = item?.price * qty;

  return (
    <div className="bg-white border border-[#E8D5C0] rounded-2xl overflow-hidden flex flex-col shadow-xs hover:shadow-md transition-all duration-200">

      {/* Image */}
      <div className="relative h-40 overflow-hidden bg-[#FFF3E0]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item?.name || "Item"}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-5xl bg-gradient-to-br from-[#FFF0E0] to-[#FFE8CC]">
            {EMOJIS[category] || "🍽️"}
          </div>
        )}

        {/* Tag badge */}
        {tag && (
          <div className="absolute top-2.5 left-2.5">
            <span className="bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              {tag}
            </span>
          </div>
        )}

        {/* Delivery badge */}
        <span className={`absolute top-2.5 right-2.5 text-[14px] font-bold px-2.5 py-0.5 rounded-full shadow-xs ${dlvClass}`}>
          {item?.size}
        </span>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="font-sans font-bold text-[#2D1400] text-sm">
          {item?.name || "Item"}
        </div>
        <div className="font-sans text-[#8B6A4F] text-xs flex-1 line-clamp-2 leading-relaxed">
          {description}
        </div>

        {/* Delivery Status */}
        <div className="text-xs text-[11px] font-bold  rounded-full shadow-xs" style={{ color: isDlv(item, cart) ? "#16A34A" : C.muted, fontFamily: C.f2 }}>
          {isDlv(item, cart) ? "✅ Will be delivered" : "🏪 Store pickup only"}
        </div>

        {/* Price + Add/Remove */}
        <div className="flex items-center justify-between pt-2 border-t border-[#FFF8F0]">
          <span className="font-sans font-black text-base text-[#D44B1A]">
            ₹{item?.price || 0}
          </span>

          {qty === 0 ? (
            <button
              onClick={() => add(item, 1)}
              className="px-4 py-1.5 bg-[#D44B1A] hover:bg-[#b83d13] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              Add
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => add(item, -1)}
                className="w-7 h-7 rounded-lg bg-[#E8D5C0]/40 hover:bg-[#E8D5C0]/70 flex items-center justify-center transition-colors"
              >
                <Minus size={12} className="text-[#D44B1A]" />
              </button>
              <span className="font-sans font-bold text-xs w-4 text-center text-[#2D1400]">
                {qty}
              </span>
              <button
                onClick={() => add(item, 1)}
                className="w-7 h-7 rounded-lg bg-[#D44B1A] hover:bg-[#b83d13] flex items-center justify-center transition-colors"
              >
                <Plus size={12} className="text-white" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-2 pt-1">
  <button
    onClick={() => setShowModal(true)}
    disabled={deliverable !== true && deliverable !== "cond"} // Disables the button if it's pickup only
    className="w-full flex items-center justify-center gap-1.5 py-2 border border-[#D44B1A]/20 bg-[#FFF8F0] font-sans text-xs font-bold text-[#D44B1A] rounded-xl transition-all
      enabled:hover:border-[#D44B1A] enabled:hover:bg-[#D44B1A] enabled:hover:text-white
      disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
  >
    <ShoppingBag size={13} />
    <span>{deliverable !== true && deliverable !== "cond" ? "Pickup Only" : "Order Now"}</span>
  </button>
</div>

        {/* Cart Total */}
        {/* {qty > 0 && (
          <div className="text-xs font-bold text-right" style={{ color: C.red, fontFamily: C.f2 }}>
            Subtotal: ₹{totalPrice}
          </div>
        )} */}
      </div>

      {/* Address modal — shown when Order Now is clicked */}
      {showModal && (
        <OrderNowModal
          item={item}
          cart={cart}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default ItemCard;