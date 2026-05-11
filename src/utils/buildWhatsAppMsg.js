export const buildWhatsAppMsg = (cart) => {
  // Builds wa.me message
  return `Hello, I would like to order: ${cart.map(item => item.name).join(', ')}`;
};