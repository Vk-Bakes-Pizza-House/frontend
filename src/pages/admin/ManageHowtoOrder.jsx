
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import {
  Plus, Trash2, ChevronUp, ChevronDown, Save,
  Eye, EyeOff, Check, X, RefreshCw, CheckCircle,
  GripVertical, Edit3, HelpCircle, AlertTriangle,
  Lightbulb, ArrowRight, Info,
} from "lucide-react";
import ManageFaq from "../../section/admin/ManageFqa";
import { useFQAStore } from "../../store";
import { INIT_STEPS } from "../../data/menu";

// ── Default steps (same as public page) ──────────────────────
// const INIT_STEPS = [
//   { id:1, emoji:"🍕", title:"Browse Our Menu",          desc:"Explore our full menu — Pizzas, Bakes, Cakes, Bread, Biscuits and Ice Cream. Filter by category to find exactly what you're craving.", color:"from-orange-400 to-red-500",    bgLight:"bg-orange-50",  border:"border-orange-200",  tips:["Use category filters","Look for ⭐ Bestseller badge","Check 🟢 Fresh Board"], active:true  },
//   { id:2, emoji:"🛒", title:"Add Items to Cart",        desc:"Tap 'Add' on any item. Your cart builds up automatically. You can adjust quantities any time before ordering.",                          color:"from-amber-400 to-orange-500",  bgLight:"bg-amber-50",   border:"border-amber-200",   tips:["Ice Cream only with Pizza/Cake/Bake","Bread & Biscuits are pickup only","No login needed"], active:true },
//   { id:3, emoji:"📱", title:"Tap 'Order on WhatsApp'",  desc:"Tap the green WhatsApp button. Your complete order is auto-filled in a message to us.",                                                  color:"from-green-400 to-emerald-600", bgLight:"bg-green-50",   border:"border-green-200",   tips:["WhatsApp opens automatically","Order details are pre-filled","Add your address in the message"], active:true },
//   { id:4, emoji:"✅", title:"We Confirm Your Order",    desc:"We'll reply on WhatsApp within a few minutes to confirm your order and give you an estimated delivery time.",                            color:"from-blue-400 to-indigo-500",   bgLight:"bg-blue-50",    border:"border-blue-200",    tips:["Confirmation in 2–5 minutes","We'll notify if any item is unavailable","You can modify before we start"], active:true },
//   { id:5, emoji:"🛵", title:"We Deliver to Your Door", desc:"We prepare your order fresh and deliver it hot to your door. You'll get a WhatsApp update when it's on the way.",                       color:"from-purple-400 to-pink-500",   bgLight:"bg-purple-50",  border:"border-purple-200",  tips:["₹20 flat delivery charge","Delivery within local area","Track via WhatsApp updates"], active:true },
//   { id:6, emoji:"💵", title:"Pay Cash on Delivery",    desc:"Pay in cash when your order arrives. No online payment, no UPI, no hassle.",                                                             color:"from-teal-400 to-cyan-500",     bgLight:"bg-teal-50",    border:"border-teal-200",    tips:["Cash only — no card needed","Keep exact change if possible","Receipt on request"], active:true },
// ];




const COLOR_OPTIONS = [
  { label:"Red",    value:"from-orange-400 to-red-500",    bg:"bg-orange-50",  border:"border-orange-200"  },
  { label:"Amber",  value:"from-amber-400 to-orange-500",  bg:"bg-amber-50",   border:"border-amber-200"   },
  { label:"Green",  value:"from-green-400 to-emerald-600", bg:"bg-green-50",   border:"border-green-200"   },
  { label:"Blue",   value:"from-blue-400 to-indigo-500",   bg:"bg-blue-50",    border:"border-blue-200"    },
  { label:"Purple", value:"from-purple-400 to-pink-500",   bg:"bg-purple-50",  border:"border-purple-200"  },
  { label:"Teal",   value:"from-teal-400 to-cyan-500",     bg:"bg-teal-50",    border:"border-teal-200"    },
  { label:"Rose",   value:"from-rose-400 to-pink-600",     bg:"bg-rose-50",    border:"border-rose-200"    },
  { label:"Yellow", value:"from-yellow-400 to-amber-500",  bg:"bg-yellow-50",  border:"border-yellow-200"  },
];

