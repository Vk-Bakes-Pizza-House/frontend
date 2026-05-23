// src/components/OrderNowModal.jsx
// ─────────────────────────────────────────────────────────────
// "Order Now" modal from ItemCard.
//
// Sections:
//  1. Item summary + size picker (pizza only) + extra cheese
//  2. Add-ons — cold drinks & ice cream fetched live from API
//  3. Address input
//  4. Order summary — FREE delivery when subtotal ≥ ₹300
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import {
  MapPin, X, ArrowRight, ShoppingBag,
  Plus, Minus, ChevronDown, ChevronUp, Loader2,
} from "lucide-react";
import { WA, buildMsg, isDlv, DELIVERY_FEE, getCategory } from "../config";
import { EMOJI } from "../data/menu";
import api from "../store/api";
import { endpoints } from "../utils/endpoints";
import { AddressBox,CartSummary } from "./order/CheckoutComponents";
import { QtyControl,AddToCartButton } from "./order/AddtoCart";

// ── Constants ─────────────────────────────────────────────────
const FREE_DELIVERY_ABOVE = 300;

// Pizza size options only
const PIZZA_SIZES = [
  { label: 'Regular (8")',  key: "rg", priceAdd:  0 },
  { label: 'Medium  (10")', key: "md", priceAdd:  40 },
  { label: 'Large     (12")', key: "lg", priceAdd: 80 },
];


