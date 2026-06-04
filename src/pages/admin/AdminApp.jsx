// admin/AdminApp.jsx
// ─────────────────────────────────────────────────────────────
// Root entry point for the admin panel.
// Handles auth gate → renders AdminShell + active page.
//
// Usage: In your main App.jsx, route /admin → <AdminApp />
//   e.g. using react-router-dom:
//     <Route path="/admin/*" element={<AdminApp />} />
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import AdminLogin from "./AdminLogin";
import Dashboard, { AdminShell } from "./Dashboard";
import ManageMenu from "./ManageMenu";
import ManageOrders from "./ManageOrders";
import ManageReviews from "./ManageReviews";
import AdminProfile from "./AdminProfile";
import ManageHowToOrder from "./ManageHowtoOrder";
import AddMenu from "./AddMenu";
import ManageItemDetail from "../../section/admin/ManageItemDetail";
import useAuthStore from "../../store/authStore"
import StoreManagementPanel from "./ManageStore";

export default function AdminApp() {
  const { isLoggedIn, fetchMe } = useAuthStore();
  const [page, setPage] = useState("dashboard");

  // Check auth on mount
  useEffect(() => {
    if (isLoggedIn()) {
      fetchMe();
    }
  }, [isLoggedIn, fetchMe]);

  const logout = () => {
    useAuthStore.getState().logout();
    sessionStorage.removeItem("vk_admin_auth");
  };

  if (!isLoggedIn()) {
    return <AdminLogin onLogin={() => { }} />;
  }

  const PAGE = {
    dashboard: <Dashboard />,
    addMenu: <AddMenu />,
    addItem: <ManageMenu />,
    orders: <ManageOrders />,
    reviews: <ManageReviews />,
    itemDetails: <ManageItemDetail />,
    store: <StoreManagementPanel />,
    howToOrder: <ManageHowToOrder />,
    profile: <AdminProfile onLogout={logout} />,
  };

  return (
    <AdminShell page={page} onNavigate={setPage} onLogout={logout} onProfileClick={() => setPage("profile")}>
      {PAGE[page] || <Dashboard />}
    </AdminShell>
  );
}

