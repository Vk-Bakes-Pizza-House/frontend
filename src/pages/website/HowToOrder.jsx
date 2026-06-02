// src/pages/HowToOrder.jsx
// ─────────────────────────────────────────────────────────────
// Public "How to Order" page — animated step-by-step guide.
// Steps are fetched from the backend (falls back to defaults).
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import {
  ShoppingCart, MessageCircle, CheckCircle,
  Truck, ArrowRight, ChevronDown, ChevronUp,
  Phone, MapPin, Clock, Star, HelpCircle,
} from "lucide-react";
import { INIT_STEPS } from "../../data/menu";

// ── Design tokens ─────────────────────────────────────────────
const C = {
  bg:     "#FFF8F0",
  dark:   "#1A0A00",
  mid:    "#2D1400",
  red:    "#D44B1A",
  gold:   "#F5A623",
  muted:  "#8B6A4F",
  border: "#E8D5C0",
  green:  "#25D366",
  f1:     "'Playfair Display', serif",
  f2:     "'DM Sans', sans-serif",
};

// ── Default steps (shown if no backend data) ──────────────────
// const DEFAULT_STEPS = [
//   {
//     id:      1,
//     emoji:   "🍕",
//     title:   "Browse Our Menu",
//     desc:    "Explore our full menu — Pizzas, Bakes, Cakes, Bread, Biscuits and Ice Cream. Filter by category to find exactly what you're craving.",
//     color:   "from-orange-400 to-red-500",
//     bgLight: "bg-orange-50",
//     border:  "border-orange-200",
//     tips: [
//       "Use category filters to quickly find items",
//       "Look for the ⭐ Bestseller badge for top picks",
//       "Check the 🟢 Fresh Board for today's availability",
//     ],
//   },
//   {
//     id:      2,
//     emoji:   "🛒",
//     title:   "Add Items to Cart",
//     desc:    "Tap 'Add' on any item. Your cart builds up automatically. You can adjust quantities any time before ordering.",
//     color:   "from-amber-400 to-orange-500",
//     bgLight: "bg-amber-50",
//     border:  "border-amber-200",
//     tips: [
//       "Ice Cream can only be delivered with a Pizza, Bake or Cake",
//       "Bread, Toast & Biscuits are store pickup only",
//       "No account or login needed — completely hassle-free",
//     ],
//   },
//   {
//     id:      3,
//     emoji:   "📱",
//     title:   "Tap 'Order on WhatsApp'",
//     desc:    "When you're ready, tap the green WhatsApp button. Your complete order — items, quantities, prices and delivery address — is auto-filled in a message to us.",
//     color:   "from-green-400 to-emerald-600",
//     bgLight: "bg-green-50",
//     border:  "border-green-200",
//     tips: [
//       "WhatsApp opens automatically on your phone",
//       "Your full order details are pre-filled — no typing needed",
//       "Add your delivery address in the message before sending",
//     ],
//   },
//   {
//     id:      4,
//     emoji:   "✅",
//     title:   "We Confirm Your Order",
//     desc:    "We'll reply on WhatsApp within a few minutes to confirm your order and give you an estimated delivery time.',",
//     color:   "from-blue-400 to-indigo-500",
//     bgLight: "bg-blue-50",
//     border:  "border-blue-200",
//     tips: [
//       "Confirmation usually takes 2–5 minutes",
//       "We'll let you know if any item is unavailable",
//       "You can modify the order before we start preparing",
//     ],
//   },
//   {
//     id:      5,
//     emoji:   "🛵",
//     title:   "We Deliver to Your Door",
//     desc:    "Sit back and relax! We prepare your order fresh and deliver it hot to your door. You'll get a WhatsApp update when it's on the way.',",
//     color:   "from-purple-400 to-pink-500",
//     bgLight: "bg-purple-50",
//     border:  "border-purple-200",
//     tips: [
//       "₹20 flat delivery charge for all home delivery orders",
//       "Delivery available within our local area",
//       "Track via WhatsApp updates from us",
//     ],
//   },
//   {
//     id:      6,
//     emoji:   "💵",
//     title:   "Pay Cash on Delivery",
//     desc:    "Pay in cash when your order arrives at your door. No online payment, no UPI, no hassle. Simple as that.",
//     color:   "from-teal-400 to-cyan-500",
//     bgLight: "bg-teal-50",
//     border:  "border-teal-200",
//     tips: [
//       "Cash only — no card or UPI needed",
//       "Keep exact change ready if possible",
//       "Receipt shared on WhatsApp on request",
//     ],
//   },
// ];



