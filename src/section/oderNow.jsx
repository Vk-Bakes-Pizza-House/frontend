// src/section/oderNow.jsx
// ─────────────────────────────────────────────────────────────
// "Customise & Order" modal — opened from ItemCard.
//
// Features:
//  • Pizza size picker + upsell suggestion banner
//  • Main item qty control
//  • Extra cheese toggle (pizza only)
//  • Add-ons: cold drinks & ice cream (fetched from API)
//  • Address input
//  • Order summary with free delivery ≥ ₹300
//  • Two CTAs: "Add to Cart" and "Order on WhatsApp"
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { MapPin, X, ArrowRight, ShoppingBag, ShoppingCart } from "lucide-react";
import { WA, buildMsg, isDlv, DELIVERY_FEE, getCategory } from "../config";
import { EMOJI } from "../data/menu";
import api from "../store/api";
import { endpoints } from "../utils/endpoints";
import {
  QtyControl,
  SizeUpsellBanner,
  AddonSection,
  OrderSummary,
} from "../components/Order";
import useCartStore from "../store/cartStore";

// ─────────────────────────────────────────────────────────────
const FREE_DELIVERY_ABOVE = 300;

const PIZZA_SIZES = [
  { label: 'Regular (8")',  key: "rg", priceAdd:  0 },
  { label: 'Medium  (10")', key: "md", priceAdd: 100 },
  { label: 'Large   (12")', key: "lg", priceAdd: 200 },
];

// ─────────────────────────────────────────────────────────────

