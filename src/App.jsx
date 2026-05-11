import { useState, useCallback } from "react";
import { ShoppingCart, Plus, Minus, MapPin, Clock, Phone, Star, AlertCircle } from "lucide-react";
import { C, ITEMS, REVIEWS, FRESH_BOARD } from "./data/menu";
import { hasPCB, isDlv, buildMsg } from "./config";
import Home from "./pages/website/Home";
import Menu from "./pages/website/Menu";
import Cart from "./components/Cart";
import CustomCake from "./pages/website/CustomCake";
import ContactPage from "./pages/website/Contact";
import Navbar from "./components/Navbar";

import AdminApp from "./pages/admin/AdminApp";




// const CATS = [
//   { k:"all",     l:"All Items",  e:"🍽️" },
//   { k:"pizza",   l:"Pizza",      e:"🍕" },
//   { k:"bake",    l:"Bakes",      e:"🥐" },
//   { k:"cake",    l:"Cakes",      e:"🎂" },
//   { k:"bread",   l:"Bread",      e:"🍞" },
//   { k:"toast",   l:"Toast",      e:"🥖" },
//   { k:"biscuit", l:"Biscuits",   e:"🍪" },
//   { k:"ice",     l:"Ice Cream",  e:"🍦" },
// ];

// const REVIEWS = [
//   { name:"Priya S.",  rating:5, text:"Best pizza in the neighborhood! Always fresh and hot.", ago:"2 days ago" },
//   { name:"Rahul M.",  rating:5, text:"Paneer tikka pizza is amazing. Ordering every week!",   ago:"1 week ago" },
//   { name:"Anita K.",  rating:4, text:"Custom birthday cake was perfect. Thank you!",           ago:"2 weeks ago"},
//   { name:"Suresh P.", rating:5, text:"Fresh bread every morning — the whole colony loves VK Bakes!", ago:"3 weeks ago"},
// ];

// const FRESH_BOARD = [
//   { name:"White Bread",    up:true,  note:"8AM & 4PM daily"   },
//   { name:"Biscuits",       up:true,  note:"Available all day"  },
//   { name:"Chocolate Cake", up:true,  note:"Ready to order"     },
//   { name:"Mango Ice Cream",up:true,  note:"Today's flavour"    },
// ];

// ── DESIGN TOKENS ──────────────────────────────────────────────────────────
// const C = {
//   bg:"#FFF8F0", dark:"#1A0A00", mid:"#2D1400",
//   red:"#D44B1A", gold:"#F5A623", muted:"#8B6A4F",
//   border:"#E8D5C0", card:"#FFFFFF", green:"#25D366",
//   f1:"'Playfair Display', serif", f2:"'DM Sans', sans-serif",
// };

// ── HELPERS ────────────────────────────────────────────────────────────────




// ── ITEM CARD ──────────────────────────────────────────────────────────────
// function ItemCard({ item, cart, add }) {
//   const qty = cart.find(c => c.id === item.id)?.qty || 0;
//   const deliverable = isDlv(item, cart);
//   const dlvLabel = item.dlv === true ? "🚚 Delivers"
//                  : item.dlv === "cond" ? "🍕+🎂 only"
//                  : "🏪 Pickup only";
//   const dlvColor = item.dlv === true ? { bg:"#DCFCE7", color:"#166534" }
//                  : item.dlv === "cond" ? { bg:"#FEF9C3", color:"#854D0E" }
//                  : { bg:"#F3F4F6", color:"#6B7280" };
//   return (
//     <div style={{ background:C.card, borderRadius:12, overflow:"hidden", border:`1px solid ${C.border}`, display:"flex", flexDirection:"column" }}>
//       <div style={{ height:90, background:"linear-gradient(135deg,#FFF0E0,#FFE8CC)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:34, position:"relative" }}>
//         {EMOJI[item.cat]}
//         {item.tag && (
//           <span style={{ position:"absolute", top:7, left:7, background:C.red, color:"white", fontSize:10, padding:"2px 7px", borderRadius:10, fontFamily:C.f2, fontWeight:700 }}>
//             {item.tag}
//           </span>
//         )}
//         <span style={{ position:"absolute", top:7, right:7, background:dlvColor.bg, color:dlvColor.color, fontSize:10, padding:"2px 7px", borderRadius:10, fontFamily:C.f2, fontWeight:600 }}>
//           {dlvLabel}
//         </span>
//       </div>
//       <div style={{ padding:"12px 14px", flex:1, display:"flex", flexDirection:"column", gap:8 }}>
//         <div style={{ fontFamily:C.f2, fontWeight:600, color:C.mid, fontSize:14 }}>{item.name}</div>
//         <div style={{ fontFamily:C.f2, color:C.muted, fontSize:12, flex:1 }}>{item.desc}</div>
//         <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
//           <span style={{ fontFamily:C.f2, fontWeight:700, color:C.red, fontSize:17 }}>₹{item.price}</span>
//           {qty === 0 ? (
//             <button onClick={() => add(item)}
//               style={{ background:C.red, color:"white", padding:"6px 14px", borderRadius:6, fontFamily:C.f2, fontWeight:600, fontSize:12 }}>
//               Add
//             </button>
//           ) : (
//             <div style={{ display:"flex", alignItems:"center", gap:6 }}>
//               <button onClick={() => add(item, -1)} style={{ width:26, height:26, borderRadius:5, background:"#F0E0D0", display:"flex", alignItems:"center", justifyContent:"center" }}>
//                 <Minus size={12} color={C.red} />
//               </button>
//               <span style={{ fontFamily:C.f2, fontWeight:700, color:C.mid, minWidth:18, textAlign:"center" }}>{qty}</span>
//               <button onClick={() => add(item, 1)} style={{ width:26, height:26, borderRadius:5, background:C.red, display:"flex", alignItems:"center", justifyContent:"center" }}>
//                 <Plus size={12} color="white" />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// ── NAVBAR ─────────────────────────────────────────────────────────────────


