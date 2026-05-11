import { useState, useCallback } from "react";
import { ShoppingCart, Plus, Minus, MapPin, Clock, Phone, Star, AlertCircle } from "lucide-react";

// ── CONFIG ─────────────────────────────────────────────────────────────────
const WA            = "919999999999"; // ← Replace with your WhatsApp number
const DELIVERY_FEE  = 20;

// ── DATA ───────────────────────────────────────────────────────────────────
const ITEMS = [
  { id:1,  name:"Margherita Pizza",    cat:"pizza",   price:199, desc:"Classic tomato & mozzarella",  dlv:true,   tag:"Bestseller" },
  { id:2,  name:"Veg Supreme Pizza",   cat:"pizza",   price:249, desc:"Capsicum, onion, mushroom",    dlv:true                     },
  { id:3,  name:"Paneer Tikka Pizza",  cat:"pizza",   price:279, desc:"Spicy paneer & bell peppers",  dlv:true,   tag:"🌶️ Spicy"   },
  { id:4,  name:"Veg Cheese Bake",     cat:"bake",    price:89,  desc:"Golden pastry, cheese fill",   dlv:true,   tag:"Bestseller" },
  { id:5,  name:"Corn & Spinach Bake", cat:"bake",    price:79,  desc:"Fresh corn & spinach",         dlv:true                     },
  { id:6,  name:"White Bread Loaf",    cat:"bread",   price:40,  desc:"Fresh baked daily",            dlv:false                    },
  { id:7,  name:"Brown Bread Loaf",    cat:"bread",   price:50,  desc:"Whole wheat goodness",         dlv:false                    },
  { id:8,  name:"Garlic Toast",        cat:"toast",   price:35,  desc:"Buttery garlic spread",        dlv:false                    },
  { id:9,  name:"Butter Biscuits",     cat:"biscuit", price:30,  desc:"Crispy & buttery",             dlv:false                    },
  { id:10, name:"Choco Chip Cookies",  cat:"biscuit", price:45,  desc:"Rich chocolate chips",         dlv:false                    },
  { id:11, name:"Chocolate Truffle",   cat:"cake",    price:350, desc:"500g rich chocolate cake",     dlv:true                     },
  { id:12, name:"Butterscotch Cake",   cat:"cake",    price:320, desc:"500g caramel delight",         dlv:true                     },
  { id:13, name:"Mango Ice Cream",     cat:"ice",     price:60,  desc:"Alphonso mango flavour",       dlv:"cond"                   },
  { id:14, name:"Chocolate Ice Cream", cat:"ice",     price:60,  desc:"Dark chocolate scoop",         dlv:"cond"                   },
  { id:15, name:"Vanilla Ice Cream",   cat:"ice",     price:50,  desc:"Classic vanilla bean",         dlv:"cond"                   },
];

const CATS = [
  { k:"all",     l:"All Items",  e:"🍽️" },
  { k:"pizza",   l:"Pizza",      e:"🍕" },
  { k:"bake",    l:"Bakes",      e:"🥐" },
  { k:"cake",    l:"Cakes",      e:"🎂" },
  { k:"bread",   l:"Bread",      e:"🍞" },
  { k:"toast",   l:"Toast",      e:"🥖" },
  { k:"biscuit", l:"Biscuits",   e:"🍪" },
  { k:"ice",     l:"Ice Cream",  e:"🍦" },
];

const REVIEWS = [
  { name:"Priya S.",  rating:5, text:"Best pizza in the neighborhood! Always fresh and hot.", ago:"2 days ago" },
  { name:"Rahul M.",  rating:5, text:"Paneer tikka pizza is amazing. Ordering every week!",   ago:"1 week ago" },
  { name:"Anita K.",  rating:4, text:"Custom birthday cake was perfect. Thank you!",           ago:"2 weeks ago"},
  { name:"Suresh P.", rating:5, text:"Fresh bread every morning — the whole colony loves VK Bakes!", ago:"3 weeks ago"},
];