export default function OrderNowModal({ item, onClose }) {
  const category = getCategory(item);
  const isPizza  = category === "pizza";

  // ── Core state ────────────────────────────────────────────
  const [address,      setAddress]      = useState("");
  const [selectedSize, setSize]         = useState("sm");          // pizza only
  const [extraCheese,  setExtraCheese]  = useState(false);        // pizza only
  const [addons,       setAddons]       = useState({});           // { _id: qty }

  // ── Add-on panel state ────────────────────────────────────
  const [drinks,       setDrinks]       = useState([]);
  const [iceCreams,    setIceCreams]    = useState([]);
  const [loadingAddons, setLoadingAddons] = useState(true);
  const [addonError,   setAddonError]   = useState(null);
  const [showDrinks,   setShowDrinks]   = useState(false);
  const [showIce,      setShowIce]      = useState(false);

  const inputRef = useRef(null);

  // ── Focus + keyboard ──────────────────────────────────────
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 120); }, []);
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  // ── Fetch add-on items from API on mount ──────────────────
  useEffect(() => {
    const fetchAddons = async () => {
      setLoadingAddons(true);
      setAddonError(null);
      try {
        const [drinkRes, iceRes] = await Promise.all([
          api.get(endpoints.menu.getAll, { params: { category: "drink", all: "true" } }),
          api.get(endpoints.menu.getAll, { params: { category: "ice",   all: "true" } }),
        ]);
        setDrinks(drinkRes.data?.data   ?? []);
        setIceCreams(iceRes.data?.data  ?? []);
      } catch (err) {
        setAddonError("Could not load add-ons");
        console.warn("Add-on fetch failed:", err.message);
      } finally {
        setLoadingAddons(false);
      }
    };
    fetchAddons();
  }, []);

  // ── Price calculations ────────────────────────────────────
  const sizeObj      = PIZZA_SIZES.find((s) => s.key === selectedSize);
  const sizeAdd      = isPizza ? (sizeObj?.priceAdd ?? 0) : 0;
  const cheeseAdd    = isPizza && extraCheese ? 30 : 0;
  const itemPrice    = item.price + sizeAdd + cheeseAdd;

  const activeAddons = Object.entries(addons).filter(([, qty]) => qty > 0);
  const allAddonItems = [...drinks, ...iceCreams];

  const addonTotal = activeAddons.reduce((sum, [id, qty]) => {
    const found = allAddonItems.find((a) => (a._id || a.id) === id);
    return sum + (found ? found.price * qty : 0);
  }, 0);

  const subtotal    = itemPrice + addonTotal;
  const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const total       = subtotal + deliveryFee;
  const remaining   = FREE_DELIVERY_ABOVE - subtotal;

  // ── Add-on qty helper ─────────────────────────────────────
  const setAddonQty = (id, delta) => {
    setAddons((prev) => {
      const next = (prev[id] ?? 0) + delta;
      if (next <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  // ── WhatsApp order builder ────────────────────────────────
  const handleConfirm = () => {
    if (!address.trim()) { inputRef.current?.focus(); return; }

    const sizeLabel   = isPizza && sizeObj?.priceAdd > 0 ? ` (${sizeObj.label})` : "";
    const cheeseLabel = isPizza && extraCheese ? " + Extra Cheese" : "";

    const mainItem = {
      ...item,
      name:  `${item.name}${sizeLabel}${cheeseLabel}`,
      price: itemPrice,
      qty:   1,
    };

    const addonLines = activeAddons.map(([id, qty]) => {
      const found = allAddonItems.find((a) => (a._id || a.id) === id);
      return { ...found, qty, deliverable: true };
    });

    const orderCart = [mainItem, ...addonLines];
    const msg = buildMsg(orderCart, address);
    window.open(`https://wa.me/${WA}?text=${msg}`, "_blank");
    onClose();
  };

  // ── Reusable collapsible add-on section ───────────────────
  const AddonSection = ({ title, emoji, items, open, onToggle }) => {
    const activeCount = items.filter((a) => (addons[a._id || a.id] ?? 0) > 0).length;

    return (
      <div className="rounded-xl border-2 border-[#E8D5C0] overflow-hidden">
        {/* Section header / toggle */}
        <button
          onClick={onToggle}
          className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
            open ? "bg-[#FFF3EE]" : "bg-[#FFFAF7] hover:bg-[#FFF8F3]"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{emoji}</span>
            <span className="font-sans font-bold text-xs text-[#2D1400]">{title}</span>
            {activeCount > 0 && (
              <span className="bg-[#D44B1A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {activeCount}
              </span>
            )}
          </div>
          {open
            ? <ChevronUp   size={15} className="text-[#8B6A4F]" />
            : <ChevronDown size={15} className="text-[#8B6A4F]" />}
        </button>

        {/* Items list */}
        {open && (
          <div className="divide-y divide-[#FFF0E0]">
            {loadingAddons ? (
              <div className="flex items-center justify-center gap-2 py-4 text-[#8B6A4F]">
                <Loader2 size={15} className="animate-spin" />
                <span className="font-sans text-xs">Loading…</span>
              </div>
            ) : addonError ? (
              <div className="py-3 px-4 font-sans text-xs text-red-500">{addonError}</div>
            ) : items.length === 0 ? (
              <div className="py-3 px-4 font-sans text-xs text-[#8B6A4F]">No items available</div>
            ) : (
              items.map((a) => {
                const id  = a._id || a.id;
                const qty = addons[id] ?? 0;
                const cat = getCategory(a);
                return (
                  <div key={id} className="flex items-center justify-between px-4 py-2.5 bg-white">
                    <div className="flex items-center gap-2">
                      {/* Show image if available, else emoji */}
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
                        <div className="font-sans text-xs font-semibold text-[#2D1400]">{a.name}</div>
                        <div className="font-sans text-[10px] text-[#8B6A4F]">₹{a.price}</div>
                      </div>
                    </div>

                    {qty === 0 ? (
                      <button
                        onClick={() => setAddonQty(id, 1)}
                        className="px-3 py-1 bg-[#D44B1A] hover:bg-[#b83d13] text-white text-[11px] font-bold rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    ) : (
                      <QtyControl
                        qty={qty}
                        onInc={() => setAddonQty(id, 1)}
                        onDec={() => setAddonQty(id, -1)}
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
  };

  // ─────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#FFF0E0] bg-[#FFF8F3] shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag size={17} className="text-[#D44B1A]" />
            <span className="font-sans font-bold text-[#2D1400] text-sm">Customise & Order</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#E8D5C0]/40 hover:bg-[#E8D5C0]/80 flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-[#8B6A4F]" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex flex-col gap-4 px-5 py-4 overflow-y-auto">

          {/* 1 ── Item summary */}
          <div className="flex items-center gap-3 p-3 bg-[#FFF8F3] rounded-xl border border-[#E8D5C0]">
            {(item.imageUrl || item.image) ? (
              <img src={item.imageUrl || item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-[#FFE8CC] flex items-center justify-center text-2xl shrink-0">
                {EMOJI[category] || "🍽️"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-sans font-bold text-[#2D1400] text-sm truncate">{item.name}</div>
              <div className="font-sans text-xs text-[#8B6A4F] mt-0.5">Base ₹{item.price}</div>
              <span className={`mt-1 inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDlv(item, [item]) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}>
                {isDlv(item, [item]) ? "🚚 Delivers" : "🏪 Pickup only"}
              </span>
            </div>
            {/* Live price */}
            <div className="font-sans font-black text-[#D44B1A] text-base shrink-0">₹{itemPrice}</div>
          </div>

          {/* 2 ── Pizza size picker */}
          {isPizza && (
            <div>
              <p className="font-sans text-xs font-bold text-[#2D1400] mb-2">📐 Choose Size</p>
              <div className="grid grid-cols-2 gap-2">
                {PIZZA_SIZES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSize(s.key)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all ${
                      selectedSize === s.key
                        ? "border-[#D44B1A] bg-[#FFF3EE]"
                        : "border-[#E8D5C0] bg-white hover:bg-[#FFF8F3]"
                    }`}
                  >
                    <span className={`font-sans text-xs font-semibold ${selectedSize === s.key ? "text-[#D44B1A]" : "text-[#2D1400]"}`}>
                      {s.label}
                    </span>
                    <span className={`font-sans text-[11px] font-bold ${selectedSize === s.key ? "text-[#D44B1A]" : "text-[#8B6A4F]"}`}>
                      {s.priceAdd === 0 ? "Base" : `+₹${s.priceAdd}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3 ── Extra cheese (pizza only) */}
          {isPizza && (
            <button
              onClick={() => setExtraCheese((v) => !v)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 transition-all ${
                extraCheese ? "border-[#D44B1A] bg-[#FFF3EE]" : "border-[#E8D5C0] bg-white hover:bg-[#FFF8F3]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🧀</span>
                <div className="text-left">
                  <div className={`font-sans font-bold text-xs ${extraCheese ? "text-[#D44B1A]" : "text-[#2D1400]"}`}>
                    Extra Cheese
                  </div>
                  <div className="font-sans text-[10px] text-[#8B6A4F]">+₹30</div>
                </div>
              </div>
              {/* Toggle pill */}
              <div className={`w-10 h-5 rounded-full relative transition-colors ${extraCheese ? "bg-[#D44B1A]" : "bg-[#E8D5C0]"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${extraCheese ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </button>
          )}

          {/* 4 ── Cold drinks (fetched from API) */}
          <AddonSection
            title="Add Cold Drinks"
            emoji="🥤"
            items={drinks}
            open={showDrinks}
            onToggle={() => setShowDrinks((v) => !v)}
          />

          {/* 5 ── Ice cream (fetched from API) */}
          <AddonSection
            title="Add Ice Cream"
            emoji="🍦"
            items={iceCreams}
            open={showIce}
            onToggle={() => setShowIce((v) => !v)}
          />

          {/* 6 ── Address */}
         <AddressBox/>
          {/* 7 ── Order summary */}
          <div className="bg-[#FFF8F3] rounded-xl p-3 border border-[#E8D5C0]">
            {/* Main item line */}
            <div className="flex justify-between font-sans text-[11px] text-[#8B6A4F] mb-1">
              <span className="flex-1 truncate mr-2">
                1× {item.name}
                {isPizza && sizeObj?.priceAdd > 0 && ` (${sizeObj.label})`}
                {isPizza && extraCheese && " + Cheese"}
              </span>
              <span>₹{itemPrice}</span>
            </div>

            {/* Add-on lines */}
            {activeAddons.map(([id, qty]) => {
              const found = allAddonItems.find((a) => (a._id || a.id) === id);
              if (!found) return null;
              return (
                <div key={id} className="flex justify-between font-sans text-[11px] text-[#8B6A4F] mb-1">
                  <span>{qty}× {found.name}</span>
                  <span>₹{found.price * qty}</span>
                </div>
              );
            })}

            <div className="border-t border-[#E8D5C0] my-1.5" />

            {/* Subtotal */}
            <div className="flex justify-between font-sans text-xs text-[#8B6A4F]">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            {/* Delivery fee */}
            <div className="flex justify-between font-sans text-xs mt-1 items-center">
              <span className="text-[#8B6A4F]">Delivery fee</span>
              {deliveryFee === 0 ? (
                <span className="text-green-600 font-bold text-[11px]">FREE 🎉</span>
              ) : (
                <span className="text-[#8B6A4F]">₹{deliveryFee}</span>
              )}
            </div>

            {/* Free delivery nudge */}
            {remaining > 0 && (
              <div className="mt-2 text-center font-sans text-[10px] font-semibold text-[#D44B1A] bg-[#FFF3EE] rounded-lg py-1.5 px-2">
                🎉 Add ₹{remaining} more for FREE delivery
              </div>
            )}

            <div className="border-t border-[#E8D5C0] pt-1.5 mt-1.5 flex justify-between font-sans font-black text-sm text-[#D44B1A]">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <div className="font-sans text-[10px] text-[#8B6A4F] text-center mt-1">💵 Cash on Delivery</div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="px-5 pb-5 pt-3 flex gap-2 border-t border-[#FFF0E0] shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border-2 border-[#E8D5C0] font-sans text-sm font-bold text-[#8B6A4F] hover:bg-[#FFF0E0] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!address.trim()}
            className={`flex-[2] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-sans text-sm font-bold text-white transition-all ${
              address.trim()
                ? "bg-[#D44B1A] hover:bg-[#b83d13] shadow-md shadow-[#D44B1A]/25"
                : "bg-[#C4A882] cursor-not-allowed"
            }`}
          >
            <span>Order on WhatsApp</span>
            <ArrowRight size={15} />
          </button>
        </div>

      </div>
    </div>
  );
}