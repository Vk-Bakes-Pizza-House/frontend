const payload = {
  customer: {
    name: customerName,
    phone: customerPhone,
    address: address,
  },

  items: cart.map((item) => ({
    menuItem: item.menuItem || item._id,
    name: item.name,
    price: item.price,
    qty: item.qty,
  })),
  orderType: isPickup
    ? "pickup"
    : "delivery",

  subtotal,

  deliveryCharge,

  total:

    subtotal + deliveryCharge,

  paymentMethod:
    "Cash on Delivery",

  note,
};