export default function OrderNowModal({ item, onClose }) {
  const category = getCategory(item);
  const { addItem: add } = useCartStore();
  const isPizza  = category === "pizza";

  // ── State ────────────────────────────────────────────────
  const [mainQty,      setMainQty]      = useState(1);
  const [selectedSize, setSize]         = useState("rg");
  const [extraCheese,  setExtraCheese]  = useState(false);
  const [addons,       setAddons]       = useState({});
  const [address,      setAddress]      = useState("");

  const [drinks,        setDrinks]        = useState([]);
  const [iceCreams,     setIceCreams]     = useState([]);
  const [loadingAddons, setLoadingAddons] = useState(true);
  const [addonError,    setAddonError]    = useState(null);
  const [showDrinks,    setShowDrinks]    = useState(false);
  const [showIce,       setShowIce]       = useState(false);

  const inputRef = useRef(null);

  // ── Keyboard / focus ─────────────────────────────────────
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 120); }, []);
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  // ── Fetch add-ons ─────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoadingAddons(true);
      try {
        const [dr, ic] = await Promise.all([
          api.get(endpoints.menu.getAll, { params: { category: "drink", all: "true" } }),
          api.get(endpoints.menu.getAll, { params: { category: "ice",   all: "true" } }),
        ]);
        setDrinks(dr.data?.data   ?? []);
        setIceCreams(ic.data?.data ?? []);
      } catch (e) {
        setAddonError("Could not load add-ons");
      } finally {
        setLoadingAddons(false);
      }
    })();
  }, []);

  // ── Price calculations ────────────────────────────────────
  const sizeObj    = PIZZA_SIZES.find((s) => s.key === selectedSize);
  const sizeAdd    = isPizza ? (sizeObj?.priceAdd ?? 0) : 0;
  const cheeseAdd  = isPizza && extraCheese ? 30 : 0;
  const itemPrice  = item.price + sizeAdd + cheeseAdd;

  const allAddonItems  = [...drinks, ...iceCreams];
  const activeAddons   = Object.entries(addons).filter(([, q]) => q > 0);

  const addonTotal  = activeAddons.reduce((s, [id, q]) => {
    const f = allAddonItems.find((a) => (a._id || a.id) === id);
    return s + (f ? f.price * q : 0);
  }, 0);

  const subtotal    = itemPrice * mainQty + addonTotal;
  const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const total       = subtotal + deliveryFee;
  const remaining   = Math.max(0, FREE_DELIVERY_ABOVE - subtotal);

  // ── Add-on qty helper ─────────────────────────────────────
  const setAddonQty = (id, delta) =>
    setAddons((prev) => {
      const next = (prev[id] ?? 0) + delta;
      if (next <= 0) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: next };
    });

  // ── Build customised item name ────────────────────────────
  const buildMainItem = () => {
    const sizeLabel   = isPizza && sizeObj?.priceAdd > 0 ? ` (${sizeObj.label})` : "";
    const cheeseLabel = isPizza && extraCheese ? " + Extra Cheese" : "";
    const itemId = item?._id || item?.id;
    const variantId = `${itemId}-${selectedSize}-${extraCheese ? "cheese" : "no-cheese"}`;

    return {
      ...item,
      _id: variantId,
      id: itemId,
      name: `${item.name}${sizeLabel}${cheeseLabel}`,
      price: itemPrice,
      qty: mainQty,
    };
  };

  // ── Add to cart ───────────────────────────────────────────
  const handleAddToCart = () => {
    const main = buildMainItem();
    add(main, mainQty);

    activeAddons.forEach(([id, q]) => {
      const found = allAddonItems.find((a) => (a._id || a.id) === id);
      if (found) add({ ...found, qty: 1, deliverable: true }, q);
    });

    onClose();
  };

  // ── WhatsApp order ────────────────────────────────────────
  const handleWhatsApp = () => {
    if (!address.trim()) { inputRef.current?.focus(); return; }

    const addonLines = activeAddons.map(([id, q]) => {
      const f = allAddonItems.find((a) => (a._id || a.id) === id);
      return { ...f, qty: q, deliverable: true };
    });

    const msg = buildMsg([buildMainItem(), ...addonLines], address);
    window.open(`https://wa.me/${WA}?text=${msg}`, "_blank");
    onClose();
  };

  // ─────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#FFF0E0] bg-[#FFF8F3] shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag size={17} className="text-[#D44B1A]" />
            <span className="font-sans font-bold text-[#2D1400] text-base">
              Customise & Order
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#E8D5C0]/40 hover:bg-[#E8D5C0]/80 flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-[#8B6A4F]" />
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────── */}
        <div className="flex flex-col gap-4 px-5 py-4 overflow-y-auto">

          {/* 1 ── Item card with live price + qty control */}
          <div className="flex items-center gap-3 p-3 bg-[#FFF8F3] rounded-xl border border-[#E8D5C0]">
            {(item.imageUrl || item.image) ? (
              <img
                src={item.imageUrl || item.image}
                alt={item.name}
                className="w-14 h-14 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-[#FFE8CC] flex items-center justify-center text-2xl shrink-0">
                {EMOJI[category] || "🍽️"}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="font-sans font-bold text-[#2D1400] text-sm truncate">{item.name}</p>
              <p className="font-sans text-xs text-[#8B6A4F] mt-0.5">Base ₹{item.price}</p>
              <span className={`mt-1 inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDlv(item, [item]) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}>
                {isDlv(item, [item]) ? "🚚 Delivers" : "🏪 Pickup only"}
              </span>
            </div>

            {/* Live item price + qty stepper */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="font-sans font-black text-base text-[#D44B1A]">
                ₹{itemPrice * mainQty}
              </span>
              <QtyControl
                qty={mainQty}
                onInc={() => setMainQty((n) => n + 1)}
                onDec={() => setMainQty((n) => Math.max(1, n - 1))}
              />
            </div>
          </div>

          {/* 2 ── Pizza size picker */}
          {isPizza && (
            <div className="flex flex-col gap-2">
              <p className="font-sans text-sm font-bold text-[#2D1400]">📐 Choose Size</p>

              <div className="grid grid-cols-3 gap-2">
                {PIZZA_SIZES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSize(s.key)}
                    className={`flex flex-col items-center py-2.5 px-2 rounded-xl border-2 transition-all ${
                      selectedSize === s.key
                        ? "border-[#D44B1A] bg-[#FFF3EE]"
                        : "border-[#E8D5C0] bg-white hover:bg-[#FFF8F3]"
                    }`}
                  >
                    <span className={`font-sans text-xs font-semibold leading-snug ${
                      selectedSize === s.key ? "text-[#D44B1A]" : "text-[#2D1400]"
                    }`}>
                      {s.label}
                    </span>
                    <span className={`font-sans text-[11px] font-bold mt-0.5 ${
                      selectedSize === s.key ? "text-[#D44B1A]" : "text-[#8B6A4F]"
                    }`}>
                      {s.priceAdd === 0 ? "Base" : `+₹${s.priceAdd}`}
                    </span>
                  </button>
                ))}
              </div>

              {/* Upsell suggestion banner */}
              <SizeUpsellBanner
                selectedKey={selectedSize}
                sizes={PIZZA_SIZES}
                onSelect={setSize}
              />
            </div>
          )}

          {/* 3 ── Extra cheese (pizza only) */}
          {isPizza && (
            <button
              onClick={() => setExtraCheese((v) => !v)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 transition-all ${
                extraCheese
                  ? "border-[#D44B1A] bg-[#FFF3EE]"
                  : "border-[#E8D5C0] bg-white hover:bg-[#FFF8F3]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🧀</span>
                <div className="text-left">
                  <p className={`font-sans font-bold text-sm ${extraCheese ? "text-[#D44B1A]" : "text-[#2D1400]"}`}>
                    Extra Cheese
                  </p>
                  <p className="font-sans text-[11px] text-[#8B6A4F]">+₹30</p>
                </div>
              </div>
              {/* Toggle pill */}
              <div className={`w-11 h-6 rounded-full relative transition-colors ${extraCheese ? "bg-[#D44B1A]" : "bg-[#E8D5C0]"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  extraCheese ? "translate-x-6" : "translate-x-1"
                }`} />
              </div>
            </button>
          )}

          {/* 4 ── Cold drinks */}
          <AddonSection
            title="Add Cold Drinks"
            emoji="🥤"
            items={drinks}
            addons={addons}
            onQtyChange={setAddonQty}
            open={showDrinks}
            onToggle={() => setShowDrinks((v) => !v)}
            loading={loadingAddons}
            error={addonError}
          />

          {/* 5 ── Ice cream */}
          <AddonSection
            title="Add Ice Cream"
            emoji="🍦"
            items={iceCreams}
            addons={addons}
            onQtyChange={setAddonQty}
            open={showIce}
            onToggle={() => setShowIce((v) => !v)}
            loading={loadingAddons}
            error={addonError}
          />

          {/* 6 ── Address (needed for WhatsApp order) */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-sm font-bold text-[#2D1400] flex items-center gap-1.5">
              <MapPin size={13} className="text-[#D44B1A]" />
              Delivery Address
              <span className="font-normal text-[#C4A882] text-xs">(for WhatsApp order)</span>
            </label>
            <textarea
              ref={inputRef}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleWhatsApp(); }
              }}
              placeholder="House no., street, area, landmark…"
              rows={2}
              className="w-full px-3 py-2.5 border-2 border-[#E8D5C0] focus:border-[#D44B1A]
                         focus:ring-2 focus:ring-[#D44B1A]/10 rounded-xl font-sans text-sm
                         text-[#2D1400] placeholder-[#C4A882] outline-none transition-all
                         resize-none bg-white"
            />
          </div>

          {/* 7 ── Order summary */}
          <OrderSummary
            item={item}
            qty={mainQty}
            itemPrice={itemPrice}
            isPizza={isPizza}
            sizeObj={sizeObj}
            extraCheese={extraCheese}
            activeAddons={activeAddons}
            allAddonItems={allAddonItems}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            total={total}
            remaining={remaining}
          />
        </div>

        {/* ── Footer — two CTAs ────────────────────────────── */}
        <div className="px-5 pb-5 pt-3 flex flex-col gap-2 border-t border-[#FFF0E0] shrink-0">
          {/* Row 1: Cancel + Add to Cart */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border-2 border-[#E8D5C0] font-sans
                         text-sm font-bold text-[#8B6A4F] hover:bg-[#FFF0E0] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-[2] flex items-center justify-center gap-2 py-2.5 px-4
                         rounded-xl border-2 border-[#D44B1A] bg-[#FFF3EE] hover:bg-[#FFE8E0]
                         font-sans text-sm font-bold text-[#D44B1A] transition-colors"
            >
              <ShoppingCart size={15} />
              Add to Cart · ₹{total}
            </button>
          </div>

          {/* Row 2: Order on WhatsApp (needs address) */}
          <button
            onClick={handleWhatsApp}
            disabled={!address.trim()}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl
                        font-sans text-sm font-bold text-white transition-all ${
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