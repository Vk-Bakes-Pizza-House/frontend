// src/components/ItemCard.jsx
// ─────────────────────────────────────────────────────────────
// Displays one menu item.
//
// Pizza items  → "Add" opens the OrderNowModal (customise size/
//                cheese before adding to cart).
// Other items  → "Add" adds directly to cart.
// "Order Now"  → always opens OrderNowModal (disabled for pickup-
//                only items).
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { C, EMOJI as EMOJIS } from "../data/menu";
import { isDlv, getCategory } from "../config";
import OrderNowModal from "../section/oderNow";
import useCartStore from "../store/cartStore";
import { QtyControl } from "./Order";
import { Link } from "react-router-dom";


function ItemCard({ item }) {
  const [showModal, setShowModal] = useState(false);

  const sizes = item?.sizes || [];
  const hasSizes = sizes.length > 0;

  // Default pehla size select
  const [selectedSize, setSelectedSize] = useState(
    hasSizes ? sizes[0] : null
  );

  const displayPrice = hasSizes && selectedSize
    ? selectedSize.price
    : item?.price;
  const { addItem: add, items: cart } = useCartStore();

  // ── Normalise DB / legacy field names ─────────────────────
  const imageUrl = item?.imageUrl || item?.image || "";
  const category = getCategory(item);
  const description = item?.description || item?.desc || "";
  const deliverable = item?.deliverable !== undefined
    ? item?.deliverable
    : item?.dlv;
  const tag = item?.tag || "";
  const isPizza = category === "pizza";

  // ── Delivery badge ─────────────────────────────────────────
  const dlvLabel =
    deliverable === true ? "🚚 Delivers"
      : deliverable === "cond" ? "🍕+🎂 only"
        : "🏪 Pickup only";

  const dlvClass =
    deliverable === true ? "bg-green-100 text-green-800"
      : deliverable === "cond" ? "bg-yellow-100 text-yellow-800"
        : "bg-gray-100 text-gray-500";

  // ── Cart qty ───────────────────────────────────────────────
  const itemId = item?._id || item?.id;
  const qty = cart?.find?.((c) => (c?._id || c?.id) === itemId)?.qty || 0;

  // ── Deliverable check for "Order Now" button ───────────────
  const canOrderNow = deliverable === true || deliverable === "cond";

  // ── Add button handler ─────────────────────────────────────
  // Pizza → open modal so user can pick size first
  // Others → add directly to cart
  const handleAdd = () => {
    if (isPizza) {
      setShowModal(true);
    } else {
      add(item, 1);
    }
  };



  return (
    <>
      <div className="bg-white border border-[#E8D5C0] rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-200">

        {/* ── Image ────────────────────────────────────────── */}
        <Link to={`/menu/pizza/details?id=${item._id || item.id}`}>
          <div className="relative h-40 overflow-hidden bg-[#FFF3E0]"   >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item?.name || "Item"}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-5xl bg-gradient-to-br from-[#FFF0E0] to-[#FFE8CC]">
                {EMOJIS[category] || "🍽️"}
              </div>
            )}

            {/* Promo tag */}
            {tag && (
              <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px]
                             font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                {tag}
              </span>
            )}

            {/* Delivery badge */}
            <span className={`absolute top-2.5 right-2.5 text-[11px] font-bold
                            px-2.5 py-0.5 rounded-full shadow-sm ${dlvClass}`}>
              {dlvLabel}
            </span>
          </div>
        </Link>

        {/* ── Details ──────────────────────────────────────── */}
        <div className="p-4 flex-1 flex flex-col gap-2">
          <p className="font-sans font-bold text-[#2D1400] text-sm leading-snug">
            {item?.name || "Item"}
          </p>
          <p className="font-sans text-[#8B6A4F] text-xs flex-1 line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Delivery status */}
          <p className="font-sans text-xs font-semibold"
            style={{ color: isDlv(item, cart || []) ? "#16A34A" : C.muted }}>
            {isDlv(item, cart || []) ? "✅ Will be delivered" : "🏪 Store pickup only"}
          </p>



          {/* Price */}
          <p className="font-sans font-bold text-lg text-[#D44B1A]">
            ₹{displayPrice?.toFixed(2)}
          </p>

          {/* Size picker — sirf tab jab sizes available ho */}
          {hasSizes && (
            <div className="flex gap-1.5 mt-1">
              {sizes.map(s => (
                <button
                  key={s._id}
                  onClick={(e) => {
                    e.preventDefault(); // Link click rokne ke liye
                    setSelectedSize(s);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${selectedSize?._id === s._id
                      ? "border-[#D44B1A] bg-[#FFF3EE] text-[#D44B1A]"
                      : "border-[#E8D5C0] bg-white text-[#8B6A4F] hover:bg-[#FFF8F3]"
                    }`}
                >
                  {s.label}
                  <span className="block text-[9px] font-normal mt-0.5">
                    ₹{s.price}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Order Now button */}
          <button
            onClick={() => setShowModal(true)}
            disabled={!canOrderNow}
            className={`w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-xl                        font-sans text-xs font-bold border transition-all
                        ${canOrderNow
                ? "border-[#D44B1A]/20 bg-[#FFF8F0] text-[#D44B1A] hover:border-[#D44B1A] hover:bg-[#D44B1A] hover:text-white"
                : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
              }`}
          >
            <ShoppingBag size={13} />
            <span>{canOrderNow ? "Order Now" : "Pickup Only"}</span>
          </button>
        </div>
      </div>

      {/* ── Modal ─────────────────────────────────────────── */}
      {showModal && (
        <OrderNowModal
          item={item}
          initialSize={selectedSize} // ← pass karo
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

export default ItemCard;