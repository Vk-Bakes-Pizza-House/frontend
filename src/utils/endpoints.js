
const API_BASE = import.meta.env.VITE_API_URL;

// If `API_BASE` already includes the `/api` prefix (e.g. https://host.com/api)
// we must not add another `/api` when building production endpoint paths.
const _rawBase = (API_BASE || "").replace(/\/+$/g, "");
const _baseHasApi = _rawBase.endsWith("/api");
const API_PREFIX = _baseHasApi ? "" : "/api";

// ─────────────────────────────────────────────
// DEVELOPMENT ENDPOINTS
// ─────────────────────────────────────────────
const endpointsPathsDev = {
  auth: {
    login: `${API_BASE}/admin/login`,
    seed: `${API_BASE}/admin/seed`,
    me: `${API_BASE}/admin/me`,
    changePassword: `${API_BASE}/admin/change-password`,
    updateProfile: `${API_BASE}/admin/profile`,
    notifications: `${API_BASE}/admin/notifications`,
    sessions: `${API_BASE}/admin/security/sessions`,
    session: (id) => `${API_BASE}/admin/security/sessions/${id}`,
  },

  menu: {
    getAll: `${API_BASE}/menu/item`,
    getById: (id) => `${API_BASE}/menu/item/${id}`,
    create: `${API_BASE}/menu/item`,
    update: (id) => `${API_BASE}/menu/item/${id}`,
    delete: (id) => `${API_BASE}/menu/item/${id}`,
    toggleAvailability: (id) =>
      `${API_BASE}/menu/item/${id}/toggle`,
    //category
    getAllMenu: `${API_BASE}/menu`,
    createMenu: `${API_BASE}/menu`,
    deleteMenu: (id) => `${API_BASE}/menu/${id}`,
  },

  orders: {
    create: `${API_BASE}/orders`,
    getAll: `${API_BASE}/orders`,
    getStats: `${API_BASE}/orders/stats`,
    getById: (id) => `${API_BASE}/orders/${id}`,
    updateStatus: (id) =>
      `${API_BASE}/orders/${id}/status`,
    delete: (id) => `${API_BASE}/orders/${id}`,
    deleteAll: `${API_BASE}/orders`,
    revenue : `${API_BASE}/revenue`
  },
 sales: {
    // CRUD
    create: `${API_BASE}/sales`,
    getAll: `${API_BASE}/sales`,
    getById: (id) => `${API_BASE}/sales/${id}`,
    update: (id) => `${API_BASE}/sales/${id}`,
    delete: (id) => `${API_BASE}/sales/${id}`,

    // Analytics
    overview: `${API_BASE}/sales/overview`,
    daily: `${API_BASE}/sales/daily`,
    monthly: `${API_BASE}/sales/monthly`,
    payments: `${API_BASE}/sales/payments`,
    topProducts: `${API_BASE}/sales/top-products`,
  },
 expenses: {
    // expenses CRUD
    base: `${API_BASE}/expenses`,
    getAll: `${API_BASE}/expenses`,
    create: `${API_BASE}/expenses`,
    getById: (id) => `${API_BASE}/expenses/${id}`,
    update: (id) => `${API_BASE}/expenses/${id}`,
    delete: (id) => `${API_BASE}/expenses/${id}`,
    analytics: `${API_BASE}/expenses/analytics`,

    // Categories
    categories: `${API_BASE}/expenses/categories`,
    fetchAll: `${API_BASE}/expenses/categories`,
    createCategory: `${API_BASE}/expenses/categories`,
    updateCategory: (id) => `${API_BASE}/expenses/categories/${id}`,
    deleteCategory: (id) => `${API_BASE}/expenses/categories/${id}`,
    summary: `${API_BASE}/expenses/category-summary`
  },
  reviews: {
    getApproved: `${API_BASE}/reviews`,
    submit: `${API_BASE}/reviews`,
    getAll: `${API_BASE}/reviews/all`,
    updateStatus: (id) =>
      `${API_BASE}/reviews/${id}`,
    delete: (id) => `${API_BASE}/reviews/${id}`,
  },
  FAQ:{
    getAll: `${API_BASE}/faqs`,
    create: `${API_BASE}/faqs`,
    update: (id) => `${API_BASE}/faqs/${id}`,
    delete: (id) => `${API_BASE}/faqs/${id}`,
  },
  store: {
    get: `${API_BASE}/store`,
    update: `${API_BASE}/store/update`,
    toggle: `${API_BASE}/store/toggle-status`
  },

  upload: {
    image: `${API_BASE}/upload`,
  },
};

