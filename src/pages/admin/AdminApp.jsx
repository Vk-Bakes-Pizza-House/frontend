// admin/AdminApp.jsx
// ─────────────────────────────────────────────────────────────
// Root entry point for the admin panel.
// Handles auth gate → renders AdminShell + active page.
//
// Usage: In your main App.jsx, route /admin → <AdminApp />
//   e.g. using react-router-dom:
//     <Route path="/admin/*" element={<AdminApp />} />
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import AdminLogin                   from "./AdminLogin";
import Dashboard, { AdminShell }    from "./Dashboard";
import ManageMenu                   from "./ManageMenu";
import ManageOrders                 from "./ManageOrders";
import ManageReviews                from "./ManageReviews";

export default function AdminApp() {
  // Check if already signed in this browser session
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("vk_admin_auth") === "true"
  );
  const [page, setPage] = useState("dashboard");

  const logout = () => {
    sessionStorage.removeItem("vk_admin_auth");
    setAuthed(false);
  };

  if (!authed) {
    return <AdminLogin onLogin={() => setAuthed(true)} />;
  }

  const PAGE = {
    dashboard: <Dashboard />,
    menu:      <ManageMenu />,
    orders:    <ManageOrders />,
    reviews:   <ManageReviews />,
  };

  return (
    <AdminShell page={page} onNavigate={setPage} onLogout={logout}>
      {PAGE[page] || <Dashboard />}
    </AdminShell>
  );
}