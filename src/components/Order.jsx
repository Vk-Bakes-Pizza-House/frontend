// src/components/order/OrderComponents.jsx
// ─────────────────────────────────────────────────────────────
// Shared reusable components used by ItemCard & OrderNowModal.
// ─────────────────────────────────────────────────────────────
import { ChevronDown, ChevronUp, Loader2, Plus, Minus,MapPin } from "lucide-react";
import { EMOJI } from "../data/menu";
import { getCategory } from "../config/index";

// ── 1. Qty stepper ────────────────────────────────────────────
export function QtyControl({ qty, onInc, onDec, size = "md" }) {
  const btn = size === "sm"
    ? "w-6 h-6 text-[10px]"
    : "w-7 h-7 text-xs";
  const iconSz = size === "sm" ? 10 : 12;

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onDec}
        className={`${btn} rounded-lg bg-[#E8D5C0]/50 hover:bg-[#E8D5C0]/90 flex items-center justify-center transition-colors shrink-0`}
      >
        <Minus size={iconSz} className="text-[#D44B1A]" />
      </button>
      <span className="font-sans font-bold text-sm w-5 text-center text-[#2D1400]">
        {qty}
      </span>
      <button
        onClick={onInc}
        className={`${btn} rounded-lg bg-[#D44B1A] hover:bg-[#b83d13] flex items-center justify-center transition-colors shrink-0`}
      >
        <Plus size={iconSz} className="text-white" />
      </button>
    </div>
  );
}

// ── 2. Size upsell banner ─────────────────────────────────────
// Shows a one-tap suggestion based on the currently selected size.
const UPSELL = {
  rg: { msg: "🔥 Upgrade to Medium for just +₹100",    key: "md" },
  md: { msg: "💪 Go Large for only +₹200 more!",        key: "lg" },
  lg: { msg: "💡 Regular saves you ₹200",               key: "rg" },
};

export function SizeUpsellBanner({ selectedKey, sizes, onSelect }) {
  const tip = UPSELL[selectedKey];
  if (!tip) return null;
  const target = sizes.find((s) => s.key === tip.key);
  if (!target) return null;

  return (
    <button
      onClick={() => onSelect(tip.key)}
      className="w-full flex items-center justify-between px-3 py-2 rounded-xl
                 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
    >
      <span className="font-sans text-[11px] font-semibold text-amber-800">
        {tip.msg}
      </span>
      <span className="font-sans text-[11px] font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full">
        Switch →
      </span>
    </button>
  );
}

