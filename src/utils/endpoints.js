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
    getAll: `${API_BASE}/menu`,
    getById: (id) => `${API_BASE}/menu/${id}`,
    create: `${API_BASE}/menu`,
    update: (id) => `${API_BASE}/menu/${id}`,
    delete: (id) => `${API_BASE}/menu/${id}`,
    toggleAvailability: (id) =>
      `${API_BASE}/menu/${id}/toggle`,
  },

  orders: {
    create: `${API_BASE}/orders`,
    getAll: `${API_BASE}/orders`,
    getStats: `${API_BASE}/orders/stats`,
    getById: (id) => `${API_BASE}/orders/${id}`,
    updateStatus: (id) =>
      `${API_BASE}/orders/${id}/status`,
    delete: (id) => `${API_BASE}/orders/${id}`,
  },

  reviews: {
    getApproved: `${API_BASE}/reviews`,
    submit: `${API_BASE}/reviews`,
    getAll: `${API_BASE}/reviews/all`,
    updateStatus: (id) =>
      `${API_BASE}/reviews/${id}`,
    delete: (id) => `${API_BASE}/reviews/${id}`,
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
    getAll: `/api/menu`,
    getById: (id) => `/api/menu/${id}`,
    create: `/api/menu`,
    update: (id) => `/api/menu/${id}`,
    delete: (id) => `/api/menu/${id}`,
    toggleAvailability: (id) =>
      `/api/menu/${id}/toggle`,
  },

  orders: {
    create: `/api/orders`,
    getAll: `/api/orders`,
    getStats: `/api/orders/stats`,
    getById: (id) => `/api/orders/${id}`,
    updateStatus: (id) =>
      `/api/orders/${id}/status`,
    delete: (id) => `/api/orders/${id}`,
  },

  reviews: {
    getApproved: `/api/reviews`,
    submit: `/api/reviews`,
    getAll: `/api/reviews/all`,
    updateStatus: (id) =>
      `/api/reviews/${id}`,
    delete: (id) => `/api/reviews/${id}`,
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
  UPLOAD: endpoints.upload,
};