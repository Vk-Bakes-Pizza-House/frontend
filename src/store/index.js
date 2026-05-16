// src/store/index.js
// ─────────────────────────────────────────────────────────────
// Barrel export — import any store from one place:
//
//   import { useMenuStore, useCartStore } from "@/store";
//
// ─────────────────────────────────────────────────────────────
export { default as useAuthStore   } from "./useAuthStore";
export { default as useMenuStore   } from "./useMenuStore";
export { default as useCartStore   } from "./useCartStore";
export { default as useOrderStore  } from "./useOrderStore";
export { default as useReviewStore } from "./useReviewStore";