// ── 3. Collapsible add-on section ─────────────────────────────
export function AddonSection({
  title, emoji, items,
  addons, onQtyChange,
  open, onToggle,
  loading, error,
}) {
  const activeCount = items.filter((a) => (addons[a._id || a.id] ?? 0) > 0).length;

  return (
    <div className="rounded-xl border-2 border-[#E8D5C0] overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 transition-colors
          ${open ? "bg-[#FFF3EE]" : "bg-[#FFFAF7] hover:bg-[#FFF8F3]"}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <span className="font-sans font-bold text-sm text-[#2D1400]">{title}</span>
          {activeCount > 0 && (
            <span className="bg-[#D44B1A] text-white text-[10px] font-bold
                             px-1.5 py-0.5 rounded-full leading-none">
              {activeCount}
            </span>
          )}
        </div>
        {open
          ? <ChevronUp   size={15} className="text-[#8B6A4F]" />
          : <ChevronDown size={15} className="text-[#8B6A4F]" />}
      </button>

      {/* Body */}
      {open && (
        <div className="divide-y divide-[#FFF0E0]">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-[#8B6A4F]">
              <Loader2 size={14} className="animate-spin" />
              <span className="font-sans text-xs">Loading…</span>
            </div>
          ) : error ? (
            <p className="px-4 py-3 font-sans text-xs text-red-500">{error}</p>
          ) : items.length === 0 ? (
            <p className="px-4 py-3 font-sans text-xs text-[#8B6A4F]">No items available</p>
          ) : (
            items.map((a) => {
              const id  = a._id || a.id;
              const qty = addons[id] ?? 0;
              const cat = getCategory(a);
              return (
                <div key={id} className="flex items-center justify-between px-4 py-2.5 bg-white">
                  {/* Thumbnail or emoji */}
                  <div className="flex items-center gap-2.5">
                    {(a.imageUrl || a.image) ? (
                      <img
                        src={a.imageUrl || a.image}
                        alt={a.name}
                        className="w-9 h-9 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <span className="text-xl">{EMOJI[cat] || emoji}</span>
                    )}
                    <div>
                      <p className="font-sans text-xs font-semibold text-[#2D1400]">{a.name}</p>
                      <p className="font-sans text-[10px] text-[#8B6A4F]">₹{a.price}</p>
                    </div>
                  </div>

                  {/* Add / qty stepper */}
                  {qty === 0 ? (
                    <button
                      onClick={() => onQtyChange(id, 1)}
                      className="px-3 py-1 bg-[#D44B1A] hover:bg-[#b83d13] text-white
                                 text-[11px] font-bold rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  ) : (
                    <QtyControl
                      qty={qty}
                      onInc={() => onQtyChange(id,  1)}
                      onDec={() => onQtyChange(id, -1)}
                      size="sm"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ── 4. Order summary card ─────────────────────────────────────
const FREE_DELIVERY_ABOVE = 300;

export function OrderSummary({
  item, qty, itemPrice, isPizza, sizeObj, extraCheese,
  activeAddons, allAddonItems,
  subtotal, deliveryFee, total, remaining,
}) {
  return (
    <div className="bg-[#FFF8F3] rounded-xl p-3 border border-[#E8D5C0]">
      {/* Main item */}
      <div className="flex justify-between font-sans text-xs text-[#8B6A4F] mb-1">
        <span className="flex-1 truncate mr-2">
          {qty}× {item.name}
          {isPizza && sizeObj?.priceAdd > 0 && ` (${sizeObj.label})`}
          {isPizza && extraCheese && " + Cheese"}
        </span>
        <span>₹{itemPrice * qty}</span>
      </div>

      {/* Add-on lines */}
      {activeAddons.map(([id, addonQty]) => {
        const found = allAddonItems.find((a) => (a._id || a.id) === id);
        if (!found) return null;
        return (
          <div key={id} className="flex justify-between font-sans text-xs text-[#8B6A4F] mb-1">
            <span>{addonQty}× {found.name}</span>
            <span>₹{found.price * addonQty}</span>
          </div>
        );
      })}

      <div className="border-t border-[#E8D5C0] my-2" />

      {/* Subtotal */}
      <div className="flex justify-between font-sans text-xs text-[#8B6A4F]">
        <span>Subtotal</span>
        <span>₹{subtotal}</span>
      </div>

      {/* Delivery fee */}
      <div className="flex justify-between font-sans text-xs mt-1 items-center">
        <span className="text-[#8B6A4F]">Delivery fee</span>
        {deliveryFee === 0 ? (
          <span className="text-green-600 font-bold text-xs">FREE 🎉</span>
        ) : (
          <span className="text-[#8B6A4F]">₹{deliveryFee}</span>
        )}
      </div>

      {/* Free delivery nudge */}
      {remaining > 0 && (
        <p className="mt-2 text-center font-sans text-[10px] font-semibold
                      text-[#D44B1A] bg-[#FFF3EE] rounded-lg py-1.5 px-2">
          🎉 Add ₹{remaining} more for FREE delivery
        </p>
      )}

      <div className="border-t border-[#E8D5C0] pt-2 mt-2 flex justify-between font-sans font-black text-sm text-[#D44B1A]">
        <span>Total</span>
        <span>₹{total}</span>
      </div>
      <p className="font-sans text-[10px] text-[#8B6A4F] text-center mt-1">
        💵 Cash on Delivery
      </p>
    </div>
  );
}


export function AddressBox({
  value,
  onChange,
  name,
  phone,
  setName,
  setPhone
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-3">
        <label htmlFor="addr-name" className="text-sm font-bold text-[#2D1400] flex items-center gap-2">Name</label>
        <input
          id="addr-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full p-3 rounded-xl border-2 border-[#E8D5C0] focus:border-[#D44B1A] outline-none text-sm"
        />
        <label htmlFor="addr-phone" className="text-sm font-bold text-[#2D1400] flex items-center gap-2">WhatsApp Number</label>
        <input
          id="addr-phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="WhatsApp number"
          className="w-full p-3 rounded-xl border-2 border-[#E8D5C0] focus:border-[#D44B1A] outline-none text-sm"
        />
      </div>
      <label className="
        flex items-center gap-2
        text-sm font-bold
        text-[#2D1400]
      ">
        <MapPin
          size={15}
          className="text-[#D44B1A]"
        />

        Delivery Address
      </label>

      <textarea
        rows={1}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder="Enter your address..."
        className="
          w-full p-3 rounded-xl
          border-2 border-[#E8D5C0]
          focus:border-[#D44B1A]
          outline-none resize-none
          text-sm
        "
      />

    </div>
  );
}
export function CartSummary({
  subtotal,
  deliveryFee,
  total,
  remaining,
}) {
  return (
    <div className="
      bg-[#FFF8F3]
      border border-[#E8D5C0]
      rounded-xl p-4
    ">

      <div className="flex justify-between mb-2">
        <span className="text-sm text-[#8B6A4F]">
          Subtotal
        </span>

        <span className="font-semibold">
          ₹{subtotal}
        </span>
      </div>

      <div className="flex justify-between mb-2">
        <span className="text-sm text-[#8B6A4F]">
          Delivery Fee
        </span>

        {deliveryFee === 0 ? (
          <span className="text-green-600 font-bold text-xs">FREE 🎉</span>
        ) : (
          <span className="text-[#8B6A4F]">₹{deliveryFee}</span>
        )}
      </div>


      <div className="
        border-t border-[#E8D5C0]
        pt-3 mt-3
        flex justify-between
      ">
        <span className="
          font-bold text-[#2D1400]
        ">
          Total
        </span>

        <span className="
          font-black text-[#D44B1A]
        ">
          ₹{total}
        </span>
      </div>

      <p className="
        text-xs text-[#8B6A4F]
        mt-2
      ">
        💵 Cash on Delivery
      </p>

    </div>
  );
}
