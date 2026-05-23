import React, { useState } from "react";

// ── Config ────────────────────────────────────────────────────
const WA_NUMBER    = import.meta.env.VITE_WA_NUMBER || "8795755261"; // your WhatsApp number
const DELIVERY_FEE = 20;

// ── Delivery rule helpers ─────────────────────────────────────
const hasPCB = (items) =>
  items.some((i) => ["pizza", "cake", "bake"].includes(i.category));

const isDeliverable = (item, allItems) => {
  if (item.deliverable === true)   return true;
  if (item.deliverable === false)  return false;
  if (item.deliverable === "cond") return hasPCB(allItems);
  return false;
};

// ── WhatsApp message builder ──────────────────────────────────
const buildMessage = (items, address, customerName) => {
  const dlv = items.filter((i) =>  isDeliverable(i, items));
  const pkp = items.filter((i) => !isDeliverable(i, items));

  const sub    = items.reduce((s, i) => s + i.price * i.qty, 0);
  const hasDlv = dlv.length > 0;
  const total  = sub + (hasDlv ? DELIVERY_FEE : 0);

  let msg = "🛍️ *VK BAKES & PIZZA — NEW ORDER!*\n";
  msg    += "━━━━━━━━━━━━━━━━━━━━━━\n\n";

  if (dlv.length) {
    msg += "🚚 *DELIVERY ITEMS:*\n";
    dlv.forEach((i) => {
      msg += `  • ${i.qty}× ${i.name} — ₹${i.price * i.qty}\n`;
    });
  }

  if (pkp.length) {
    msg += "\n🏪 *STORE PICKUP ITEMS:*\n";
    pkp.forEach((i) => {
      msg += `  • ${i.qty}× ${i.name} — ₹${i.price * i.qty}\n`;
    });
  }

  msg += "\n━━━━━━━━━━━━━━━━━━━━━━\n";
  if (customerName) msg += `👤 Name: ${customerName}\n`;
  msg += `📍 Address: ${address || "[Please type your address]"}\n`;
  msg += `💵 Payment: Cash on Delivery\n`;
  if (hasDlv) msg += `🚚 Delivery Charge: ₹${DELIVERY_FEE}\n`;
  msg += `💰 *Total: ₹${total}*`;

  return msg;
};

