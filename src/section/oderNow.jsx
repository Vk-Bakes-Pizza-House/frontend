// src/section/oderNow.jsx

// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { X, ArrowRight, ShoppingBag, ShoppingCart, Loader2 } from "lucide-react";
import { buildMsg, isDlv, getWhatsApp, getDeliveryFees, getFreeDeliveryAbove, getCategory } from "../config";
import { EMOJI, C } from "../data/menu";
import api from "../store/api";
import { endpoints } from "../utils/endpoints";
import {
  QtyControl,
  SizeUpsellBanner,
  AddonSection,
  OrderSummary,
  AddressBox
} from "../components/Order";
import useCartStore from "../store/cartStore";
import { toast } from "sonner";

import useOrderSubmit from "../hooks/orderSubmit";



// ─────────────────────────────────────────────────────────────

export default function OrderNowModal({ item, onClose, initialSize = null }) {
  const sizes = item?.sizes || [];
  
  const category = getCategory(item);
  const { addItem: add, logOrder } = useCartStore()

  console.log("OrderNowModal render", { item });
  const isPizza = category === "pizza";


  // ── State ────────────────────────────────────────────────
  const [mainQty, setMainQty] = useState(1);
const [selectedSize, setSize] = useState(
    initialSize || (sizes.length > 0 ? sizes[0] : null)
  );
    const [extraCheese, setExtraCheese] = useState(false);
  const [addons, setAddons] = useState({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  const [drinks, setDrinks] = useState([]);
  const [iceCreams, setIceCreams] = useState([]);
  const [loadingAddons, setLoadingAddons] = useState(true);
  const [addonError, setAddonError] = useState(null);
  const [showDrinks, setShowDrinks] = useState(false);
  const [showIce, setShowIce] = useState(false);
  const [whatsappLoading, setWhatsappLoading] = useState(false)

  const inputRef = useRef(null);


  // ── Price calculations ────────────────────────────────────
  const cheeseAdd = isPizza && extraCheese ? 30 : 0;
  const itemPrice = selectedSize ? selectedSize.price : item.price;

  const allAddonItems = [...drinks, ...iceCreams];
  const activeAddons = Object.entries(addons).filter(([, q]) => q > 0);

  const addonTotal = activeAddons.reduce((s, [id, q]) => {
    const f = allAddonItems.find((a) => (a._id || a.id) === id);
    return s + (f ? f.price * q : 0);
  }, 0);

  const subtotal = itemPrice * mainQty + addonTotal;
  const deliveryFee = subtotal >= getFreeDeliveryAbove() ? 0 : getDeliveryFees();
  const total = subtotal + deliveryFee;
  const remaining = Math.max(0, getFreeDeliveryAbove() - subtotal);

  const { handleAddToCart, handleConfirmOrder } = useOrderSubmit({
    item, isPizza,  selectedSize,
    extraCheese, itemPrice, mainQty,
    activeAddons, allAddonItems,
    subtotal, deliveryFee, total,
    add, onClose,
  });


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
          api.get(endpoints.menu.getAll, { params: { category: "ice", all: "true" } }),
        ]);
        setDrinks(dr.data?.data ?? []);
        setIceCreams(ic.data?.data ?? []);
      } catch (e) {
        setAddonError("Could not load add-ons");
      } finally {
        setLoadingAddons(false);
      }
    })();
  }, []);



  // ── Add-on qty helper ─────────────────────────────────────
  const setAddonQty = (id, delta) =>
    setAddons((prev) => {
      const next = (prev[id] ?? 0) + delta;
      if (next <= 0) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: next };
    });


  const handleWhatsAppClick = () => {
    // if (!mainQty.length) return;
    setIsOpen(true); // Popup open karo
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
              <span className={`mt-1 inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full ${isDlv(item, [item]) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
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

          {isPizza && sizes.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="font-sans text-sm font-bold text-[#2D1400]">📐 Choose Size</p>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map(s => (
                  <button
                    key={s._id}
                    onClick={() => setSize(s)}
                    className={`flex flex-col items-center py-2.5 px-2 rounded-xl border-2 transition-all ${selectedSize?._id === s._id
                        ? "border-[#D44B1A] bg-[#FFF3EE]"
                        : "border-[#E8D5C0] bg-white hover:bg-[#FFF8F3]"
                      }`}
                  >
                    <span className={`text-xs font-semibold leading-snug ${selectedSize?._id === s._id ? "text-[#D44B1A]" : "text-[#2D1400]"
                      }`}>
                      {s.label}
                    </span>
                    <span className={`text-[11px] font-bold mt-0.5 ${selectedSize?._id === s._id ? "text-[#D44B1A]" : "text-[#8B6A4F]"
                      }`}>
                      ₹{s.price}
                    </span>
                    {s.tag && (
                      <span className="text-[9px] text-amber-600 font-semibold mt-0.5">
                        {s.tag}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3 ── Extra cheese (pizza only) */}
          {isPizza && (
            <button
              onClick={() => setExtraCheese((v) => !v)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 transition-all ${extraCheese
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
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${extraCheese ? "translate-x-6" : "translate-x-1"
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

          {/* 7 ── Order summary */}
          <OrderSummary
            item={item}
            qty={mainQty}
            itemPrice={itemPrice}
            isPizza={isPizza}
            sizeObj={selectedSize}
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
              onClick={() => handleAddToCart()}
              className="flex-[2] flex items-center justify-center gap-2 py-2.5 px-4
                         rounded-xl border-2 border-[#D44B1A] bg-[#FFF3EE] hover:bg-[#FFE8E0]
                         font-sans text-sm font-bold text-[#D44B1A] transition-colors"
            >
              <ShoppingCart size={15} />
              Add to Cart · ₹{total}
            </button>
          </div>

          {/* Row 2: Order on WhatsApp (needs addr) */}
          <button
            onClick={handleWhatsAppClick}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D44B1A] hover:bg-[#b83d13] shadow-md shadow-[#D44B1A]/25 font-sans text-sm font-bold text-white transition-all"
          >
            <span>Order on WhatsApp</span>
            <ArrowRight size={15} />
          </button>
          {/* --- POPUP MODAL FOR ADDRESS DETAILS --- */}
          {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative border animate-scale-up" style={{ borderColor: C.border }}>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-700"
                >
                  <X size={20} />
                </button>

                {/* Modal Title */}
                <h3 className="text-xl font-bold mb-4 pr-6" style={{ color: C.mid, fontFamily: C.f1 }}>
                  Enter Delivery Address
                </h3>

                {/* Address Form Component */}
                <div className="mb-6 max-h-[60vh] overflow-y-auto pr-1">
                  <AddressBox
                    value={addr}
                    name={name}
                    phone={phone}
                    onChange={setAddr}
                    setName={setName}
                    setPhone={setPhone}
                  />
                </div>

                {/* Action Buttons inside Popup */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setWhatsappLoading(true);
                      try {
                        await handleConfirmOrder(name, phone, addr);
                      } finally {
                        setWhatsappLoading(false);
                      }
                    }}
                    disabled={whatsappLoading}
                    className={`flex-1 py-3 rounded-xl text-white font-bold text-sm transition-all active:scale-95 ${whatsappLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                    style={{ background: C.green }}
                  >
                    {whatsappLoading ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        Confirming...
                      </span>
                    ) : (
                      "Confirm Order"
                    )}
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}