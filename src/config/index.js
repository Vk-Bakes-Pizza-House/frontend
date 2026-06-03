// src/config.js
// ─────────────────────────────────────────────────────────────
// Shared constants & helpers used across cart, item cards, etc.
// Supports both legacy field names (cat, dlv) and DB field names
// (category, deliverable) so nothing breaks regardless of source.
// ─────────────────────────────────────────────────────────────
import { useStoreStore } from "../store/index.js";

// 1. Static Configuration


// 2. Dynamic Getters (Yeh functions direct aapke store se current value nikal ke denge)
export const getWhatsApp = () => useStoreStore.getState().store?.phone1 || "";
export const getPhone1 = () => useStoreStore.getState().store?.phone1 || "";
export const getPhone2 = () => useStoreStore.getState().store?.phone2 || "";
export const getFreeDeliveryAbove = () => useStoreStore.getState().store?.freeDeliveryFee || 300;
export const getDeliveryFees = () => useStoreStore.getState().store?.deliveryFee || 300;
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
export const buildMsg = (cart, addr,name,phone ) => {
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
  const deliveryFee = hasDlv && sub < getFreeDeliveryAbove() ? getDeliveryFees() : 0;

  m += `💵 Payment: Cash on Delivery\n`;
  if (deliveryFee > 0) m += `🚚 Delivery Charge: ₹${deliveryFee}\n`;
  m += `💰 Total: ₹${sub + deliveryFee}\n`;
  m += `\n📍 Name: ${name?.trim() || "[Please add your name]"}\n`;
  m += `\n📍 Phone: ${phone?.trim() || "[Please add your phone number]"}\n`;
  m += `\n📍 Address: ${addr?.trim() || "[Please add your address]"}\n`;

  return encodeURIComponent(m);
};