// ─────────────────────────────────────────────
// PRODUCTION ENDPOINTS
// ─────────────────────────────────────────────
const endpointsPathsProd = {
  auth: {
    login: `${API_PREFIX}/admin/login`,
    seed: `${API_PREFIX}/admin/seed`,
    me: `${API_PREFIX}/admin/me`,
    changePassword: `${API_PREFIX}/admin/change-password`,
    updateProfile: `${API_PREFIX}/admin/profile`,
    notifications: `${API_PREFIX}/admin/notifications`,
    sessions: `${API_PREFIX}/admin/security/sessions`,
    session: (id) => `${API_PREFIX}/admin/security/sessions/${id}`,
  },

  menu: {
    getAll: `${API_PREFIX}/menu/item`,
    getById: (id) => `${API_PREFIX}/menu/item/${id}`,
    create: `${API_PREFIX}/menu/item`,
    update: (id) => `${API_PREFIX}/menu/item/${id}`,
    delete: (id) => `${API_PREFIX}/menu/item/${id}`,
    toggleAvailability: (id) =>
      `${API_PREFIX}/menu/item/${id}/toggle`,
    //category
    getAllMenu: `/api/menu`,
    createMenu: `/api/menu`,
    deleteMenu: (id) => `/api/menu/${id}`,
  },

  orders: {
    create: `${API_PREFIX}/orders`,
    getAll: `${API_PREFIX}/orders`,
    getStats: `${API_PREFIX}/orders/stats`,
    getById: (id) => `${API_PREFIX}/orders/${id}`,
    updateStatus: (id) =>
      `${API_PREFIX}/orders/${id}/status`,
    delete: (id) => `${API_PREFIX}/orders/${id}`,
    deleteAll: `${API_PREFIX}/orders`,
    revenue: `${API_PREFIX}/orders/revenue`
  },

   sales: {
    // CRUD
    create: `${API_PREFIX}/sales`,
    getAll: `${API_PREFIX}/sales`,
    getById: (id) => `${API_PREFIX}/sales/${id}`,
    update: (id) => `${API_PREFIX}/sales/${id}`,
    delete: (id) => `${API_PREFIX}/sales/${id}`,

    // Analytics
    overview: `/api/sales/overview`,
    daily: `/api/sales/daily`,
    monthly: `/api/sales/monthly`,
    payments: `/api/sales/payments`,
    topProducts: `/api/sales/top-products`,
  },
 expenses: {
    // expenses CRUD
    base: `${API_PREFIX}/expenses`,
    getAll: `${API_PREFIX}/expenses`,
    create: `${API_PREFIX}/expenses`,
    getById: (id) => `${API_PREFIX}/expenses/${id}`,
    update: (id) => `${API_PREFIX}/expenses/${id}`,
    delete: (id) => `${API_PREFIX}/expenses/${id}`,
    analytics: `${API_PREFIX}/expenses/analytics`,

    // Categories
    categories: `${API_PREFIX}/expenses/categories`,
    fetchAll: `${API_PREFIX}/expenses/categories`,
    createCategory: `${API_PREFIX}/expenses/categories`,
    updateCategory: (id) => `${API_PREFIX}/expenses/categories/${id}`,
    deleteCategory: (id) => `${API_PREFIX}/expenses/categories/${id}`,
    summary: `${API_PREFIX}/expenses/category-summary`
  },
  reviews: {
    getApproved: `${API_PREFIX}/reviews`,
    submit: `${API_PREFIX}/reviews`,
    getAll: `${API_PREFIX}/reviews/all`,
    updateStatus: (id) =>
      `${API_PREFIX}/reviews/${id}`,
    delete: (id) => `${API_PREFIX}/reviews/${id}`,
  },
  FAQ:{
    getAll: `${API_PREFIX}/faqs`,
    create: `${API_PREFIX}/faqs`,
    update: (id) => `${API_PREFIX}/faqs/${id}`,
    delete: (id) => `${API_PREFIX}/faqs/${id}`,
  },

store:{
  get: `${API_PREFIX}/store`,
  update: `${API_PREFIX}/store/update`,
  toggle: `${API_PREFIX}/store/toggle-status`,
  },

  upload: {
    image: `${API_PREFIX}/upload`,
  },
};

// ─────────────────────────────────────────────
// EXPORT ENDPOINTS
// ─────────────────────────────────────────────
export const endpoints = (() => {
  const isDev = import.meta.env.DEV;

  return isDev
    ? endpointsPathsDev
    : endpointsPathsProd;
})();

// ─────────────────────────────────────────────
// QUERY STRING BUILDER
// ─────────────────────────────────────────────
export const buildQueryString = (params) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.append(key, value);
    }
  });

  const queryString = query.toString();

  return queryString
    ? `?${queryString}`
    : "";
};

// ─────────────────────────────────────────────
// HTTP METHODS
// ─────────────────────────────────────────────
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
};

// ─────────────────────────────────────────────
// ORDER STATUS
// ─────────────────────────────────────────────
export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Delivered",
  "Cancelled",
];

// ─────────────────────────────────────────────
// REVIEW STATUS
// ─────────────────────────────────────────────
export const REVIEW_STATUSES = [
  "pending",
  "approved",
  "rejected",
];

// ─────────────────────────────────────────────
// API EXPORTS
// ─────────────────────────────────────────────
export const API_ENDPOINTS = {
  AUTH: endpoints.auth,
  MENU: endpoints.menu,
  ORDERS: endpoints.orders,
  REVIEWS: endpoints.reviews,
  FQAs: endpoints.FAQ,
  UPLOAD: endpoints.upload,
};