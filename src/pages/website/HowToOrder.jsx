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
import { INIT_STEPS, } from "../../data/menu";
import { Link } from "react-router-dom";

// ── Design tokens ─────────────────────────────────────────────
const C = {
  bg: "#FFF8F0",
  dark: "#1A0A00",
  mid: "#2D1400",
  red: "#D44B1A",
  gold: "#F5A623",
  muted: "#8B6A4F",
  border: "#E8D5C0",
  green: "#25D366",
  f1: "'Playfair Display', serif",
  f2: "'DM Sans', sans-serif",
};


// ── Step card ─────────────────────────────────────────────────
// ── Step card — Simple & Clean ────────────────────────────────
function StepCard({ step, index, total }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex gap-4 mb-6">
      
      {/* Connector line */}
      {index < total - 1 && (
        <div className="absolute left-[18px] top-[44px] bottom-[-24px] w-px bg-stone-200 z-0" />
      )}

      {/* Step number */}
      <div className="flex-shrink-0 z-10 flex flex-col items-center">
        <div className="w-9 h-9 rounded-full bg-[#D44B1A] flex items-center justify-center text-white text-sm font-bold">
          {index + 1}
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 bg-white border border-stone-200 rounded-2xl overflow-hidden cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{step.emoji}</span>
            <h3 className="text-sm font-semibold text-stone-800">
              {step.title}
            </h3>
          </div>
          <div className="text-stone-400 flex-shrink-0">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {/* Description */}
        <div className="px-4 pb-3 pt-0">
          <p className="text-xs text-stone-500 leading-relaxed">{step.desc}</p>
        </div>

        {/* Tips — expanded */}
        {open && (
          <div className="px-4 pb-4 pt-3 border-t border-stone-100">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
              Tips
            </p>
            <div className="flex flex-col gap-1.5">
              {step.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-stone-500 leading-relaxed">{tip}</span>
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
// function DeliveryRules() {
//   const rules = [
//     { emoji:"🍕", label:"Pizza",              delivery:"✅ Home Delivery",                 color:"text-emerald-600" },
//     { emoji:"🎂", label:"Cakes",              delivery:"✅ Home Delivery",                 color:"text-emerald-600" },
//     { emoji:"🍦", label:"Ice Cream",          delivery:"✅ Only with Pizza / Cake", color:"text-amber-600"   },
//     { emoji:"🍞", label:"Bread & Toast",      delivery:"🏪 Store Pickup Only",             color:"text-stone-500"   },
//     { emoji:"🍪", label:"Biscuits",           delivery:"🏪 Store Pickup Only",             color:"text-stone-500"   },
//   ];

//   return (
//     <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
//       <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-stone-200">
//         <p className="text-sm font-bold text-stone-700 flex items-center gap-2">
//           <Truck size={15} className="text-orange-500" />
//           Delivery Rules at a Glance
//         </p>
//       </div>
//       <div className="divide-y divide-stone-100">
//         {rules.map(r => (
//           <div key={r.label} className="flex items-center justify-between px-6 py-3">
//             <span className="text-sm text-stone-700 flex items-center gap-2.5">
//               <span className="text-base">{r.emoji}</span>
//               {r.label}
//             </span>
//             <span className={`text-xs font-semibold ${r.color}`}>{r.delivery}</span>
//           </div>
//         ))}
//       </div>
//       <div className="px-6 py-3 bg-stone-50 border-t border-stone-200">
//         <p className="text-xs text-stone-400 flex items-center gap-1.5">
//           <Truck size={11} /> ₹20 flat delivery charge · Cash on Delivery only
//         </p>
//       </div>
//     </div>
//   );
// }

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
          <div className="max-w-4xl mx-auto px-5 py-3 text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 text-xs font-semibold text-orange-300 mb-5">
              <MessageCircle size={12} /> Order via WhatsApp — No app download needed
            </div>
            <h1
              className="text-3xl sm:text-4xl font-bold mb-4 leading-tight"
              style={{ fontFamily: C.f1 }}
            >
              How to Order from
              <span className="text-orange-400"> VK Bakes</span>
            </h1>
            {/* <p className="text-stone-400 text-base max-w-xl mx-auto leading-relaxed mb-8">
              Ordering is simple — browse our menu, build your cart, and place your order in one tap on WhatsApp. No login, no app, no payment gateway.
            </p> */}

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
<div className="w-full max-w-2xl mx-auto bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-3 text-white text-center shadow-lg shadow-green-200">                <div className="text-3xl mb-3">🎉</div>
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: C.f1 }}>
                  Ready to order?
                </h3>
                <p className="text-sm text-green-100 mb-4 leading-relaxed">
                  It takes less than 2 minutes. Browse our menu and tap "Order on WhatsApp" — we'll take care of the rest!
                </p>
                <Link to={"/cart"}> 
                <button
                  onClick={() => onNavigate && onNavigate("menu")}
                  className="inline-flex items-center gap-2 bg-white text-green-700 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-green-50 transition-all"
                >
                  <ShoppingCart size={14} /> Start Ordering
                  <ArrowRight size={14} />
                </button>
                </Link>
              </div>


            </div>

            {/* RIGHT — QR Code Section */}
            <div className="flex flex-col gap-5">
              <div className="bg-white rounded-3xl border border-stone-200 p-6 text-center shadow-sm sticky top-6">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">
                  Scan to View Menu
                </p>
                <img
                  src="/qr.png"
                  alt="QR Code"
                  className="w-44 h-44 mx-auto rounded-2xl border border-stone-200 object-contain mb-4"
                />
                <h1 className="text-xl font-bold" style={{ fontFamily: C.f1 ,color: C.red}}>
                  Vk Bakes & Pizza House
                </h1>
                <h3 className="font-serif text-sm  mb-2" style={{ fontFamily: C.f1 ,color: C.dark}}>
                  Scan & Browse Our Menu
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed mb-3">
                  Point your phone camera at the QR code to instantly open our full menu — no app needed!
                </p>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}