const BLANK_STEP = { emoji:"✨", title:"", desc:"", color:"from-orange-400 to-red-500", bgLight:"bg-orange-50", border:"border-orange-200", tips:[""], active:true };


// ─── Reusable input ───────────────────────────────────────────
const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-700 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 transition-all";

// ── Step form ─────────────────────────────────────────────────
function StepForm({ step, onSave, onCancel, isNew }) {
  const [f, setF] = useState({ ...step, tips: [...(step.tips || [""])] });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const setTip   = (i, v) => setF(p => { const t=[...p.tips]; t[i]=v; return { ...p, tips:t }; });
  const addTip   = () => setF(p => ({ ...p, tips:[...p.tips, ""] }));
  const removeTip = (i) => setF(p => ({ ...p, tips:p.tips.filter((_,j)=>j!==i) }));

  const valid = f.title.trim() && f.desc.trim() && f.emoji.trim();

  const selColor = COLOR_OPTIONS.find(c => c.value === f.color) || COLOR_OPTIONS[0];

  return (
    <div className="bg-white rounded-2xl border border-orange-200 p-5 shadow-sm">
      <p className="text-sm font-bold text-stone-700 mb-4">{isNew ? "➕ Add New Step" : "✏️ Edit Step"}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Emoji */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Emoji *</label>
          <input className={inputCls} value={f.emoji} onChange={e => set("emoji", e.target.value)} placeholder="🍕" maxLength={4} />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Step Title *</label>
          <input className={inputCls} value={f.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Browse Our Menu" />
        </div>

        {/* Description */}
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Description *</label>
          <textarea className={`${inputCls} resize-none`} rows={3} value={f.desc} onChange={e => set("desc", e.target.value)} placeholder="Describe what the customer should do in this step…" />
        </div>

        {/* Color picker */}
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Card Colour</label>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map(c => (
              <button
                key={c.value}
                onClick={() => set("color", c.value) || set("bgLight", c.bg) || setF(p=>({...p,color:c.value,bgLight:c.bg,border:c.border}))}
                className={`w-8 h-8 rounded-xl bg-gradient-to-br ${c.value} flex items-center justify-center transition-all
                  ${f.color===c.value ? "ring-2 ring-offset-2 ring-stone-400 scale-110" : "opacity-70 hover:opacity-100"}`}
                title={c.label}
              >
                {f.color===c.value && <Check size={13} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="sm:col-span-2 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb size={11} /> Tips (optional)
            </label>
            <button onClick={addTip} className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors">
              <Plus size={11} /> Add tip
            </button>
          </div>
          {f.tips.map((tip, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                className={`${inputCls} flex-1`}
                value={tip}
                onChange={e => setTip(i, e.target.value)}
                placeholder={`Tip ${i+1}…`}
              />
              {f.tips.length > 1 && (
                <button onClick={() => removeTip(i)} className="flex-shrink-0 w-7 h-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-100 transition-all">
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Active toggle */}
        <div className="sm:col-span-2 flex items-center gap-3">
          <button onClick={() => set("active", !f.active)} className="flex items-center gap-2 text-sm font-semibold text-stone-600">
            <div className={`w-10 h-5 rounded-full transition-all flex items-center px-0.5 ${f.active ? "bg-orange-500 justify-end" : "bg-stone-300 justify-start"}`}>
              <div className="w-4 h-4 rounded-full bg-white shadow" />
            </div>
            {f.active ? "Visible on public page" : "Hidden from public page"}
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-5 justify-end">
        <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-stone-200 text-stone-500 text-xs font-bold hover:bg-stone-50 transition-all">
          Cancel
        </button>
        <button
          onClick={() => valid && onSave(f)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all
            ${valid ? "bg-orange-600 hover:bg-orange-500" : "bg-stone-300 cursor-not-allowed"}`}
        >
          <Check size={12} /> {isNew ? "Add Step" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ── Step row ──────────────────────────────────────────────────
function StepRow({ step, index, total, onMoveUp, onMoveDown, onEdit, onDelete, onToggle }) {
  const [delConfirm, setDelConfirm] = useState(false);

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all ${step.active ? "border-stone-200" : "border-stone-200 opacity-60"}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Drag handle + arrows */}
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          <button onClick={onMoveUp}   disabled={index===0}       className={`p-0.5 rounded transition-colors ${index===0       ? "text-stone-200 cursor-not-allowed" : "text-stone-400 hover:text-orange-500"}`}><ChevronUp   size={14}/></button>
          <button onClick={onMoveDown} disabled={index===total-1} className={`p-0.5 rounded transition-colors ${index===total-1 ? "text-stone-200 cursor-not-allowed" : "text-stone-400 hover:text-orange-500"}`}><ChevronDown size={14}/></button>
        </div>

        {/* Step number */}
        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-base flex-shrink-0 shadow-sm`}>
          {step.emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-mono">Step {index+1}</span>
            {!step.active && <span className="text-xs text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded font-semibold">Hidden</span>}
          </div>
          <p className="text-sm font-semibold text-stone-700 truncate">{step.title}</p>
          <p className="text-xs text-stone-400 truncate mt-0.5">{step.desc}</p>
        </div>

        {/* Tips count */}
        <div className="flex-shrink-0 hidden sm:flex items-center gap-1 text-xs text-stone-400">
          <Lightbulb size={11} />
          {step.tips?.filter(t => t.trim()).length || 0} tips
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={onToggle} title={step.active ? "Hide step" : "Show step"}
            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all
              ${step.active ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "border-stone-200 bg-stone-50 text-stone-400 hover:bg-stone-100"}`}>
            {step.active ? <Eye size={12}/> : <EyeOff size={12}/>}
          </button>
          <button onClick={onEdit}
            className="w-7 h-7 rounded-lg border border-stone-200 bg-stone-50 text-stone-500 hover:text-orange-600 hover:border-orange-300 flex items-center justify-center transition-all">
            <Edit3 size={12}/>
          </button>
          <button onClick={() => setDelConfirm(true)}
            className="w-7 h-7 rounded-lg border border-red-100 bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-all">
            <Trash2 size={12}/>
          </button>
        </div>
      </div>

      {/* Delete confirm inline */}
      {delConfirm && (
        <div className="border-t border-red-100 bg-red-50 px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-xs text-red-600 font-semibold">Delete "{step.title}"? This cannot be undone.</p>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setDelConfirm(false)} className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 text-xs font-bold hover:bg-white transition-all">Cancel</button>
            <button onClick={() => { onDelete(); setDelConfirm(false); }} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-500 transition-all">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── FAQ row ───────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function ManageHowToOrder() {
const { FAQS } = useFQAStore();

  const [steps,    setSteps]    = useState(INIT_STEPS);
  // const [faqs,     setFaqs]     = useState();
  const [addingStep, setAddingStep] = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  // const [addingFaq,  setAddingFaq]  = useState(false);
  const [activeTab,  setActiveTab]  = useState("steps"); // steps | faqs
  const [preview,    setPreview]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [saved,      setSaved]      = useState(false);

  // ── Step handlers ────────────────────────────────────────
  const addStep = (f) => {
    setSteps(prev => [...prev, { ...f, id: Date.now() }]);
    setAddingStep(false);
  };
  const saveStep = (f) => {
    setSteps(prev => prev.map(s => s.id === f.id ? f : s));
    setEditingId(null);
  };
  const deleteStep = (id) => setSteps(prev => prev.filter(s => s.id !== id));
  const toggleStep = (id) => setSteps(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  const moveStep   = (id, dir) => {
    setSteps(prev => {
      const i    = prev.findIndex(s => s.id === id);
      const next = i + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr  = [...prev];
      [arr[i], arr[next]] = [arr[next], arr[i]];
      return arr;
    });
  };

  // ── FAQ handlers ─────────────────────────────────────────
  // const addFaq    = (f) => { setFaqs(prev => [...prev, { ...f, id: Date.now() }]); setAddingFaq(false); };
  // const editFaq   = (f) => setFaqs(prev => prev.map(q => q.id === f.id ? f : q));
  // const deleteFaq = (id) => setFaqs(prev => prev.filter(q => q.id !== id));
  // const toggleFaq = (id) => setFaqs(prev => prev.map(q => q.id === id ? { ...q, active: !q.active } : q));

  const saveAll = async () => {
    setLoading(true);
    // TODO: POST /api/guide/steps  { steps, faqs }
    await new Promise(r => setTimeout(r, 900));
    setLoading(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const activeSteps = steps.filter(s => s.active).length;
  const activeFaqs  = FAQS.filter(f => f.active).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        button { cursor: pointer; border: none; background: none; padding: 0; }
        input, textarea { font-family: inherit; outline: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 0.7s linear infinite; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Sticky header ────────────────────────────────── */}
        <div className="sticky top-0 z-20 bg-white border-b border-stone-200 px-5 py-3.5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-bold text-stone-800">"How to Order" Page</h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {activeSteps} steps · {activeFaqs} FAQs visible on public page
            </p>
          </div>
          <div className="flex gap-2">
           
            <button
              onClick={saveAll}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all
                ${saved ? "bg-emerald-500" : "bg-orange-600 hover:bg-orange-500 shadow-md shadow-orange-200"}`}
            >
              {loading ? <><RefreshCw size={13} className="animate-spin"/> Saving…</>
               : saved  ? <><CheckCircle size={13}/> Saved!</>
                        : <><Save size={13}/> Save All Changes</>}
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className={`grid gap-6 ${preview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>

            {/* ── EDITOR PANEL ──────────────────────────── */}
            <div>
              {/* Tabs */}
              <div className="flex gap-1 bg-stone-100 rounded-2xl p-1.5 w-fit mb-5">
                {[
                  { k:"steps", label:`Steps (${steps.length})`  },
                  { k:"faqs",  label:`FAQs (${FAQS.length})`    },
                ].map(t => (
                  <button key={t.k} onClick={() => setActiveTab(t.k)}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all
                      ${activeTab===t.k ? "bg-white text-orange-600 font-bold shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── STEPS tab ─────────────────────────────── */}
              {activeTab === "steps" && (
                <div>
                  {/* Info banner */}
                  <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4">
                    <Info size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      Steps appear in order on the public "How to Order" page. Use the arrows to reorder. Toggle the eye icon to hide/show without deleting.
                    </p>
                  </div>

                  {/* Add step form */}
                  {addingStep && (
                    <div className="mb-4">
                      <StepForm step={BLANK_STEP} onSave={addStep} onCancel={() => setAddingStep(false)} isNew />
                    </div>
                  )}

                  {/* Step list */}
                  <div className="flex flex-col gap-3 mb-4">
                    {steps.map((step, i) => (
                      editingId === step.id ? (
                        <StepForm key={step.id} step={step} onSave={saveStep} onCancel={() => setEditingId(null)} isNew={false} />
                      ) : (
                        <StepRow
                          key={step.id}
                          step={step}
                          index={i}
                          total={steps.length}
                          onMoveUp={() => moveStep(step.id, -1)}
                          onMoveDown={() => moveStep(step.id, 1)}
                          onEdit={() => { setEditingId(step.id); setAddingStep(false); }}
                          onDelete={() => deleteStep(step.id)}
                          onToggle={() => toggleStep(step.id)}
                        />
                      )
                    ))}
                  </div>

                  {/* Add button */}
                  {!addingStep && (
                    <button
                      onClick={() => { setAddingStep(true); setEditingId(null); }}
                      className="flex items-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-orange-300 text-orange-500 text-sm font-bold hover:border-orange-400 hover:bg-orange-50 transition-all justify-center"
                    >
                      <Plus size={15} /> Add New Step
                    </button>
                  )}
                </div>
              )}

              {/* ── FAQs tab ──────────────────────────────── */}
              {activeTab === "faqs" && ( 
               <ManageFaq/>
              )}
            </div>

           

          </div>
        </div>
      </div>
    </>
  );
}

// ── Inline add FAQ form ───────────────────────────────────────