const FRESH_BOARD = [
  { name:"White Bread",    up:true,  note:"8AM & 4PM daily"   },
  { name:"Biscuits",       up:true,  note:"Available all day"  },
  { name:"Chocolate Cake", up:true,  note:"Ready to order"     },
  { name:"Mango Ice Cream",up:true,  note:"Today's flavour"    },
];

// ── DESIGN TOKENS ──────────────────────────────────────────────────────────
const C = {
  bg:"#FFF8F0", dark:"#1A0A00", mid:"#2D1400",
  red:"#D44B1A", gold:"#F5A623", muted:"#8B6A4F",
  border:"#E8D5C0", card:"#FFFFFF", green:"#25D366",
  f1:"'Playfair Display', serif", f2:"'DM Sans', sans-serif",
};

// ── HELPERS ────────────────────────────────────────────────────────────────
const hasPCB    = (cart) => cart.some(i => ["pizza","cake","bake"].includes(i.cat));
const isDlv     = (item, cart) => item.dlv === true || (item.dlv === "cond" && hasPCB(cart));

const buildMsg  = (cart, addr) => {
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

const EMOJI = { pizza:"🍕", bake:"🥐", bread:"🍞", toast:"🥖", biscuit:"🍪", cake:"🎂", ice:"🍦" };

// ── ITEM CARD ──────────────────────────────────────────────────────────────
function ItemCard({ item, cart, add }) {
  const qty = cart.find(c => c.id === item.id)?.qty || 0;
  const deliverable = isDlv(item, cart);
  const dlvLabel = item.dlv === true ? "🚚 Delivers"
                 : item.dlv === "cond" ? "🍕+🎂 only"
                 : "🏪 Pickup only";
  const dlvColor = item.dlv === true ? { bg:"#DCFCE7", color:"#166534" }
                 : item.dlv === "cond" ? { bg:"#FEF9C3", color:"#854D0E" }
                 : { bg:"#F3F4F6", color:"#6B7280" };
  return (
    <div style={{ background:C.card, borderRadius:12, overflow:"hidden", border:`1px solid ${C.border}`, display:"flex", flexDirection:"column" }}>
      <div style={{ height:90, background:"linear-gradient(135deg,#FFF0E0,#FFE8CC)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:34, position:"relative" }}>
        {EMOJI[item.cat]}
        {item.tag && (
          <span style={{ position:"absolute", top:7, left:7, background:C.red, color:"white", fontSize:10, padding:"2px 7px", borderRadius:10, fontFamily:C.f2, fontWeight:700 }}>
            {item.tag}
          </span>
        )}
        <span style={{ position:"absolute", top:7, right:7, background:dlvColor.bg, color:dlvColor.color, fontSize:10, padding:"2px 7px", borderRadius:10, fontFamily:C.f2, fontWeight:600 }}>
          {dlvLabel}
        </span>
      </div>
      <div style={{ padding:"12px 14px", flex:1, display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{ fontFamily:C.f2, fontWeight:600, color:C.mid, fontSize:14 }}>{item.name}</div>
        <div style={{ fontFamily:C.f2, color:C.muted, fontSize:12, flex:1 }}>{item.desc}</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontFamily:C.f2, fontWeight:700, color:C.red, fontSize:17 }}>₹{item.price}</span>
          {qty === 0 ? (
            <button onClick={() => add(item)}
              style={{ background:C.red, color:"white", padding:"6px 14px", borderRadius:6, fontFamily:C.f2, fontWeight:600, fontSize:12 }}>
              Add
            </button>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <button onClick={() => add(item, -1)} style={{ width:26, height:26, borderRadius:5, background:"#F0E0D0", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Minus size={12} color={C.red} />
              </button>
              <span style={{ fontFamily:C.f2, fontWeight:700, color:C.mid, minWidth:18, textAlign:"center" }}>{qty}</span>
              <button onClick={() => add(item, 1)} style={{ width:26, height:26, borderRadius:5, background:C.red, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Plus size={12} color="white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── NAVBAR ─────────────────────────────────────────────────────────────────
function Navbar({ page, go, cartQty }) {
  const links = [["home","Home"], ["menu","Menu"], ["cake","Custom Cake"], ["contact","Contact"]];
  return (
    <nav style={{ background:C.dark, borderBottom:`2px solid ${C.red}`, position:"sticky", top:0, zIndex:40 }}>
      <div style={{ maxWidth:1000, margin:"0 auto", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={() => go("home")} style={{ textAlign:"left" }}>
          <div style={{ fontFamily:C.f1, color:C.gold, fontSize:20, fontWeight:700, lineHeight:1 }}>VK Bakes</div>
          <div style={{ fontFamily:C.f2, color:C.red,  fontSize:10, letterSpacing:3 }}>& PIZZA HOUSE</div>
        </button>
        <div style={{ display:"flex", gap:24, alignItems:"center" }}>
          <div style={{ display:"flex", gap:20 }}>
            {links.map(([k, l]) => (
              <button key={k} onClick={() => go(k)}
                style={{ fontFamily:C.f2, color:page===k ? C.gold:"#FFF8F0", fontWeight:page===k?600:400, fontSize:14,
                  borderBottom:page===k?`2px solid ${C.gold}`:"2px solid transparent", paddingBottom:2 }}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={() => go("cart")} style={{ background:C.red, borderRadius:"50%", width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", flexShrink:0 }}>
            <ShoppingCart size={18} color="white" />
            {cartQty > 0 && (
              <span style={{ position:"absolute", top:-4, right:-4, background:C.gold, color:C.dark, borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:C.f2, fontWeight:700, fontSize:11 }}>
                {cartQty}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── HOME PAGE ──────────────────────────────────────────────────────────────
function HomePage({ go, cart, add }) {
  const featured = ITEMS.filter(i => i.tag === "Bestseller");
  return (
    <div style={{ background:C.bg }}>

      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,${C.dark} 0%,${C.mid} 70%)`, padding:"64px 16px 52px", textAlign:"center" }}>
        <div style={{ fontFamily:C.f2, color:C.gold, fontSize:12, letterSpacing:3, marginBottom:12 }}>🍕 FRESH · LOCAL · DELIVERED</div>
        <h1 style={{ fontFamily:C.f1, color:"#FFF8F0", fontSize:"clamp(34px,7vw,60px)", fontWeight:700, lineHeight:1.1, marginBottom:14 }}>
          VK Bakes &<br /><span style={{ color:C.red }}>Pizza House</span>
        </h1>
        <p style={{ fontFamily:C.f2, color:"#C8A882", fontSize:15, maxWidth:440, margin:"0 auto 28px" }}>
          Fresh-baked breads, artisan cakes, and hot pizzas — delivered right to your door.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => go("menu")} style={{ background:C.red, color:"white", padding:"13px 28px", borderRadius:8, fontFamily:C.f2, fontWeight:700, fontSize:14 }}>Order Now 🛒</button>
          <button onClick={() => go("cake")} style={{ background:"transparent", color:C.gold, border:`2px solid ${C.gold}`, padding:"13px 28px", borderRadius:8, fontFamily:C.f2, fontWeight:700, fontSize:14 }}>Custom Cake 🎂</button>
        </div>
      </div>

      {/* Fresh Board */}
      <div style={{ padding:"24px 16px", background:"#FFF0E8" }}>
        <div style={{ maxWidth:960, margin:"0 auto", border:`2px solid ${C.red}`, borderRadius:10, overflow:"hidden" }}>
          <div style={{ background:C.red, padding:"9px 16px" }}>
            <span style={{ fontFamily:C.f2, fontWeight:700, color:"white", fontSize:13, letterSpacing:1 }}>🟢 TODAY'S FRESH BOARD</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)" }}>
            {FRESH_BOARD.map((f, i) => (
              <div key={i} style={{ padding:"12px 14px", borderRight:i<3?`1px solid ${C.border}`:undefined, background:i%2?"white":"#FFF8F4" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:f.up?"#22C55E":"#EF4444" }} />
                  <span style={{ fontFamily:C.f2, fontWeight:600, fontSize:13, color:C.mid }}>{f.name}</span>
                </div>
                <div style={{ fontFamily:C.f2, fontSize:11, color:C.muted }}>{f.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specials */}
      <div style={{ background:C.mid, padding:"24px 16px" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ fontFamily:C.f2, color:C.gold, fontSize:11, letterSpacing:3, marginBottom:12, textAlign:"center" }}>🔥 TODAY'S SPECIALS</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:12 }}>
            {[
              { e:"🔥", t:"Buy 2 Pizzas, Get 1 Bake Free!", d:"Valid today only" },
              { e:"🎉", t:"Cake + Ice Cream Combo",          d:"Any cake + 2 scoops at ₹50 off" },
            ].map((s, i) => (
              <div key={i} style={{ background:"#3D1A00", borderLeft:`4px solid ${C.red}`, borderRadius:8, padding:"14px 18px", display:"flex", gap:12, alignItems:"center" }}>
                <span style={{ fontSize:24 }}>{s.e}</span>
                <div>
                  <div style={{ fontFamily:C.f2, fontWeight:700, color:"#FFF8F0", fontSize:14 }}>{s.t}</div>
                  <div style={{ fontFamily:C.f2, color:C.gold, fontSize:12 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured */}
      <div style={{ padding:"36px 16px" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ fontFamily:C.f2, color:C.muted, fontSize:11, letterSpacing:3, marginBottom:6 }}>POPULAR PICKS</div>
          <h2 style={{ fontFamily:C.f1, color:C.mid, fontSize:26, fontWeight:700, marginBottom:20 }}>Customer Favourites</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:20 }}>
            {featured.map(i => <ItemCard key={i.id} item={i} cart={cart} add={add} />)}
          </div>
          <button onClick={() => go("menu")} style={{ background:C.red, color:"white", padding:"11px 24px", borderRadius:8, fontFamily:C.f2, fontWeight:600, fontSize:14 }}>
            View Full Menu →
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div style={{ background:C.mid, padding:"36px 16px" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ fontFamily:C.f2, color:C.gold, fontSize:11, letterSpacing:3, marginBottom:6 }}>WHAT LOCALS SAY</div>
          <h2 style={{ fontFamily:C.f1, color:"#FFF8F0", fontSize:26, fontWeight:700, marginBottom:20 }}>Customer Reviews</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:14 }}>
            {REVIEWS.map((r, i) => (
              <div key={i} style={{ background:"white", borderRadius:12, padding:"18px", border:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", gap:2, marginBottom:8 }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={13} fill={j<r.rating?C.gold:"none"} color={j<r.rating?C.gold:"#D0C0B0"} />)}
                </div>
                <p style={{ fontFamily:C.f2, color:"#3D2B1A", fontSize:13, lineHeight:1.6, marginBottom:10 }}>"{r.text}"</p>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontFamily:C.f2, fontWeight:600, color:C.red, fontSize:12 }}>{r.name}</span>
                  <span style={{ fontFamily:C.f2, color:C.muted, fontSize:11 }}>{r.ago}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MENU PAGE ──────────────────────────────────────────────────────────────
function MenuPage({ cart, add }) {
  const [cat, setCat] = useState("all");
  const items = cat === "all" ? ITEMS : ITEMS.filter(i => i.cat === cat);
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"24px 16px" }}>
      <div style={{ maxWidth:960, margin:"0 auto" }}>
        <h2 style={{ fontFamily:C.f1, color:C.mid, fontSize:28, fontWeight:700, marginBottom:18 }}>Our Menu</h2>
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:12, marginBottom:16 }}>
          {CATS.map(c => (
            <button key={c.k} onClick={() => setCat(c.k)}
              style={{ padding:"7px 15px", borderRadius:20, fontFamily:C.f2, fontWeight:500, fontSize:12, whiteSpace:"nowrap", flexShrink:0,
                background:cat===c.k?C.red:"white", color:cat===c.k?"white":C.mid,
                border:cat===c.k?"none":`1px solid ${C.border}` }}>
              {c.e} {c.l}
            </button>
          ))}
        </div>
        <div style={{ background:"#FFF3E0", border:`1px solid ${C.gold}`, borderRadius:8, padding:"10px 14px", marginBottom:18, display:"flex", gap:8, alignItems:"flex-start" }}>
          <AlertCircle size={15} color={C.gold} style={{ flexShrink:0, marginTop:1 }} />
          <p style={{ fontFamily:C.f2, fontSize:12, color:"#5D3A00" }}>
            <strong>Delivery (₹20):</strong> Pizza, Bakes & Cakes only. Ice Cream delivers only when ordered with Pizza/Bake/Cake. Bread, Toast & Biscuits are <strong>store pickup only</strong>. Cash on delivery.
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(178px,1fr))", gap:14 }}>
          {items.map(i => <ItemCard key={i.id} item={i} cart={cart} add={add} />)}
        </div>
      </div>
    </div>
  );
}

// ── CUSTOM CAKE PAGE ────────────────────────────────────────────────────────
function CakePage() {
  const [f, setF] = useState({ size:"1kg", flavour:"Chocolate", msg:"", design:"Simple", date:"", phone:"" });
  const set = (k, v) => setF(p => ({ ...p, [k]:v }));

  const BtnGroup = ({ opts, val, on }) => (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
      {opts.map(o => (
        <button key={o} onClick={() => on(o)}
          style={{ padding:"7px 14px", borderRadius:8, fontFamily:C.f2, fontSize:13, fontWeight:500,
            background:val===o?C.red:"white", color:val===o?"white":C.mid, border:val===o?"none":`1px solid ${C.border}` }}>
          {o}
        </button>
      ))}
    </div>
  );

  const submit = () => {
    if (!f.phone || !f.date) { alert("Please fill your phone number and delivery date!"); return; }
    const m = `🎂 CUSTOM CAKE ORDER — VK Bakes\n\n📱 Phone: ${f.phone}\n🍰 Size: ${f.size}\n🍫 Flavour: ${f.flavour}\n✍️ Message: ${f.msg || "None"}\n🎨 Design: ${f.design}\n📅 Delivery Date: ${f.date}\n\n⚠️ Min 2 days advance. Price confirmed by us after receiving your order.`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(m)}`, "_blank");
  };

  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"32px 16px" }}>
      <div style={{ maxWidth:540, margin:"0 auto" }}>
        <div style={{ fontFamily:C.f2, color:C.muted, fontSize:11, letterSpacing:3, marginBottom:8 }}>MADE TO ORDER</div>
        <h2 style={{ fontFamily:C.f1, color:C.mid, fontSize:28, fontWeight:700, marginBottom:6 }}>Custom Cake Order</h2>
        <p style={{ fontFamily:C.f2, color:C.muted, fontSize:13, marginBottom:24 }}>
          Order at least 2 days ahead. Price confirmed by us on WhatsApp after booking.
        </p>
        <div style={{ background:"white", borderRadius:16, padding:"24px", border:`1px solid ${C.border}`, display:"flex", flexDirection:"column", gap:20 }}>
          {[
            { l:"Cake Size",    comp:<BtnGroup opts={["500g","1kg","2kg"]}                              val={f.size}    on={v=>set("size",v)}    /> },
            { l:"Flavour",      comp:<BtnGroup opts={["Chocolate","Vanilla","Butterscotch","Strawberry","Pineapple"]} val={f.flavour} on={v=>set("flavour",v)} /> },
            { l:"Design Style", comp:<BtnGroup opts={["Simple","Designer","Photo Cake"]}                val={f.design}  on={v=>set("design",v)}  /> },
          ].map(({ l, comp }) => (
            <div key={l}>
              <div style={{ fontFamily:C.f2, fontWeight:600, color:C.mid, fontSize:13, marginBottom:8 }}>{l}</div>
              {comp}
            </div>
          ))}
          {[
            { l:"Message on Cake",  ph:'e.g. "Happy Birthday Raj! 🎉"', k:"msg",   type:"text" },
            { l:"Delivery Date ✱",  ph:"",                               k:"date",  type:"date" },
            { l:"Your Phone ✱",     ph:"9876543210",                     k:"phone", type:"tel"  },
          ].map(({ l, ph, k, type }) => (
            <div key={k}>
              <div style={{ fontFamily:C.f2, fontWeight:600, color:C.mid, fontSize:13, marginBottom:8 }}>{l}</div>
              <input type={type} value={f[k]} onChange={e => set(k, e.target.value)} placeholder={ph}
                style={{ width:"100%", padding:"10px 13px", border:`1px solid ${C.border}`, borderRadius:8, fontFamily:C.f2, fontSize:13, color:C.mid, outline:"none", boxSizing:"border-box" }} />
            </div>
          ))}
          <button onClick={submit}
            style={{ background:C.green, color:"white", padding:"14px", borderRadius:10, fontFamily:C.f2, fontWeight:700, fontSize:15, width:"100%" }}>
            📱 Send Order on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CART PAGE ──────────────────────────────────────────────────────────────
function CartPage({ cart, add }) {
  const [addr, setAddr] = useState("");
  const sub     = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const hasDlv  = cart.some(i => isDlv(i, cart));
  const iceWarn = cart.some(i => i.cat === "ice") && !hasPCB(cart);

  const order = () => {
    if (!cart.length) return;
    window.open(`https://wa.me/${WA}?text=${buildMsg(cart, addr)}`, "_blank");
  };

  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"24px 16px" }}>
      <div style={{ maxWidth:560, margin:"0 auto" }}>
        <h2 style={{ fontFamily:C.f1, color:C.mid, fontSize:28, fontWeight:700, marginBottom:20 }}>Your Cart</h2>
        {cart.length === 0 ? (
          <div style={{ textAlign:"center", padding:"64px 0", color:C.muted, fontFamily:C.f2 }}>
            <div style={{ fontSize:56, marginBottom:12 }}>🛒</div>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:6 }}>Your cart is empty</div>
            <div style={{ fontSize:13 }}>Go to the menu and add some items!</div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {iceWarn && (
              <div style={{ background:"#FFF3E0", border:`1px solid ${C.gold}`, borderRadius:8, padding:"10px 13px", display:"flex", gap:8 }}>
                <AlertCircle size={15} color={C.gold} style={{ flexShrink:0, marginTop:1 }} />
                <p style={{ fontFamily:C.f2, fontSize:12, color:"#5D3A00" }}>
                  Ice cream delivers only when you also order a Pizza, Bake or Cake. Add one, or pick up ice cream from the store.
                </p>
              </div>
            )}

            {cart.map(item => (
              <div key={item.id} style={{ background:"white", borderRadius:10, padding:"13px 15px", border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontSize:26, flexShrink:0 }}>{EMOJI[item.cat]}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:C.f2, fontWeight:600, color:C.mid, fontSize:14 }}>{item.name}</div>
                  <div style={{ fontFamily:C.f2, fontSize:11, color:isDlv(item,cart)?"#16A34A":C.muted, marginTop:2 }}>
                    {isDlv(item, cart) ? "✅ Will be delivered" : "🏪 Store pickup only"}
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <button onClick={() => add(item,-1)} style={{ width:26, height:26, borderRadius:5, background:"#F0E0D0", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Minus size={12} color={C.red} />
                  </button>
                  <span style={{ fontFamily:C.f2, fontWeight:700, color:C.mid, minWidth:18, textAlign:"center" }}>{item.qty}</span>
                  <button onClick={() => add(item,1)} style={{ width:26, height:26, borderRadius:5, background:C.red, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Plus size={12} color="white" />
                  </button>
                </div>
                <div style={{ fontFamily:C.f2, fontWeight:700, color:C.red, fontSize:14, minWidth:48, textAlign:"right" }}>₹{item.price * item.qty}</div>
              </div>
            ))}

            {hasDlv && (
              <div>
                <div style={{ fontFamily:C.f2, fontWeight:600, color:C.mid, fontSize:13, marginBottom:6 }}>📍 Delivery Address</div>
                <textarea value={addr} onChange={e => setAddr(e.target.value)} placeholder="Enter your full delivery address..." rows={2}
                  style={{ width:"100%", padding:"10px 13px", border:`1px solid ${C.border}`, borderRadius:8, fontFamily:C.f2, fontSize:13, resize:"none", outline:"none", boxSizing:"border-box" }} />
              </div>
            )}

            <div style={{ background:"white", borderRadius:10, padding:"15px", border:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontFamily:C.f2, color:C.muted, fontSize:13 }}>Subtotal</span>
                <span style={{ fontFamily:C.f2, fontWeight:600, color:C.mid, fontSize:13 }}>₹{sub}</span>
              </div>
              {hasDlv && (
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontFamily:C.f2, color:C.muted, fontSize:13 }}>Delivery charge</span>
                  <span style={{ fontFamily:C.f2, fontWeight:600, color:C.mid, fontSize:13 }}>₹{DELIVERY_FEE}</span>
                </div>
              )}
              <div style={{ borderTop:`1px solid ${C.border}`, marginTop:8, paddingTop:8, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontFamily:C.f2, fontWeight:700, color:C.mid, fontSize:15 }}>Total</span>
                <span style={{ fontFamily:C.f2, fontWeight:700, color:C.red, fontSize:15 }}>₹{sub + (hasDlv ? DELIVERY_FEE : 0)}</span>
              </div>
              <div style={{ fontFamily:C.f2, fontSize:11, color:C.muted, marginTop:4 }}>💵 Cash on Delivery</div>
            </div>

            <button onClick={order}
              style={{ background:C.green, color:"white", padding:"15px", borderRadius:10, fontFamily:C.f2, fontWeight:700, fontSize:15, width:"100%" }}>
              📱 Order via WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CONTACT PAGE ───────────────────────────────────────────────────────────
function ContactPage() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"32px 16px" }}>
      <div style={{ maxWidth:540, margin:"0 auto" }}>
        <h2 style={{ fontFamily:C.f1, color:C.mid, fontSize:28, fontWeight:700, marginBottom:20 }}>Find Us</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {[
            { icon:<MapPin size={18} color={C.red}/>, t:"Address",       b:"VK Bakes & Pizza House\nYour Locality, City — 000000" },
            { icon:<Clock  size={18} color={C.red}/>, t:"Store Timings", b:"Mon – Sat: 8:00 AM – 9:00 PM\nSunday: 9:00 AM – 8:00 PM" },
            { icon:<Phone  size={18} color={C.red}/>, t:"WhatsApp",      b:"+91 99999 99999" },
          ].map(({ icon, t, b }) => (
            <div key={t} style={{ background:"white", borderRadius:12, padding:"18px", border:`1px solid ${C.border}`, display:"flex", gap:14, alignItems:"flex-start" }}>
              <div style={{ width:38, height:38, borderRadius:9, background:"#FFF0E0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{icon}</div>
              <div>
                <div style={{ fontFamily:C.f2, fontWeight:700, color:C.mid, fontSize:14, marginBottom:3 }}>{t}</div>
                <div style={{ fontFamily:C.f2, color:C.muted, fontSize:13, whiteSpace:"pre-line" }}>{b}</div>
              </div>
            </div>
          ))}
          <a href={`https://wa.me/${WA}`} target="_blank" rel="noreferrer"
            style={{ background:C.green, color:"white", padding:"15px", borderRadius:12, fontFamily:C.f2, fontWeight:700, fontSize:15, textAlign:"center", display:"block", textDecoration:"none" }}>
            💬 Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

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
      {page === "home"    && <HomePage go={go} cart={cart} add={add} />}
      {page === "menu"    && <MenuPage cart={cart} add={add} />}
      {page === "cake"    && <CakePage />}
      {page === "cart"    && <CartPage cart={cart} add={add} />}
      {page === "contact" && <ContactPage />}
    </>
  );
}