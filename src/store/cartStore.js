// src/store/useCartStore.js
// ─────────────────────────────────────────────────────────────
// Shopping cart store — pure client-side, no API calls.
// Handles delivery rules and builds the WhatsApp order message.
//
// Business rules (from your spec):
//   Deliverable    → pizza, bake, cake
//   Conditional    → ice cream (only if pizza/bake/cake also in cart)
//   Pickup only    → bread, toast, biscuit
//   Delivery fee   → ₹20 flat
//   Payment        → Cash on Delivery only
// ─────────────────────────────────────────────────────────────
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import api from "./api";
import { endpoints } from "../utils/endpoints";

const WA           = import.meta.env.VITE_WA_NUMBER || "919999999999";
const DELIVERY_FEE = 20;

// ── Delivery rule helpers ─────────────────────────────────────
const hasPCB = (items) =>
  items.some((i) => ["pizza", "cake", "bake"].includes(i.category));

const isItemDeliverable = (item, allItems) => {
  if (item.deliverable === true)     return true;
  if (item.deliverable === false)    return false;
  if (item.deliverable === "cond")   return hasPCB(allItems);
  return false;
};

// ── WhatsApp message builder ──────────────────────────────────
const buildWhatsAppMessage = (items, address) => {
  const dlvItems = items.filter((i) =>  isItemDeliverable(i, items));
  const pkpItems = items.filter((i) => !isItemDeliverable(i, items));

  let msg = "🛍️ VK BAKES & PIZZA — NEW ORDER!\n\n";

  if (dlvItems.length) {
    msg += "🚚 DELIVERY ITEMS:\n";
    dlvItems.forEach((i) => (msg += `• ${i.qty}x ${i.name} — ₹${i.price * i.qty}\n`));
  }
  if (pkpItems.length) {
    msg += "\n🏪 STORE PICKUP ITEMS:\n";
    pkpItems.forEach((i) => (msg += `• ${i.qty}x ${i.name} — ₹${i.price * i.qty}\n`));
  }

  const sub   = items.reduce((s, i) => s + i.price * i.qty, 0);
  const hasDlv = dlvItems.length > 0;

  msg += `\n📍 Address: ${address || "[Please type your address]"}\n`;
  msg += `💵 Payment: Cash on Delivery\n`;
  if (hasDlv) msg += `🚚 Delivery Charge: ₹${DELIVERY_FEE}\n`;
  msg += `💰 Total: ₹${sub + (hasDlv ? DELIVERY_FEE : 0)}`;

  return msg;
};

const useCartStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ── State ─────────────────────────────────────────────
        items:   [],   // { _id, name, category, price, deliverable, qty }
        address: "",

        // ── Computed ──────────────────────────────────────────
        totalQty: () => get().items.reduce((s, i) => s + i.qty, 0),

        subtotal: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),

        deliveryTotal: () => {
          const hasDlv = get().items.some((i) => isItemDeliverable(i, get().items));
          return hasDlv ? DELIVERY_FEE : 0;
        },

        grandTotal: () => get().subtotal() + get().deliveryTotal(),

        hasIceCreamWithoutBase: () => {
          const { items } = get();
          return items.some((i) => i.deliverable === "cond") && !hasPCB(items);
        },

        deliverableItems: () =>
          get().items.filter((i) => isItemDeliverable(i, get().items)),

        pickupOnlyItems: () =>
          get().items.filter((i) => !isItemDeliverable(i, get().items)),

        isDeliverable: (item) => isItemDeliverable(item, get().items),

        // ── Cart actions ──────────────────────────────────────
        addItem: (item) => {
          set((s) => {
            const exists = s.items.find((i) => i._id === item._id);
            if (exists) {
              return { items: s.items.map((i) => i._id === item._id ? { ...i, qty: i.qty + 1 } : i) };
            }
            return { items: [...s.items, { ...item, qty: 1 }] };
          });
        },

        removeItem: (id) => {
          set((s) => ({ items: s.items.filter((i) => i._id !== id) }));
        },

        updateQty: (id, delta) => {
          set((s) => {
            const updated = s.items
              .map((i) => i._id === id ? { ...i, qty: i.qty + delta } : i)
              .filter((i) => i.qty > 0);
            return { items: updated };
          });
        },

        setAddress: (address) => set({ address }),

        clearCart: () => set({ items: [], address: "" }),

        // ── WhatsApp order ────────────────────────────────────
        openWhatsApp: () => {
          const { items, address } = get();
          if (!items.length) return;
          const msg = buildWhatsAppMessage(items, address);
          window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, "_blank");
        },

        // ── Log order to backend (optional but recommended) ───
        // Called alongside openWhatsApp so order is recorded in DB
        logOrder: async (customerName, customerPhone) => {
          const { items, address } = get();
          const dlvItems = items.filter((i) =>  isItemDeliverable(i, items));

          const payload = {
            customer: { name: customerName, phone: customerPhone, address },
            items:    items.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
            orderType:      dlvItems.length > 0 ? "delivery" : "pickup",
            subtotal:       get().subtotal(),
            deliveryCharge: get().deliveryTotal(),
            total:          get().grandTotal(),
          };

          try {
            const { data } = await api.post(endpoints.orders.create, payload);
            return { success: true, orderId: data.orderId };
          } catch (err) {
            // Non-blocking — WhatsApp message still goes through
            console.warn("Order log failed:", err.message);
            return { success: false };
          }
        },
      }),
      {
        name:    "vk-cart",          // key in localStorage
        partialize: (s) => ({ items: s.items, address: s.address }),
      }
    ),
    { name: "CartStore" }
  )
);

export default useCartStore;