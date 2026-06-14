import { useCallback } from "react";

import {
  buildMainItem,
  buildAddonLines,
  addOrderToCart,
  confirmAndSendOrder,
} from "../utils/orderhelper";

export default function useOrderSubmit({
  item,
  isPizza,
  sizeObj,
  selectedSize,
  extraCheese,
  itemPrice,
  mainQty,

  activeAddons,
  allAddonItems,

  subtotal,
  deliveryFee,
  total,

  add,
  onClose,
}) {

  const handleAddToCart =
    useCallback(() => {

      const mainItem =
        buildMainItem({
          item,
          isPizza,
          sizeObj,
          selectedSize,
          extraCheese,
          itemPrice,
          mainQty,
        });

      const addonLines =
        buildAddonLines(
          activeAddons,
          allAddonItems
        );

      addOrderToCart(
        add,
        mainItem,
        addonLines
      );

      onClose();

    }, [
      item,
      isPizza,
      sizeObj,
      selectedSize,
      extraCheese,
      itemPrice,
      mainQty,
      activeAddons,
      allAddonItems,
      add,
      onClose,
    ]);


  const handleConfirmOrder =
    useCallback(
      async (data) => {
        const { name:name, whatsappNumber: phone, address: addr } = data || {};
console.log("confrim",data)
        const mainItem =
          buildMainItem({
            item,
            isPizza,
            sizeObj,
            selectedSize,
            extraCheese,
            itemPrice,
            mainQty,
          });

        const addonLines =
          buildAddonLines(
            activeAddons,
            allAddonItems
          );

        await confirmAndSendOrder({
          customer: {
            name,
            whatsappNumber: phone,
            addr,
          },

          mainItem,

          addonLines,

          priceSummary: {
            subtotal,
            deliveryFee,
            total,
          },

          onDone: onClose,
        });
      },
      [
        item,
        isPizza,
        sizeObj,
        selectedSize,
        extraCheese,
        itemPrice,
        mainQty,
        activeAddons,
        allAddonItems,
        subtotal,
        deliveryFee,
        total,
        onClose,
      ]
    );

  return {
    handleAddToCart,
    handleConfirmOrder,
  };
}