// ── Step card ─────────────────────────────────────────────────
function StepCard({ step, index, total }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex gap-5 group">
      {/* Connector line */}
      {index < total - 1 && (
        <div className="absolute left-[22px] top-[52px] bottom-0 w-0.5 bg-gradient-to-b from-stone-300 to-transparent z-0" />
      )}

      {/* Step number circle */}
      <div className="flex-shrink-0 z-10">
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg shadow-orange-200/50 group-hover:scale-110 transition-transform duration-300`}>
          <span className="text-xl leading-none">{step.emoji}</span>
        </div>
      </div>

      {/* Content card */}
      <div
        className={`flex-1 mb-8 rounded-2xl border ${step.border} ${step.bgLight} overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md`}
        onClick={() => setOpen(o => !o)}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-xs font-black text-stone-400 uppercase tracking-widest flex-shrink-0">
              Step {index + 1}
            </span>
            <h3 className="text-base font-bold text-stone-800 truncate" style={{ fontFamily: C.f1 }}>
              {step.title}
            </h3>
          </div>
          <div className="flex-shrink-0 text-stone-400">
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>

        {/* Description (always visible) */}
        <div className="px-5 pb-4">
          <p className="text-sm text-stone-600 leading-relaxed">{step.desc}</p>
        </div>

        {/* Tips (expanded) */}
        {open && (
          <div className="px-5 pb-5 border-t border-stone-200/60 pt-4">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
              💡 Tips
            </p>
            <div className="flex flex-col gap-2">
              {step.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-stone-600 leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ── Delivery rules card ───────────────────────────────────────
function DeliveryRules() {
  const rules = [
    { emoji:"🍕", label:"Pizza",              delivery:"✅ Home Delivery",                 color:"text-emerald-600" },
    { emoji:"🎂", label:"Cakes",              delivery:"✅ Home Delivery",                 color:"text-emerald-600" },
    { emoji:"🍦", label:"Ice Cream",          delivery:"✅ Only with Pizza / Cake", color:"text-amber-600"   },
    { emoji:"🍞", label:"Bread & Toast",      delivery:"🏪 Store Pickup Only",             color:"text-stone-500"   },
    { emoji:"🍪", label:"Biscuits",           delivery:"🏪 Store Pickup Only",             color:"text-stone-500"   },
  ];

  return (
    <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-stone-200">
        <p className="text-sm font-bold text-stone-700 flex items-center gap-2">
          <Truck size={15} className="text-orange-500" />
          Delivery Rules at a Glance
        </p>
      </div>
      <div className="divide-y divide-stone-100">
        {rules.map(r => (
          <div key={r.label} className="flex items-center justify-between px-6 py-3">
            <span className="text-sm text-stone-700 flex items-center gap-2.5">
              <span className="text-base">{r.emoji}</span>
              {r.label}
            </span>
            <span className={`text-xs font-semibold ${r.color}`}>{r.delivery}</span>
          </div>
        ))}
      </div>
      <div className="px-6 py-3 bg-stone-50 border-t border-stone-200">
        <p className="text-xs text-stone-400 flex items-center gap-1.5">
          <Truck size={11} /> ₹20 flat delivery charge · Cash on Delivery only
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function HowToOrder({ steps = INIT_STEPS, onNavigate }) {
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        button { cursor: pointer; border: none; background: none; padding: 0; }
      `}</style>

      <div className="min-h-screen" style={{ background: C.bg, fontFamily: C.f2 }}>

        {/* ── Hero ──────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white">
          <div className="max-w-4xl mx-auto px-5 py-16 text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 text-xs font-semibold text-orange-300 mb-5">
              <MessageCircle size={12} /> Order via WhatsApp — No app download needed
            </div>
            <h1
              className="text-4xl sm:text-5xl font-bold mb-4 leading-tight"
              style={{ fontFamily: C.f1 }}
            >
              How to Order from
              <span className="text-orange-400"> VK Bakes</span>
            </h1>
            <p className="text-stone-400 text-base max-w-xl mx-auto leading-relaxed mb-8">
              Ordering is simple — browse our menu, build your cart, and place your order in one tap on WhatsApp. No login, no app, no payment gateway.
            </p>
        
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-5 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── LEFT — Steps ────────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest whitespace-nowrap">
                  {steps.length} Simple Steps
                </span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              {steps.map((step, i) => (
                <StepCard key={step.id} step={step} index={i} total={steps.length} />
              ))}

              {/* CTA after steps */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-6 text-white text-center shadow-lg shadow-green-200">
                <div className="text-3xl mb-3">🎉</div>
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: C.f1 }}>
                  Ready to order?
                </h3>
                <p className="text-sm text-green-100 mb-4 leading-relaxed">
                  It takes less than 2 minutes. Browse our menu and tap "Order on WhatsApp" — we'll take care of the rest!
                </p>
                <button
                  onClick={() => onNavigate && onNavigate("menu")}
                  className="inline-flex items-center gap-2 bg-white text-green-700 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-green-50 transition-all"
                >
                  <ShoppingCart size={14} /> Start Ordering
                  <ArrowRight size={14} />
                </button>
              </div>

            
            </div>

            {/* ── RIGHT — Sticky sidebar ───────────────────── */}
            <div className="flex flex-col gap-5">

              {/* Quick summary */}
              <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm sticky top-6">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">
                  Quick Summary
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: ShoppingCart,   color:"text-orange-500", label:"Browse & add to cart"      },
                    { icon: MessageCircle,  color:"text-green-500",  label:"Tap Order on WhatsApp"     },
                    { icon: CheckCircle,    color:"text-blue-500",   label:"We confirm in 2–5 min"     },
                    { icon: Truck,          color:"text-purple-500", label:"Fresh delivery to your door"},
                    { icon: CheckCircle,    color:"text-teal-500",   label:"Pay ₹20 + order in cash"   },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center flex-shrink-0 ${item.color}`}>
                        <item.icon size={14} />
                      </div>
                      <span className="text-xs font-semibold text-stone-600">{item.label}</span>
                    </div>
                  ))}
                </div>

                
              </div>

              {/* Store info */}
              <div className="bg-white rounded-3xl border border-stone-200 p-5">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Store Info</p>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: MapPin, text:"Your Locality, City — 000000" },
                    { icon: Phone,  text:"+91 99999 99999"               },
                    { icon: Clock,  text:"Mon–Sat: 8AM–9PM · Sun: 9AM–8PM" },
                    { icon: Star,   text:"4.8 ★ · 200+ happy customers"  },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-stone-500">
                      <item.icon size={13} className="text-orange-400 flex-shrink-0 mt-0.5" />
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery rules */}
              <DeliveryRules />

            </div>
          </div>
        </div>
      </div>
    </>
  );
}