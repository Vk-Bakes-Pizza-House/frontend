// src/utils/endpoints.js
// VK Bakes API Endpoints (React + Tailwind Project)



const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
    login: `/api/admin/login`,
    seed: `/api/admin/seed`,
    me: `/api/admin/me`,
    changePassword: `/api/admin/change-password`,
    updateProfile: `/api/admin/profile`,
    notifications: `/api/admin/notifications`,
    sessions: `/api/admin/security/sessions`,
    session: (id) => `/api/admin/security/sessions/${id}`,
  },

  menu: {
    getAll: `/api/menu/item`,
    getById: (id) => `/api/menu/item/${id}`,
    create: `/api/menu/item`,
    update: (id) => `/api/menu/item/${id}`,
    delete: (id) => `/api/menu/item/${id}`,
    toggleAvailability: (id) =>
      `/api/menu/item/${id}/toggle`,
    //category
    getAllMenu: `/api/menu`,
    createMenu: `/api/menu`,
    deleteMenu: (id) => `/api/menu/${id}`,
  },

  orders: {
    create: `/api/orders`,
    getAll: `/api/orders`,
    getStats: `/api/orders/stats`,
    getById: (id) => `/api/orders/${id}`,
    updateStatus: (id) =>
      `/api/orders/${id}/status`,
    delete: (id) => `/api/orders/${id}`,
    deleteAll: `/api/orders`,
    revenue: `/api/orders/revenue`
  },

   sales: {
    // CRUD
    create: `/api/sales`,
    getAll: `/api/sales`,
    getById: (id) => `/api/sales/${id}`,
    update: (id) => `/api/sales/${id}`,
    delete: (id) => `/api/sales/${id}`,

    // Analytics
    overview: `/api/sales/overview`,
    daily: `/api/sales/daily`,
    monthly: `/api/sales/monthly`,
    payments: `/api/sales/payments`,
    topProducts: `/api/sales/top-products`,
  },
 expenses: {
    // expenses CRUD
    getAll: `/api/expenses`,
    create: `/api/expenses`,
    getById: (id) => `/api/expenses/${id}`,
    update: (id) => `/api/expenses/${id}`,
    delete: (id) => `/api/expenses/${id}`,
analytics: `/api/expenses/analytics`,

    // Categories
    categories: `/api/expenses/categories`,
    fetchAll: `/api/expenses/categories`,
    createCategory: `/api/expenses/categories`,
    updateCategory: (id) => `/api/expenses/categories/${id}`,
    deleteCategory: (id) => `/api/expenses/categories/${id}`,
    summary: `/api/expenses/category-summary`
  },
  reviews: {
    getApproved: `/api/reviews`,
    submit: `/api/reviews`,
    getAll: `/api/reviews/all`,
    updateStatus: (id) =>
      `/api/reviews/${id}`,
    delete: (id) => `/api/reviews/${id}`,
  },
  FAQ:{
    getAll: `/api/faqs`,
    create: `/api/faqs`,
    update: (id) => `/api/faqs/${id}`,
    delete: (id) => `/api/faqs/${id}`,
  },

store:{
  get: `/api/store`,
  update: `/api/store/update`,
  toggle: `/api/store/toggle-status`,
  },

  upload: {
    image: `/api/upload`,
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