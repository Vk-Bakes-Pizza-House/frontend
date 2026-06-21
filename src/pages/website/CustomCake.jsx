import { useState } from "react";
import WhatsAppButton from "../../components/WhatsAppButton";
import { C } from "../../data/menu";
import {
  ChevronRight, Sparkles, Camera, Star, ArrowRight,
} from "lucide-react";

// ── Min delivery date = today + 2 days ───────────────────────
const getMinDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
};

// ── Cake Library ──────────────────────────────────────────────
const CAKE_CATEGORIES = [
  { key: "birthday",    label: "Birthday Cakes",    emoji: "🎂" },
  { key: "anniversary", label: "Anniversary Cakes", emoji: "💑" },
  { key: "wedding",     label: "Wedding Cakes",     emoji: "💍" },
  { key: "photo",       label: "Photo Cakes",       emoji: "📸" },
  { key: "kids",        label: "Kids Theme Cakes",  emoji: "🧸" },
  { key: "designer",    label: "Designer Cakes",    emoji: "✨" },
];

const CAKE_GALLERY = [
  // Birthday
  { id:1,  cat:"birthday",    name:"Classic Chocolate Birthday",  img:"https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",  price:499,  rating:4.9, orders:84,  flavour:"Chocolate",    size:"1lb",   design:"Designer",   tag:"Bestseller" },
  { id:2,  cat:"birthday",    name:"Butterscotch Birthday Bliss", img:"https://images.unsplash.com/photo-1464349172961-10442b37710e?w=600&auto=format&fit=crop&q=80",  price:549,  rating:4.8, orders:61,  flavour:"Butterscotch", size:"1lb",   design:"Designer",   tag:"" },
  { id:3,  cat:"birthday",    name:"Vanilla Rainbow Cake",        img:"https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=600&auto=format&fit=crop&q=80",  price:599,  rating:4.7, orders:47,  flavour:"Vanilla",      size:"1.5lb", design:"Designer",   tag:"Trending" },
  // Anniversary
  { id:4,  cat:"anniversary", name:"Romantic Red Velvet",         img:"https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&auto=format&fit=crop&q=80",  price:649,  rating:4.9, orders:52,  flavour:"Strawberry",   size:"1lb",   design:"Designer",   tag:"Popular" },
  { id:5,  cat:"anniversary", name:"Gold Leaf Anniversary",       img:"https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=600&auto=format&fit=crop&q=80",  price:899,  rating:5.0, orders:38,  flavour:"Chocolate",    size:"2lb",   design:"Designer",   tag:"Premium" },
  // Wedding
  { id:6,  cat:"wedding",     name:"3-Tier White Wedding",        img:"https://images.unsplash.com/photo-1513618827672-0d7c5ad591b1?w=600&auto=format&fit=crop&q=80",  price:1999, rating:5.0, orders:22,  flavour:"Vanilla",      size:"2lb",   design:"Designer",   tag:"Premium" },
  { id:7,  cat:"wedding",     name:"Floral Dream Wedding",        img:"https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&auto=format&fit=crop&q=80",  price:1499, rating:4.9, orders:18,  flavour:"Butterscotch", size:"2lb",   design:"Designer",   tag:"" },
  // Photo
  { id:8,  cat:"photo",       name:"Edible Photo Print Cake",     img:"https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&auto=format&fit=crop&q=80",  price:699,  rating:4.8, orders:93,  flavour:"Chocolate",    size:"1lb",   design:"Photo Cake", tag:"Bestseller" },
  { id:9,  cat:"photo",       name:"Custom Memory Collage",       img:"https://images.unsplash.com/photo-1464349172961-10442b37710e?w=600&auto=format&fit=crop&q=80",  price:799,  rating:4.7, orders:55,  flavour:"Vanilla",      size:"1.5lb", design:"Photo Cake", tag:"" },
  // Kids
  { id:10, cat:"kids",        name:"Cartoon Character Cake",      img:"https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80",  price:599,  rating:4.9, orders:76,  flavour:"Chocolate",    size:"1lb",   design:"Designer",   tag:"Kids Fav" },
  { id:11, cat:"kids",        name:"Rainbow Unicorn Theme",       img:"https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=600&auto=format&fit=crop&q=80",  price:649,  rating:4.8, orders:63,  flavour:"Strawberry",   size:"1lb",   design:"Designer",   tag:"Trending" },
  { id:12, cat:"kids",        name:"Superhero Theme Cake",        img:"https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",  price:649,  rating:4.7, orders:49,  flavour:"Chocolate",    size:"1.5lb", design:"Designer",   tag:"" },
  // Designer
  { id:13, cat:"designer",    name:"Floral Bouquet Cake",         img:"https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&auto=format&fit=crop&q=80",  price:799,  rating:4.9, orders:44,  flavour:"Vanilla",      size:"1.5lb", design:"Designer",   tag:"Premium" },
  { id:14, cat:"designer",    name:"Galaxy Mirror Glaze",         img:"https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=600&auto=format&fit=crop&q=80",  price:999,  rating:5.0, orders:31,  flavour:"Chocolate",    size:"2lb",   design:"Designer",   tag:"Signature" },
  { id:15, cat:"designer",    name:"Drip Art Cake",               img:"https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&auto=format&fit=crop&q=80",  price:699,  rating:4.8, orders:58,  flavour:"Butterscotch", size:"1lb",   design:"Designer",   tag:"" },
];