// ── HOME PAGE ──────────────────────────────────────────────────────────────
// function HomePage({ go, cart, add }) {
//   const featured = ITEMS.filter(i => i.tag === "Bestseller");
//   return (
//     <div style={{ background:C.bg }}>

//       {/* Hero */}
//       <div style={{ background:`linear-gradient(135deg,${C.dark} 0%,${C.mid} 70%)`, padding:"64px 16px 52px", textAlign:"center" }}>
//         <div style={{ fontFamily:C.f2, color:C.gold, fontSize:12, letterSpacing:3, marginBottom:12 }}>🍕 FRESH · LOCAL · DELIVERED</div>
//         <h1 style={{ fontFamily:C.f1, color:"#FFF8F0", fontSize:"clamp(34px,7vw,60px)", fontWeight:700, lineHeight:1.1, marginBottom:14 }}>
//           VK Bakes &<br /><span style={{ color:C.red }}>Pizza House</span>
//         </h1>
//         <p style={{ fontFamily:C.f2, color:"#C8A882", fontSize:15, maxWidth:440, margin:"0 auto 28px" }}>
//           Fresh-baked breads, artisan cakes, and hot pizzas — delivered right to your door.
//         </p>
//         <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
//           <button onClick={() => go("menu")} style={{ background:C.red, color:"white", padding:"13px 28px", borderRadius:8, fontFamily:C.f2, fontWeight:700, fontSize:14 }}>Order Now 🛒</button>
//           <button onClick={() => go("cake")} style={{ background:"transparent", color:C.gold, border:`2px solid ${C.gold}`, padding:"13px 28px", borderRadius:8, fontFamily:C.f2, fontWeight:700, fontSize:14 }}>Custom Cake 🎂</button>
//         </div>
//       </div>

