// src/store/index.js
// ─────────────────────────────────────────────────────────────
// Barrel export — import any store from one place:
//
//   import { useMenuStore, useCartStore } from "@/store";
//
// ─────────────────────────────────────────────────────────────
export { default as useAuthStore   } from "./authStore";
export { default as useProfileStore } from "./profileStore";
export { default as useMenuStore   } from "./menuStore";
export { default as useCartStore   } from "./cartStore";
export { default as useOrderStore  } from "./orderStore";
export { default as useReviewStore } from "./reviewStore";
export { default as useStoreStore  } from "./storeStore";
export { default as useFQAStore  } from "./FAQStore";