const TAG_COLORS = {
  Bestseller:"bg-orange-500 text-white", Trending:"bg-pink-500 text-white",
  Popular:"bg-blue-500 text-white",      Premium:"bg-purple-600 text-white",
  Signature:"bg-rose-600 text-white",    "Kids Fav":"bg-emerald-500 text-white",
};

const DESIGN_IMGS = {
  "Simple":     "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
  "Designer":   "https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=600&auto=format&fit=crop&q=80",
  "Photo Cake": "https://images.unsplash.com/photo-1464349172961-10442b37710e?w=600&auto=format&fit=crop&q=80",
};

// ── Sub-components ────────────────────────────────────────────
function FieldLabel({ label }) {
  return (
    <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5">{label}</p>
  );
}

function BtnGroup({ opts, val, on }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {opts.map(o => (
        <button key={o} onClick={() => on(o)}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all
            ${val===o ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-200" : "bg-white text-stone-600 border-stone-200 hover:border-orange-300"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

function Stars({ n }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={10} fill={i<=Math.round(n)?"#F5A623":"none"} color={i<=Math.round(n)?"#F5A623":"#D0C0B0"} />
      ))}
    </div>
  );
}

// ── Cake Card ─────────────────────────────────────────────────
function CakeCard({ cake, onOrder }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all duration-300 group flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 180 }}>
        <img src={cake.img} alt={cake.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

        {/* Tag */}
        {cake.tag && (
          <span className={`absolute top-2.5 left-2.5 text-xs font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[cake.tag]||"bg-stone-700 text-white"}`}>
            {cake.tag}
          </span>
        )}

        {/* Photo cake icon */}
        {cake.design === "Photo Cake" && (
          <span className="absolute top-2.5 right-2.5 w-7 h-7 bg-black/50 backdrop-blur rounded-full flex items-center justify-center">
            <Camera size={13} className="text-white" />
          </span>
        )}

        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${hovered?"opacity-100":"opacity-0"}`}>
          <button onClick={() => onOrder(cake)}
            className="flex items-center gap-1.5 bg-white text-orange-600 font-bold text-xs px-4 py-2.5 rounded-full shadow-lg hover:bg-orange-50 transition-all">
            Order Similar <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1">
        <p className="text-sm font-bold text-stone-800 leading-snug mb-1.5 line-clamp-2">{cake.name}</p>

        <div className="flex items-center gap-1.5 mb-3">
          <Stars n={cake.rating} />
          <span className="text-xs text-stone-400">{cake.rating} ({cake.orders})</span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-xs text-stone-400 leading-none mb-0.5">Starting from</p>
            <p className="text-lg font-black text-orange-600 leading-none">₹{cake.price}</p>
          </div>
          <button onClick={() => onOrder(cake)}
            className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm">
            <ArrowRight size={11} /> Order Similar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function CustomCake() {
  const [activeCat, setActiveCat] = useState("birthday");
  const [formOpen,  setFormOpen]  = useState(false);
  const [f, setF] = useState({ size:"1lb", flavour:"Chocolate", msg:"", design:"Simple", date:"", phone:"", location:"" });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const handleOrderSimilar = (cake) => {
    setF(p => ({ ...p, size:cake.size, flavour:cake.flavour, design:cake.design }));
    setFormOpen(true);
    setTimeout(() => document.getElementById("cake-order-form")?.scrollIntoView({ behavior:"smooth", block:"start" }), 150);
  };

  const SELECTORS = [
    { l:"Cake Size",    opts:["1lb","1.5lb","2lb"],                                           k:"size"    },
    { l:"Flavour",      opts:["Chocolate","Vanilla","Butterscotch","Strawberry","Pineapple"], k:"flavour" },
    { l:"Design Style", opts:["Simple","Designer","Photo Cake"],                              k:"design"  },
  ];

  const INPUTS = [
    { l:"Message on Cake", ph:'"Happy Birthday Raj! 🎉"', k:"msg",      type:"text" },
    { l:"Delivery Date ✱", ph:"",                         k:"date",     type:"date", min:getMinDate() },
    { l:"Your Phone ✱",    ph:"9876543210",               k:"phone",    type:"tel"  },
    { l:"Your Location ✱", ph:"Enter your area / colony", k:"location", type:"text" },
  ];

  const isDisabled = !f.phone.trim() || !f.date;
  const filtered   = CAKE_GALLERY.filter(c => c.cat === activeCat);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; }
        button { cursor:pointer; border:none; background:none; padding:0; }
        input  { font-family:inherit; outline:none; }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        ::-webkit-scrollbar { display:none; }
      `}</style>

      <div style={{ background:C.bg, minHeight:"100vh", fontFamily:C.f2 }}>

        {/* ── HERO ──────────────────────────────────────── */}
        <div style={{ background:`linear-gradient(135deg,${C.dark} 0%,#3D1A00 100%)`, padding:"48px 16px 36px", textAlign:"center" }}>
          <p style={{ fontFamily:C.f2, color:C.gold, fontSize:11, letterSpacing:3, marginBottom:10 }}>✨ MADE TO ORDER</p>
          <h1 style={{ fontFamily:C.f1, color:"#FFF8F0", fontSize:"clamp(26px,5vw,42px)", fontWeight:700, lineHeight:1.15, marginBottom:10 }}>
            Custom Cake Orders
          </h1>
          <p style={{ fontFamily:C.f2, color:"#C8A882", fontSize:14, maxWidth:400, margin:"0 auto 20px" }}>
            Browse our collection, pick a style you love, and we'll bake it just for you.
          </p>
          <div className="flex items-center justify-center gap-5 flex-wrap">
            {["⏰ 2 Days Advance","💵 Cash on Delivery","📱 Confirm on WhatsApp"].map(b => (
              <span key={b} className="text-xs font-semibold" style={{ color:"#C8A882" }}>{b}</span>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">

          {/* Coming soon alert */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl px-4 py-3 flex items-start gap-2.5 mb-6">
            <span className="text-lg flex-shrink-0">🚀</span>
            <div>
              <p className="text-orange-700 font-bold text-sm">Alert: Ye option jald hi open kar diya jayega!</p>
              <p className="text-orange-500 text-xs mt-0.5">Hum is feature par kaam kar rahe hain. Abhi order ke liye neeche form bharein ya WhatsApp karein.</p>
            </div>
          </div>

          {/* ── SECTION HEADER ────────────────────────────── */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 style={{ fontFamily:C.f1, color:C.mid, fontSize:22, fontWeight:700 }}>
              Our Cake Collection
            </h2>
            <button
              onClick={() => { setFormOpen(v=>!v); setTimeout(()=>document.getElementById("cake-order-form")?.scrollIntoView({behavior:"smooth"}),150); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background:C.red }}
            >
              <Sparkles size={13} />
              {formOpen ? "Hide Order Form" : "Place Custom Order"}
              <ChevronRight size={13} className={`transition-transform duration-300 ${formOpen?"rotate-90":""}`} />
            </button>
          </div>

          {/* ── CATEGORY TABS ─────────────────────────────── */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-5">
            {CAKE_CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setActiveCat(cat.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all flex-shrink-0
                  ${activeCat===cat.key ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-200" : "bg-white text-stone-600 border-stone-200 hover:border-orange-300"}`}>
                <span className="text-sm">{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>

          {/* ── CAKE GRID ─────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {filtered.map(cake => (
              <CakeCard key={cake.id} cake={cake} onOrder={handleOrderSimilar} />
            ))}
          </div>

          {/* ── ORDER FORM ────────────────────────────────── */}
          {formOpen && (
            <div id="cake-order-form" className="max-w-xl mx-auto border-t border-stone-200 pt-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                  style={{ background:"#FFF0E0", border:`1px solid ${C.border}` }}>🎂</div>
                <div>
                  <p style={{ fontFamily:C.f1, color:C.mid, fontSize:20, fontWeight:700 }}>Customise Your Cake</p>
                  <p style={{ fontFamily:C.f2, color:C.muted, fontSize:12 }}>
                    Fill the details — we'll confirm price on WhatsApp
                  </p>
                </div>
              </div>

              {/* Design preview image */}
              <div style={{ borderRadius:16, overflow:"hidden", border:`1px solid ${C.border}`, marginBottom:20, position:"relative", height:200 }}>
                <img src={DESIGN_IMGS[f.design]} alt={`${f.design} style`}
                  style={{ width:"100%", height:"100%", objectFit:"cover", transition:"all 0.3s" }} />

                {/* Tag */}
                <span style={{ position:"absolute", top:10, left:10, background:C.red, color:"white", fontSize:10, fontWeight:700, padding:"4px 10px", borderRadius:6, letterSpacing:1 }}>
                  {f.design.toUpperCase()}
                </span>

                {/* Style switcher */}
                <div style={{ position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)", background:"rgba(0,0,0,0.65)", backdropFilter:"blur(4px)", padding:"4px", borderRadius:20, display:"flex", gap:4 }}>
                  {["Simple","Designer","Photo Cake"].map(style => (
                    <button key={style} onClick={() => set("design", style)}
                      style={{ padding:"4px 12px", borderRadius:16, fontSize:11, fontWeight:600,
                        background:f.design===style?"white":"transparent",
                        color:f.design===style?"#2D1400":"rgba(255,255,255,0.85)", transition:"all 0.2s" }}>
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {f.design === "Photo Cake" && (
                <div className="flex items-start gap-2 bg-purple-50 border border-purple-200 rounded-xl px-3.5 py-3 mb-4 text-xs text-purple-700 font-medium">
                  <Camera size={13} className="flex-shrink-0 mt-0.5" />
                  Share your reference photo directly with us on WhatsApp after placing the order!
                </div>
              )}

              {/* Form card */}
              <div style={{ background:"white", borderRadius:16, padding:"24px", border:`1px solid ${C.border}`, display:"flex", flexDirection:"column", gap:20 }}>

                {SELECTORS.map(({ l, opts, k }) => (
                  <div key={k}>
                    <FieldLabel label={l} />
                    <BtnGroup opts={opts} val={f[k]} on={v => set(k,v)} />
                  </div>
                ))}

                {INPUTS.map(({ l, ph, k, type, min }) => (
                  <div key={k}>
                    <FieldLabel label={l} />
                    <input type={type} value={f[k]} min={min} onChange={e => set(k,e.target.value)} placeholder={ph}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-700 bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 transition-all"
                    />
                    {k==="date"  && <p className="text-xs mt-1.5" style={{color:C.muted}}>📅 Earliest available: {getMinDate()}</p>}
                    {k==="phone" && <p className="text-xs mt-1.5" style={{color:C.muted}}>We'll confirm price and details on this number via WhatsApp.</p>}
                  </div>
                ))}

                {/* Order summary */}
                <div style={{ background:"#FFF8F0", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color:C.muted }}>Order Summary</p>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    {[["Size",f.size],["Flavour",f.flavour],["Design",f.design],["Message",f.msg||"None"]].map(([k,v]) => (
                      <div key={k} className="contents">
                        <span className="text-xs font-semibold" style={{ color:C.muted }}>{k}</span>
                        <span className="text-xs font-bold truncate" style={{ color:C.mid }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {isDisabled && (
                  <div style={{ background:"#FFF3E0", border:`1px solid ${C.gold}`, borderRadius:10, padding:"10px 13px" }}>
                    <p className="text-xs font-medium" style={{ color:"#8B5E00" }}>
                      ⚠️ Please fill your <strong>phone number</strong> and <strong>delivery date</strong> to proceed.
                    </p>
                  </div>
                )}

                <WhatsAppButton variant="cake" cakeForm={f} disabled={isDisabled} />

                {/* Trust badges */}
                <div className="flex justify-center gap-5 flex-wrap pt-2" style={{ borderTop:`1px solid ${C.border}` }}>
                  {["🎂 100% Fresh","⏰ 2 Days Advance","💵 Pay on Delivery"].map(b => (
                    <span key={b} className="text-xs font-medium" style={{ color:C.muted }}>{b}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── WHY CHOOSE US ─────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
            {[
              { e:"🎂", t:"Freshly Baked",   s:"Made fresh for every order"    },
              { e:"🎨", t:"Custom Designs",   s:"Personalised just for you"     },
              { e:"📱", t:"WhatsApp Updates", s:"Stay updated at every step"    },
              { e:"💵", t:"Cash on Delivery", s:"Pay only when cake arrives"    },
            ].map(i => (
              <div key={i.t} style={{ background:"white", border:`1px solid ${C.border}`, borderRadius:16, padding:"16px", textAlign:"center" }}>
                <div style={{ fontSize:28, marginBottom:8 }}>{i.e}</div>
                <p style={{ fontFamily:C.f2, fontWeight:700, color:C.mid, fontSize:12, marginBottom:4 }}>{i.t}</p>
                <p style={{ fontFamily:C.f2, color:C.muted, fontSize:11 }}>{i.s}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}