//       {/* Fresh Board */}
//       <div style={{ padding:"24px 16px", background:"#FFF0E8" }}>
//         <div style={{ maxWidth:960, margin:"0 auto", border:`2px solid ${C.red}`, borderRadius:10, overflow:"hidden" }}>
//           <div style={{ background:C.red, padding:"9px 16px" }}>
//             <span style={{ fontFamily:C.f2, fontWeight:700, color:"white", fontSize:13, letterSpacing:1 }}>🟢 TODAY'S FRESH BOARD</span>
//           </div>
//           <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)" }}>
//             {FRESH_BOARD.map((f, i) => (
//               <div key={i} style={{ padding:"12px 14px", borderRight:i<3?`1px solid ${C.border}`:undefined, background:i%2?"white":"#FFF8F4" }}>
//                 <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
//                   <div style={{ width:7, height:7, borderRadius:"50%", background:f.up?"#22C55E":"#EF4444" }} />
//                   <span style={{ fontFamily:C.f2, fontWeight:600, fontSize:13, color:C.mid }}>{f.name}</span>
//                 </div>
//                 <div style={{ fontFamily:C.f2, fontSize:11, color:C.muted }}>{f.note}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Specials */}
//       <div style={{ background:C.mid, padding:"24px 16px" }}>
//         <div style={{ maxWidth:960, margin:"0 auto" }}>
//           <div style={{ fontFamily:C.f2, color:C.gold, fontSize:11, letterSpacing:3, marginBottom:12, textAlign:"center" }}>🔥 TODAY'S SPECIALS</div>
//           <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:12 }}>
//             {[
//               { e:"🔥", t:"Buy 2 Pizzas, Get 1 Bake Free!", d:"Valid today only" },
//               { e:"🎉", t:"Cake + Ice Cream Combo",          d:"Any cake + 2 scoops at ₹50 off" },
//             ].map((s, i) => (
//               <div key={i} style={{ background:"#3D1A00", borderLeft:`4px solid ${C.red}`, borderRadius:8, padding:"14px 18px", display:"flex", gap:12, alignItems:"center" }}>
//                 <span style={{ fontSize:24 }}>{s.e}</span>
//                 <div>
//                   <div style={{ fontFamily:C.f2, fontWeight:700, color:"#FFF8F0", fontSize:14 }}>{s.t}</div>
//                   <div style={{ fontFamily:C.f2, color:C.gold, fontSize:12 }}>{s.d}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Featured */}
//       <div style={{ padding:"36px 16px" }}>
//         <div style={{ maxWidth:960, margin:"0 auto" }}>
//           <div style={{ fontFamily:C.f2, color:C.muted, fontSize:11, letterSpacing:3, marginBottom:6 }}>POPULAR PICKS</div>
//           <h2 style={{ fontFamily:C.f1, color:C.mid, fontSize:26, fontWeight:700, marginBottom:20 }}>Customer Favourites</h2>
//           <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:20 }}>
//             {featured.map(i => <ItemCard key={i.id} item={i} cart={cart} add={add} />)}
//           </div>
//           <button onClick={() => go("menu")} style={{ background:C.red, color:"white", padding:"11px 24px", borderRadius:8, fontFamily:C.f2, fontWeight:600, fontSize:14 }}>
//             View Full Menu →
//           </button>
//         </div>
//       </div>

//       {/* Reviews */}
//       <div style={{ background:C.mid, padding:"36px 16px" }}>
//         <div style={{ maxWidth:960, margin:"0 auto" }}>
//           <div style={{ fontFamily:C.f2, color:C.gold, fontSize:11, letterSpacing:3, marginBottom:6 }}>WHAT LOCALS SAY</div>
//           <h2 style={{ fontFamily:C.f1, color:"#FFF8F0", fontSize:26, fontWeight:700, marginBottom:20 }}>Customer Reviews</h2>
//           <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:14 }}>
//             {REVIEWS.map((r, i) => (
//               <div key={i} style={{ background:"white", borderRadius:12, padding:"18px", border:`1px solid ${C.border}` }}>
//                 <div style={{ display:"flex", gap:2, marginBottom:8 }}>
//                   {[...Array(5)].map((_, j) => <Star key={j} size={13} fill={j<r.rating?C.gold:"none"} color={j<r.rating?C.gold:"#D0C0B0"} />)}
//                 </div>
//                 <p style={{ fontFamily:C.f2, color:"#3D2B1A", fontSize:13, lineHeight:1.6, marginBottom:10 }}>"{r.text}"</p>
//                 <div style={{ display:"flex", justifyContent:"space-between" }}>
//                   <span style={{ fontFamily:C.f2, fontWeight:600, color:C.red, fontSize:12 }}>{r.name}</span>
//                   <span style={{ fontFamily:C.f2, color:C.muted, fontSize:11 }}>{r.ago}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



// ── ROOT APP ───────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);

  const go = useCallback((p) => { setPage(p); window.scrollTo(0, 0); }, []);

  const add = useCallback((item, delta = 1) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id);
      if (!ex) return delta > 0 ? [...prev, { ...item, qty:1 }] : prev;
      const q = ex.qty + delta;
      return q <= 0 ? prev.filter(i => i.id !== item.id) : prev.map(i => i.id === item.id ? { ...i, qty:q } : i);
    });
  }, []);

  const cartQty = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        button { cursor: pointer; border: none; background: none; padding: 0; }
        input, textarea { font-family: inherit; }
        a { cursor: pointer; }
        ::-webkit-scrollbar { height: 4px; width: 4px; }
        ::-webkit-scrollbar-track { background: #FFF8F0; }
        ::-webkit-scrollbar-thumb { background: #E8D5C0; border-radius: 4px; }
      `}</style>
      <Navbar page={page} go={go} cartQty={cartQty} />
      {page === "home"    && <Home go={go} cart={cart} add={add} />}
      {page === "menu"    && <Menu cart={cart} add={add} />}
      {page === "cake"    && <CustomCake />}
      {page === "cart"    && <Cart cart={cart} add={add} />}
      {page === "contact" && <ContactPage />}
      {page === "admin"   && <AdminApp />}
    </>
  );
}