// ── WhatsApp SVG icon ─────────────────────────────────────────
const WhatsAppIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════
// VARIANT 1 — Cart Order Button
// Pass: items (array), address (string), customerName (string)
// Use on: Cart page — sends full order to WhatsApp
// ═══════════════════════════════════════════════════════════════
export function CartOrderButton({ items = [], address = "", customerName = "", disabled = false, className = "" }) {
  const [pulse, setPulse] = useState(false);

  const sub    = items.reduce((s, i) => s + i.price * i.qty, 0);
  const hasDlv = items.some((i) => isDeliverable(i, items));
  const total  = sub + (hasDlv ? DELIVERY_FEE : 0);
  const qty    = items.reduce((s, i) => s + i.qty, 0);

  const open = () => {
    if (!items.length || disabled) return;
    setPulse(true);
    setTimeout(() => setPulse(false), 600);
    const msg = buildMessage(items, address, customerName);
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const isDisabled = disabled || items.length === 0;

  return (
    <button
      onClick={open}
      disabled={isDisabled}
      className={`
        relative w-full flex items-center justify-between gap-3
        px-5 py-4 rounded-2xl font-bold text-white text-sm
        transition-all duration-200 select-none overflow-hidden
        ${isDisabled
          ? "bg-gray-300 cursor-not-allowed text-gray-400"
          : "bg-[#25D366] hover:bg-[#20b558] active:scale-[0.98] shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
        }
        ${pulse ? "scale-[0.97]" : ""}
        ${className}
      `}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Left — icon + label */}
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isDisabled ? "bg-gray-200" : "bg-white/20"}`}>
          <WhatsAppIcon size={18} />
        </div>
        <div className="text-left">
          <div className="text-sm font-bold leading-tight">
            {isDisabled ? "Add items to order" : "Order on WhatsApp"}
          </div>
          {!isDisabled && (
            <div className="text-xs font-normal opacity-80 leading-tight mt-0.5">
              {qty} item{qty !== 1 ? "s" : ""} · tap to open WhatsApp
            </div>
          )}
        </div>
      </div>

      {/* Right — total */}
      {!isDisabled && (
        <div className="flex-shrink-0 bg-white/20 rounded-xl px-3 py-1.5 text-right">
          <div className="text-xs opacity-80 leading-none mb-0.5">Total</div>
          <div className="text-sm font-black leading-none">₹{total}</div>
        </div>
      )}

      {/* Shimmer effect */}
      {!isDisabled && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2.5s infinite",
          }}
        />
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// VARIANT 2 — Floating Action Button
// No props needed — just opens your WhatsApp
// Use on: All pages as a floating helper button
// ═══════════════════════════════════════════════════════════════
export function WhatsAppFAB({ message = "Hello! I'd like to order from VK Bakes 🍕" }) {
  const [tooltip, setTooltip] = useState(false);

  const open = () =>
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Tooltip */}
      {tooltip && (
        <div
          className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Chat with us 👋
        </div>
      )}

      {/* FAB */}
      <button
        onClick={open}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20b558] text-white shadow-xl shadow-green-500/40 hover:shadow-green-500/60 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon size={26} />

        {/* Ping ring */}
        <span className="absolute w-14 h-14 rounded-full bg-[#25D366] opacity-30 animate-ping" />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// VARIANT 3 — Inline CTA Button
// Sizes: "sm" | "md" | "lg"
// Use on: Hero section, offers banner, menu page CTA
// ═══════════════════════════════════════════════════════════════
export function WhatsAppCTA({
  label   = "Order on WhatsApp",
  message = "Hello! I'd like to order from VK Bakes 🍕",
  size    = "md",
  outline = false,
  className = "",
}) {
  const sizes = {
    sm: "px-4 py-2 text-xs gap-2",
    md: "px-5 py-3 text-sm gap-2.5",
    lg: "px-7 py-4 text-base gap-3",
  };
  const iconSizes = { sm: 14, md: 16, lg: 20 };

  const open = () =>
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");

  return (
    <button
      onClick={open}
      className={`
        inline-flex items-center font-bold rounded-xl transition-all duration-200 active:scale-[0.97]
        ${sizes[size]}
        ${outline
          ? "border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
          : "bg-[#25D366] hover:bg-[#20b558] text-white shadow-md shadow-green-500/20 hover:shadow-green-500/40"
        }
        ${className}
      `}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <WhatsAppIcon size={iconSizes[size]} />
      {label}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// VARIANT 4 — Custom Cake WhatsApp Button
// Pass: cakeForm { size, flavour, message, design, date, phone }
// Use on: CustomCake.jsx form submit
// ═══════════════════════════════════════════════════════════════
export function CakeOrderButton({ cakeForm = {}, disabled = false }) {
  const [loading, setLoading] = useState(false);

  const open = () => {
    if (disabled) return;
    if (!cakeForm.phone || !cakeForm.date) {
      alert("Please fill in your phone number and delivery date!");
      return;
    }
    setLoading(true);
    const msg =
      `🎂 *CUSTOM CAKE ORDER — VK Bakes*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `📱 Phone: ${cakeForm.phone}\n` +
      `🍰 Size: ${cakeForm.size || "1kg"}\n` +
      `🍫 Flavour: ${cakeForm.flavour || "Chocolate"}\n` +
      `✍️ Message on Cake: ${cakeForm.message || "None"}\n` +
      `🎨 Design: ${cakeForm.design || "Simple"}\n` +
      `📅 Delivery Date: ${cakeForm.date}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `⚠️ Min. 2 days advance. Price confirmed by us after receiving this order.`;

    setTimeout(() => {
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
      setLoading(false);
    }, 400);
  };

  return (
    <button
      onClick={open}
      disabled={disabled}
      className={`
        w-full flex items-center justify-center gap-3 py-4 rounded-2xl
        font-bold text-white text-sm transition-all duration-200
        ${disabled
          ? "bg-gray-300 text-gray-400 cursor-not-allowed"
          : "bg-[#25D366] hover:bg-[#20b558] active:scale-[0.98] shadow-lg shadow-green-500/30"
        }
      `}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {loading ? (
        <>
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Opening WhatsApp…
        </>
      ) : (
        <>
          <WhatsAppIcon size={20} />
          Send Cake Order on WhatsApp
        </>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT EXPORT — Smart WhatsAppButton
// Automatically picks the right variant based on props passed.
//
//  Usage examples:
//    <WhatsAppButton />                           → FAB
//    <WhatsAppButton variant="cta" />             → Inline CTA
//    <WhatsAppButton variant="cta" size="lg" />   → Large CTA
//    <WhatsAppButton variant="cta" outline />     → Outlined CTA
//    <WhatsAppButton variant="cart" items={[…]} address="…" /> → Cart button
//    <WhatsAppButton variant="cake" cakeForm={…} /> → Cake order
// ═══════════════════════════════════════════════════════════════
export default function WhatsAppButton({
  variant      = "fab",     // "fab" | "cta" | "cart" | "cake"
  // CTA props
  label        = "Order on WhatsApp",
  message      = "Hello! I'd like to order from VK Bakes 🍕",
  size         = "md",
  outline      = false,
  // Cart props
  items        = [],
  address      = "",
  customerName = "",
  // Cake props
  cakeForm     = {},
  // Shared
  disabled     = false,
  className    = "",
}) {
  if (variant === "cart") {
    return (
      <CartOrderButton
        items={items}
        address={address}
        customerName={customerName}
        disabled={disabled}
        className={className}
      />
    );
  }

  if (variant === "cake") {
    return <CakeOrderButton cakeForm={cakeForm} disabled={disabled} />;
  }

  if (variant === "cta") {
    return (
      <WhatsAppCTA
        label={label}
        message={message}
        size={size}
        outline={outline}
        className={className}
      />
    );
  }

  // Default → FAB
  return <WhatsAppFAB message={message} />;
}