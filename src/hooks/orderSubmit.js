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
      async (
        name,
        phone,
        addr
      ) => {

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