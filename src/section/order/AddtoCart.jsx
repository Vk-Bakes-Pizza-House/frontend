import { ShoppingCart } from "lucide-react";
import { Plus, Minus } from "lucide-react";

export function AddToCartButton({
  onClick,
  text = "Add To Cart",
  full = true,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        ${full ? "w-full" : ""}
        
        flex items-center justify-center gap-2
        
        py-3 px-5 rounded-xl
        
        bg-[#D44B1A]
        hover:bg-[#b83d13]
        
        text-white
        font-bold text-sm
        
        transition-all duration-200
      `}
    >

      <ShoppingCart size={16} />

      {text}

    </button>
  );
}


export  function QtyControl({
  qty,
  onInc,
  onDec,
}) {
  return (
    <div className="flex items-center gap-2">

      <button
        onClick={onDec}
        className="
          w-7 h-7 rounded-lg
          bg-[#E8D5C0]/60
          hover:bg-[#E8D5C0]
          flex items-center justify-center
        "
      >
        <Minus
          size={13}
          className="text-[#D44B1A]"
        />
      </button>

      <span className="w-5 text-center font-bold text-sm">
        {qty}
      </span>

      <button
        onClick={onInc}
        className="
          w-7 h-7 rounded-lg
          bg-[#D44B1A]
          hover:bg-[#b83d13]
          flex items-center justify-center
        "
      >
        <Plus
          size={13}
          className="text-white"
        />
      </button>

    </div>
  );
}

// hooks/useCart.js

import { useState, useCallback, useMemo } from "react";

export default function useCart() {

  const [cart, setCart] = useState([]);

  // ─────────────────────────────────────
  // Add / Remove Item
  // ─────────────────────────────────────
  const add = useCallback((item, delta = 1) => {

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

      // Update Existing Item
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

  }, []);

  // ─────────────────────────────────────
  // Clear Cart
  // ─────────────────────────────────────
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // ─────────────────────────────────────
  // Total Quantity
  // ─────────────────────────────────────
  const cartQty = useMemo(() => {

    return cart.reduce(
      (sum, item) =>
        sum + item.qty,
      0
    );

  }, [cart]);

  // ─────────────────────────────────────
  // Total Price
  // ─────────────────────────────────────
  const cartTotal = useMemo(() => {

    return cart.reduce(
      (sum, item) =>
        sum + item.price * item.qty,
      0
    );

  }, [cart]);

  return {
    cart,
    add,
    clearCart,
    cartQty,
    cartTotal,
  };
}