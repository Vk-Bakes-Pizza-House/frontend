import { useCallback } from "react";
import {
  confirmAndSendOrder,
} from "../utils/orderhelper";

export default function useCartOrderSubmit({
  cart,
  subtotal,
  deliveryFee,
  total,
  onDone,
}) {

  const handleConfirmOrder =
    useCallback(
      async (
        name,
        phone,
        addr
      ) => {

        const mainItem = cart[0];

        const addonLines =
          cart.slice(1);

        await confirmAndSendOrder({
          customer: {
            name,
            phone,
            addr,
          },

          mainItem,

          addonLines,

          priceSummary: {
            subtotal,
            deliveryFee,
            total,
          },

          onDone,
        });

      },
      [
        cart,
        subtotal,
        deliveryFee,
        total,
        onDone,
      ]
    );

  return {
    handleConfirmOrder,
  };
}