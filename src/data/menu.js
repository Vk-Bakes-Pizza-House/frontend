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

export const INIT_STEPS = [
  { 
    id: 1, 
    emoji: "📸", 
    title: "QR Scan Karein ya Menu Open Karein", 
    desc: "Sabse pehle hamare page par aane ke liye QR code ko scan karein ya direct website menu open karein, jahan aapko hamari saari items dikhengi.", 
    color: "from-orange-400 to-red-500", 
    bgLight: "bg-orange-50", 
    border: "border-orange-200", 
    tips: ["QR code smoothly scan karein", "Browser mein link open karein", "Direct website se bhi open hoga"], 
    active: true  
  },
  { 
    id: 2, 
    emoji: "🍕", 
    title: "Apna Item aur Size Select Karein", 
    desc: "Apna manpasand Pizza, Cake ya koi bhi bakes item select karein. Aap apna pasandida size, type aur cake ka flavor apne hisab se choose kar sakte hain.", 
    color: "from-amber-400 to-orange-500", 
    bgLight: "bg-amber-50", 
    border: "border-amber-200", 
    tips: ["Pizza ka size dhyan se chunein", "Cake ke flavors check karein", "Bestsellers check karna na bhoolna"], 
    active: true 
  },
  { 
    id: 3, 
    emoji: "🧀", 
    title: "Extra Cheese aur Quantity Add Karein", 
    desc: "Agar aapko extra cheese chahiye toh option select karein. Iske baad jitne items chahiye, unka number (+) par click karke badha sakte hain aur fir 'Order Now' button dabayein.", 
    color: "from-yellow-400 to-amber-600", 
    bgLight: "bg-yellow-50", 
    border: "border-yellow-200", 
    tips: ["Aap multiple items add kar sakte hain", "Extra toppings ka maza lein", "Cart button se total check karein"], 
    active: true 
  },
  { 
    id: 4, 
    emoji: "📝", 
    title: "Cart Check karein aur Details Bharein", 
    desc: "Aap alag-alag type ke items ko cart mein ek sath add kar sakte hain. Iske baad 'Order on WhatsApp' par click karein aur apna Name, Phone number aur Address enter karke confirm karein.", 
    color: "from-blue-400 to-indigo-500", 
    bgLight: "bg-blue-50", 
    border: "border-blue-200", 
    tips: ["Address bilkul sahi likhein", "Phone number active hona chahiye", "Cart mein items check kar lein"], 
    active: true 
  },
  { 
    id: 5, 
    emoji: "📱", 
    title: "WhatsApp par Message Send Karein", 
    desc: "Confirm par click karte hi aapka WhatsApp open ho jayega. Wahan auto-filled message ko hume send kar dein. Jab aapko humari taraf se return text milega, tab aapka order final confirm ho jayega.", 
    color: "from-green-400 to-emerald-600", 
    bgLight: "bg-green-50", 
    border: "border-green-200", 
    tips: ["Message ko edit mat karein, direct send karein", "Return message ka wait karein", "Kuch hi minutes mein reply aayega"], 
    active: true 
  },
  { 
    id: 6, 
    emoji: "💵", 
    title: "Cash on Delivery Pay Karein", 
    desc: "Koi online payment ka jhanjhat nahi hai! Jab rider aapka hot aur fresh order lekar aapke ghar pahuchega, tabhi aapko Cash on Delivery (COD) cash mein pay karna hai.", 
    color: "from-teal-400 to-cyan-500", 
    bgLight: "bg-teal-50", 
    border: "border-teal-200", 
    tips: ["Delivery ke waqt cash taiyar rakhein", "Change (chutte paise) paas rakhein", "No online UPI payment required"], 
    active: true 
  },
]