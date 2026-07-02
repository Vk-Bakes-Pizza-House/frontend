// src/utils/orderhelper.js// ─────────────────────────────────────────────────────────────
// Reusable helpers for building, validating, and submitting
// orders from OrderNowModal (and any future order flow).
// ─────────────────────────────────────────────────────────────
import { toast }       from "sonner";
import api  from "../services/api";
import { endpoints }   from "./endpoints";
import { buildMsg, getWhatsApp, isDlv } from "../config";

// ── 1. Build the customised main item object ──────────────────
// Takes all the customisation state and returns a cart-ready item.
//
// Params:
//   item         → raw menu item from DB
//   isPizza      → boolean
//   sizeObj      → { label, priceAdd } | null
//   selectedSize → size key e.g. "rg" | "md" | "lg"
//   extraCheese  → boolean
//   itemPrice    → final price after size + cheese
//   mainQty      → quantity
//
export const buildMainItem = ({
  item,
  isPizza,
  sizeObj,
  selectedSize,
  extraCheese,
  itemPrice,
  mainQty,
}) => {
  const sizeLabel   = isPizza && sizeObj?.priceAdd > 0 ? ` (${sizeObj.label})` : "";
  const cheeseLabel = isPizza && extraCheese ? " + Extra Cheese" : "";
  const itemId      = item?._id || item?.id;

  if (!itemId) {
    console.error("buildMainItem: missing menu item id", item);
    return null;
  }

  const variantId   = `${itemId}-${selectedSize ?? "default"}-${extraCheese ? "cheese" : "no-cheese"}`;

  return {
    ...item,
    _id:      variantId,        // unique per variant so cart treats each size as separate
    menuItem: itemId,           // real MongoDB _id for backend payload
    id:       itemId,
    name:     `${item.name}${sizeLabel}${cheeseLabel}`,
    price:    itemPrice,
    qty:      mainQty,
  };
};

// ── 2. Build addon line items from addons state map ───────────
// Params:
//   activeAddons   → Object.entries(addons).filter(([,q]) => q > 0)
//   allAddonItems  → [...drinks, ...iceCreams]
//
export const buildAddonLines = (activeAddons, allAddonItems) =>
  activeAddons
    .map(([id, q]) => {
      const found = allAddonItems.find((a) => (a._id || a.id) === id);
      if (!found) return null;
      return { ...found, qty: q, deliverable: true };
    })
    .filter(Boolean);

// ── 3. Add main item + addons to cart ─────────────────────────
// Params:
//   add          → useCartStore().addItem
//   mainItem     → result of buildMainItem()
//   addonLines   → result of buildAddonLines()
//
export const addOrderToCart = (add, mainItem, addonLines) => {
  if (!mainItem || !mainItem._id || !mainItem.menuItem) {
    console.error("addOrderToCart: invalid mainItem", mainItem);
    return false;
  }

  add(mainItem, mainItem.qty);
  addonLines.forEach((addon) => add({ ...addon, qty: 1 }, addon.qty));
  return true;
};

// ── 4. Convert cart items → backend Order.items[] payload ─────
// Filters out invalid entries, strips variant IDs, keeps real mongoIds.
//
export const toOrderItemsPayload = (cartItems) =>
  cartItems
    .filter(Boolean)
    .map(({ _id, menuItem, name, price, qty }) => {
      const sourceId = menuItem || _id;
      const entry = {
        name,
        price: Number(price || 0),
        qty:   Number(qty   || 0),
      };
      // Only attach menuItem if it's a real 24-char Mongo ObjectId
      if (typeof sourceId === "string" && /^[0-9a-fA-F]{24}$/.test(sourceId)) {
        entry.menuItem = sourceId;
      }
      return entry;
    })
    .filter((entry) => entry.qty > 0 && entry.name);

// ── 5. Save order to backend + open WhatsApp ──────────────────
// All-in-one: validates → saves to DB → opens WhatsApp.
// WhatsApp always opens even if the backend save fails.
//
// Params:
//   { name, phone, addr }   → customer details
//   mainItem                → result of buildMainItem()
//   addonLines              → result of buildAddonLines()
//   priceSummary            → { subtotal, deliveryFee, total }
//   onDone                  → callback after WhatsApp opens (e.g. onClose)
//
export const confirmAndSendOrder = async ({
  customer: { name, whatsappNumber, addr },
  mainItem,
  addonLines,
  priceSummary: { subtotal, deliveryFee, total },
  onDone,
}) => {
  
  // ── Build backend payload ───────────────────────────────────
  const allCartItems   = mainItem ? [mainItem, ...addonLines] : [...addonLines];
  const itemsPayload   = toOrderItemsPayload(allCartItems);

  if (itemsPayload.length === 0) {
    toast.error("Order must have at least one item.");
    return false;
  }

  const payload = {
    customer: {
       name:    name || "",
      whatsappNumber:   whatsappNumber || "",
      address: addr || "",
    },
    items:          itemsPayload,
    orderType:      isDlv(mainItem, allCartItems) ? "delivery" : "pickup",
    subtotal:       Number(subtotal),
    deliveryCharge: Number(deliveryFee || 0),
    total:          Number(total),
    paymentMethod:  "Cash on Delivery",
  };

  // ── Save to backend (non-blocking — WA opens regardless) ────  
  try {
    await api.post(endpoints.orders.create, payload);
    toast.success("Order saved! Opening WhatsApp…");
  } catch (e) {
    console.warn("Backend order save failed:", e.message || e);
    toast.warning("Could not save order to backend. Opening WhatsApp anyway.");
  }

  // ── Open WhatsApp ───────────────────────────────────────────
  const msg = buildMsg(allCartItems, addr, name, whatsappNumber);
  window.open(`https://wa.me/${getWhatsApp()}?text=${msg}`, "_blank");

  onDone?.();
  return true;
};