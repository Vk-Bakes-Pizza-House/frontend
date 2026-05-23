// App.jsx

import { useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { Toaster } from "sonner";

import LayoutWrapper from "./layout/LayoutWrapper";



// ─────────────────────────────────────────────


// ─────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────

export default function App() {

  const [cart, setCart] = useState([]);

  // Add / Remove Cart Items
  const add = useCallback(
    (item, delta = 1) => {

      setCart((prev) => {

        const itemId =
          item?.id || item?._id;

        if (!itemId) return prev;

        const existing =
          prev.find(
            (i) =>
              (i?.id || i?._id) === itemId
          );

        // Add New Item
        if (!existing && delta > 0) {

          return [
            ...prev,
            {
              ...item,
              _id: itemId,

              category:
                item?.category ||
                item?.cat,

              deliverable:
                item?.deliverable ??
                item?.dlv,

              qty: delta,
            },
          ];
        }

        // Update Existing
        if (existing) {

          const updatedQty =
            existing.qty + delta;

          // Remove Item
          if (updatedQty <= 0) {
            return prev.filter(
              (i) =>
                (i?.id || i?._id) !== itemId
            );
          }

          // Update Qty
          return prev.map((i) =>
            (i?.id || i?._id) === itemId
              ? {
                  ...i,
                  qty: updatedQty,
                }
              : i
          );
        }

        return prev;
      });

    },
    []
  );

  // Total Cart Qty
  const cartQty = cart.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  return (
    <Router>

      <LayoutWrapper
        cart={cart}
        add={add}
        cartQty={cartQty}
      />

      {/* Global Toast */}
      <Toaster
        position="top-right"
        richColors
      />

    </Router>
  );
}