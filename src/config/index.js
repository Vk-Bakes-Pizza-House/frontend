// src/config.js
// ─────────────────────────────────────────────────────────────
// Shared constants & helpers used across cart, item cards, etc.
// Supports both legacy field names (cat, dlv) and DB field names
// (category, deliverable) so nothing breaks regardless of source.
// ─────────────────────────────────────────────────────────────

export const WA           = "919999999999"; // ← Replace with your WhatsApp number
export const DELIVERY_FEE = 20;

// ── Field-name normalizers ────────────────────────────────────
// DB returns `category` & `deliverable`; old static data used `cat` & `dlv`
export const getCategory    = (item) => {
  if (!item) return "";
  return item.category  || item.cat || "";
};
export const getDeliverable = (item) => {
  if (!item) return false;
  return item.deliverable !== undefined
    ? item.deliverable
    : item.dlv;
};

// ── Delivery rule helpers ─────────────────────────────────────
// Does the cart contain at least one pizza / cake / bake item?
export const hasPCB = (cart) =>
  cart.some((i) => ["pizza", "cake"].includes(getCategory(i)));

// Is this specific item deliverable given the current cart?
export const isDlv = (item, cart) => {
  if (!item || !cart) return false;
  const dlv = getDeliverable(item);
  if (dlv === true)   return true;
  if (dlv === "cond") return hasPCB(cart);  // ice cream — only if pizza/cake/bake present
  return false;                             // bread, toast, biscuit → pickup only
};

// ── WhatsApp message builder ──────────────────────────────────
// Returns encodeURIComponent-ready string for wa.me link
export const buildMsg = (cart, addr) => {
  const dlv = cart.filter((i) =>  isDlv(i, cart));
  const pkp = cart.filter((i) => !isDlv(i, cart));

  let m = "🛍️ VK BAKES & PIZZA — NEW ORDER!\n\n";

  if (dlv.length) {
    m += "🚚 DELIVERY ITEMS:\n";
    dlv.forEach((i) => (m += `• ${i.qty}x ${i.name} — ₹${i.price * i.qty}\n`));
  }
  if (pkp.length) {
    m += "\n🏪 STORE PICKUP:\n";
    pkp.forEach((i) => (m += `• ${i.qty}x ${i.name} — ₹${i.price * i.qty}\n`));
  }

  const sub    = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const hasDlv = dlv.length > 0;
  const deliveryFee = hasDlv && sub < 300 ? DELIVERY_FEE : 0;

  m += `\n📍 Address: ${addr?.trim() || "[Please add your address]"}\n`;
  m += `💵 Payment: Cash on Delivery\n`;
  if (deliveryFee > 0) m += `🚚 Delivery Charge: ₹${DELIVERY_FEE}\n`;
  m += `💰 Total: ₹${sub + deliveryFee}`;

  return encodeURIComponent(m);
};