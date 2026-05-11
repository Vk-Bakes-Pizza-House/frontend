export const WA = "919999999999"; // ← Replace with your WhatsApp number
export const DELIVERY_FEE = 20;

export const hasPCB    = (cart) => cart.some(i => ["pizza","cake","bake"].includes(i.cat));
export const isDlv     = (item, cart) => item.dlv === true || (item.dlv === "cond" && hasPCB(cart));

export const buildMsg  = (cart, addr) => {
  const dlv = cart.filter(i =>  isDlv(i, cart));
  const pkp = cart.filter(i => !isDlv(i, cart));
  let m = "🛍️ VK BAKES & PIZZA — NEW ORDER!\n\n";
  if (dlv.length) { m += "🚚 DELIVERY ITEMS:\n"; dlv.forEach(i => (m += `• ${i.qty}x ${i.name} — ₹${i.price * i.qty}\n`)); }
  if (pkp.length) { m += "\n🏪 STORE PICKUP:\n";  pkp.forEach(i => (m += `• ${i.qty}x ${i.name} — ₹${i.price * i.qty}\n`)); }
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  m += `\n📍 Address: ${addr || "[Please add your address]"}\n`;
  m += `💵 Payment: Cash on Delivery\n`;
  if (dlv.length) m += `🚚 Delivery Charge: ₹${DELIVERY_FEE}\n`;
  m += `💰 Total: ₹${sub + (dlv.length ? DELIVERY_FEE : 0)}`;
  return encodeURIComponent(m);
};