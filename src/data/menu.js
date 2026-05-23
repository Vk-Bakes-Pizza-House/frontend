// ── CONFIG ─────────────────────────────────────────────────────────────────


// ── DESIGN TOKENS ──────────────────────────────────────────────────────────
export const C = {
  bg: "#FFF8F0",
  dark: "#1A0A00",
  mid: "#2D1400",
  red: "#D44B1A",
  gold: "#F5A623",
  muted: "#8B6A4F",
  border: "#E8D5C0",
  card: "#FFFFFF",
  green: "#25D366",
  f1: "'Playfair Display', serif",
  f2: "'DM Sans', sans-serif",
};

export const EMOJI = { pizza:"🍕", bake:"🥐", bread:"🍞", toast:"🥖", biscuit:"🍪", cake:"🎂", ice:"🍦" };
// ── DATA ───────────────────────────────────────────────────────────────────
export const ITEMS = [
  { id: 1, name: "Margherita Pizza", cat: "pizza", price: 199, desc: "Classic tomato & mozzarella", dlv: true, tag: "Bestseller" },
  { id: 2, name: "Veg Supreme Pizza", cat: "pizza", price: 249, desc: "Capsicum, onion, mushroom", dlv: true },
  { id: 3, name: "Paneer Tikka Pizza", cat: "pizza", price: 279, desc: "Spicy paneer & bell peppers", dlv: true, tag: "🌶️ Spicy" },
  { id: 4, name: "Veg Cheese Bake", cat: "bake", price: 89, desc: "Golden pastry, cheese fill", dlv: true, tag: "Bestseller" },
  { id: 5, name: "Corn & Spinach Bake", cat: "bake", price: 79, desc: "Fresh corn & spinach", dlv: true },
  { id: 6, name: "White Bread Loaf", cat: "bread", price: 40, desc: "Fresh baked daily", dlv: false },
  { id: 7, name: "Brown Bread Loaf", cat: "bread", price: 50, desc: "Whole wheat goodness", dlv: false },
  { id: 8, name: "Garlic Toast", cat: "toast", price: 35, desc: "Buttery garlic spread", dlv: false },
  { id: 9, name: "Butter Biscuits", cat: "biscuit", price: 30, desc: "Crispy & buttery", dlv: false },
  { id: 10, name: "Choco Chip Cookies", cat: "biscuit", price: 45, desc: "Rich chocolate chips", dlv: false },
  { id: 11, name: "Chocolate Truffle", cat: "cake", price: 350, desc: "500g rich chocolate cake", dlv: true },
  { id: 12, name: "Butterscotch Cake", cat: "cake", price: 320, desc: "500g caramel delight", dlv: true },
  { id: 13, name: "Mango Ice Cream", cat: "ice", price: 60, desc: "Alphonso mango flavour", dlv: "cond" },
  { id: 14, name: "Chocolate Ice Cream", cat: "ice", price: 60, desc: "Dark chocolate scoop", dlv: "cond" },
  { id: 15, name: "Vanilla Ice Cream", cat: "ice", price: 50, desc: "Classic vanilla bean", dlv: "cond" },
];

export const CATS = [
  { k: "all", l: "All Items", e: "🍽️" },
  { k: "pizza", l: "Pizza", e: "🍕" },
  { k: "ice", l: "IceCream", e: "🍦" },
  { k: "cake", l: "Cakes", e: "🎂" },
  { k: "biscuit", l: "Cookies", e: "🍪" },
  { k: "bake", l: "Buns", e: "🥐" },
  { k: "bread", l: "Bread", e: "🍞" },
  { k: "toast", l: "Rusk", e: "🥖" },
  { k: "toast", l: "CupCakes", e: "🥖" },
]

export const REVIEWS = [
  { name: "Priya S.", rating: 5, text: "Best pizza in the neighborhood! Always fresh and hot.", ago: "2 days ago" },
  { name: "Rahul M.", rating: 5, text: "Paneer tikka pizza is amazing. Ordering every week!", ago: "1 week ago" },
  { name: "Anita K.", rating: 4, text: "Custom birthday cake was perfect. Thank you!", ago: "2 weeks ago" },
  { name: "Suresh P.", rating: 5, text: "Fresh bread every morning — the whole colony loves VK Bakes!", ago: "3 weeks ago" },
];

export const FRESH_BOARD = [
  { name: "Paneer Pizza", up: true, note: "8AM & 4PM daily" },
  { name: "Butter Cookies", up: true, note: "Available all day" },
  { name: "Chocolate Truffle Cake", up: true, note: "Ready to order" },
  { name: "Mango IceCream", up: true, note: "Today's flavour" },
];