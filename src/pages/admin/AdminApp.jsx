import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import Dashboard from "./Dashboard";
import ManageMenu from "./ManageMenu";
import ManageOrders from "./ManageOrders";
import ManageReviews from "./ManageReviews";
import AdminProfile from "./AdminProfile";
import ManageHowToOrder from "./ManageHowtoOrder";
import AddMenu from "./AddMenu";
import { AdminShell } from "../../section/admin/AdminShell";
import ManageItemDetail from "../../section/admin/ManageItemDetail";
import ManageCombos from "../../section/admin/ManageCombo";
import useAuthStore from "../../store/authStore";
import StoreManagementPanel from "./ManageStore";
import { SalesOverview, AddSale, SalesHistory, } from "../../section/admin/Sales/index"; 
import {AddExpense,ExpenseAnalytics,ExpenseCategories,ExpenseHistory} from "../../section/admin/Expense";
import ManageProducts from "../../section/admin/Inventory/Products/Products";

export default function AdminApp() {
  const { isLoggedIn, fetchMe } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Run validation effect once upon authentication status verification
  useEffect(() => {
    if (isLoggedIn()) {
      fetchMe();
    }
  }, [isLoggedIn, fetchMe]);

  // Auth Gate check: Redirect instantly to login if state keys are unverified
  if (!isLoggedIn()) {
  return <Navigate to="/login" replace />;
}

  const logout = () => {
    useAuthStore.getState().logout();
    sessionStorage.removeItem("vk_admin_auth");
  };

  const handleNavigate = (pageKey) => {
    const routeMap = {
      dashboard: "/admin",
      addMenu: "/admin/add-menu",
      addItem: "/admin/add-item",
      itemDetails: "/admin/add-item-details",
      combos: "/admin/combos",
      orders: "/admin/orders",
      product: "/admin/products",
      stock: "/admin/stock",
      purchases: "/admin/purchases",
      suppliers: "/admin/suppliers",
      sales: "/admin/sales/overview",
      addSale: "/admin/sales/add",
      salesHistory: "/admin/sales/history",
      addExpense: "/admin/expenses/add",
      expenseHistory: "/admin/expenses/history",
      categories: "/admin/expenses/categories",
      analytics: "/admin/expenses/analytics",
      reviews: "/admin/reviews",
      store: "/admin/store",
      howToOrder: "/admin/how-to-order",
      profile: "/admin/profile",
      gotToWebsite: "/"
    };

    navigate(routeMap[pageKey] || "/admin");
  };

  // Helper function to extract current path context for the menu active styling highlights
  const getCurrentPageKey = () => {
    const segments = location.pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
    const currentPath = segments.join("/");

    // Map paths directly back to string key highlights within your layout menu links
    const slugMap = {
      "": "dashboard",
      "add-menu": "addMenu",
      "add-item": "addItem",
      "orders": "orders",
      "products": "product",
      "stock": "stock",
      "purchases": "purchases",
      "suppliers": "suppliers",
      "sales": "overview",
      "sales/overview": "overview",
      "sales/add": "add",
      "sales/history": "history",
      "expenses/add": "add",
      "expenses/history": "history",
      "expenses/categories": "categories",
      "expenses/analytics": "analytics",
      "reviews": "reviews",
      "add-item-details": "itemDetails",
      "combos": "combos",
      "store": "store",
      "how-to-order": "howToOrder",
    };
    return slugMap[currentPath] || "dashboard";
  };

  return (
    <Routes>
      {/* Wrap nested pages directly inside the structural AdminShell layout container component */}
      <Route 
        element={
          <AdminShell 
            page={getCurrentPageKey()} 
            onNavigate={handleNavigate}
            onLogout={logout}
          />
        }
      >
        {/* Native React Router declaration outlets handle actual component instantiation matching */}
        <Route index element={<Dashboard />} />
        <Route path="add-menu" element={<AddMenu />} />
        <Route path="add-item" element={<ManageMenu />} />
        <Route path="orders" element={<ManageOrders />} />
        <Route path="sales/overview" element={<SalesOverview/>} />
        <Route path="sales/add" element={<AddSale/>} />
        <Route path="sales/history" element={<SalesHistory />} />
        <Route path="expenses/add" element={<AddExpense />} />
        <Route path="expenses/history" element={<ExpenseHistory />} />
        <Route path="expenses/categories" element={<ExpenseCategories />} />
        <Route path="expenses/analytics" element={<ExpenseAnalytics />} />
        <Route path="reviews" element={<ManageReviews />} />
        <Route path="add-item-details" element={<ManageItemDetail />} />
        <Route path="combos" element={<ManageCombos />} />
        <Route path="store" element={<StoreManagementPanel />} />
        <Route path="how-to-order" element={<ManageHowToOrder />} />
        <Route path="profile" element={<AdminProfile onLogout={logout} />} />
        <Route path="products" element={<ManageProducts />} />
      </Route>
    </Routes>
  );
}