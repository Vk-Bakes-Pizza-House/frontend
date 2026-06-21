// admin/ManageCombos.jsx
// ─────────────────────────────────────────────────────────────
// Admin page — manage combo deals shown on home page & Combos page.
// Features:
//  • Stat cards — total, active, by category
//  • Create/Edit combo — item builder, price calculator, category picker
//  • Toggle active/inactive, delete with confirm
//  • Filter by category, search
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import {
  Plus, Trash2, Edit3, Eye, EyeOff, X, Check,
  Save, RefreshCw, CheckCircle, Search, Tag,
  IndianRupee, AlertTriangle, Percent, ShoppingBag,
} from "lucide-react";

const CATS = [
  { key:"pizza-pizza",    label:"Pizza + Pizza",     emoji:"🍕" },
  { key:"pizza-cake",     label:"Pizza + Cake",      emoji:"🎂" },
  { key:"pizza-icecream", label:"Pizza + Ice Cream", emoji:"🍦" },
  { key:"custom",         label:"Custom Combo",      emoji:"✨" },
];

const ITEM_CATS = ["pizza","bake","bread","toast","biscuit","cake","ice"];
const EMOJI = { pizza:"🍕",bake:"🥐",bread:"🍞",toast:"🥖",biscuit:"🍪",cake:"🎂",ice:"🍦" };

const INIT_COMBOS = [
  { _id:"c1", name:"Double Pizza Mania",       comboType:"pizza-pizza",    items:[{name:"Margherita Pizza",category:"pizza",qty:1},{name:"Paneer Tikka Pizza",category:"pizza",qty:1}], originalPrice:478, comboPrice:399, tag:"Most Popular",      available:true  },
  { _id:"c2", name:"Twin Pizza Feast",         comboType:"pizza-pizza",    items:[{name:"Veg Supreme Pizza",category:"pizza",qty:1},{name:"Margherita Pizza",category:"pizza",qty:1}],     originalPrice:448, comboPrice:379, tag:"",                   available:true  },
  { _id:"c3", name:"Pizza & Cake Celebration", comboType:"pizza-cake",     items:[{name:"Paneer Tikka Pizza",category:"pizza",qty:1},{name:"Chocolate Truffle Cake",category:"cake",qty:1}], originalPrice:629, comboPrice:529, tag:"Best for Birthdays", available:true },
  { _id:"c4", name:"Pizza + Butterscotch",     comboType:"pizza-cake",     items:[{name:"Margherita Pizza",category:"pizza",qty:1},{name:"Butterscotch Cake",category:"cake",qty:1}],        originalPrice:519, comboPrice:449, tag:"",                   available:true  },
  { _id:"c5", name:"Pizza & Scoop Combo",      comboType:"pizza-icecream", items:[{name:"Margherita Pizza",category:"pizza",qty:1},{name:"Mango Ice Cream",category:"ice",qty:2}],          originalPrice:319, comboPrice:269, tag:"Limited Time",       available:true  },
  { _id:"c6", name:"Spicy Pizza + Cool Down",  comboType:"pizza-icecream", items:[{name:"Paneer Tikka Pizza",category:"pizza",qty:1},{name:"Chocolate Ice Cream",category:"ice",qty:2}],     originalPrice:399, comboPrice:339, tag:"",                   available:false },
];

const BLANK = { name:"", comboType:"pizza-pizza", items:[{name:"",category:"pizza",qty:1},{name:"",category:"pizza",qty:1}], originalPrice:"", comboPrice:"", tag:"", available:true };
const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-700 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 transition-all";

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`rounded-2xl p-4 flex items-start gap-3 ${color}`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xl font-black text-stone-800 leading-none">{value}</p>
        <p className="text-xs text-stone-500 mt-0.5 font-semibold">{label}</p>
      </div>
    </div>
  );
}

// ── Item row inside combo form ──────────────────────────────
function ItemRow({ item, onChange, onRemove, canRemove }) {
  return (
    <div className="flex gap-2 items-center">
      <select
        value={item.category}
        onChange={e => onChange({ ...item, category: e.target.value })}
        className="px-2.5 py-2.5 rounded-xl border border-stone-200 text-sm bg-white outline-none focus:border-orange-400 flex-shrink-0"
      >
        {ITEM_CATS.map(c => <option key={c} value={c}>{EMOJI[c]} {c}</option>)}
      </select>
      <input
        value={item.name}
        onChange={e => onChange({ ...item, name: e.target.value })}
        placeholder="Item name e.g. Margherita Pizza"
        className={`${inputCls} flex-1`}
      />
      <input
        type="number" min="1" value={item.qty}
        onChange={e => onChange({ ...item, qty: Number(e.target.value) || 1 })}
        className="w-16 px-2 py-2.5 rounded-xl border border-stone-200 text-sm text-center bg-white outline-none focus:border-orange-400 flex-shrink-0"
      />
      {canRemove && (
        <button onClick={onRemove} className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-500 flex items-center justify-center flex-shrink-0 hover:bg-red-100 transition-all">
          <X size={13}/>
        </button>
      )}
    </div>
  );
}

// ── Combo form ────────────────────────────────────────────────
function ComboForm({ initial, onSave, onCancel, saveLoading, saved }) {
  const [f, setF] = useState({ ...initial, items: [...initial.items] });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const updateItem = (i, val) => setF(p => { const arr=[...p.items]; arr[i]=val; return { ...p, items:arr }; });
  const addItem    = () => setF(p => ({ ...p, items:[...p.items, { name:"", category:"pizza", qty:1 }] }));
  const removeItem = (i) => setF(p => ({ ...p, items: p.items.filter((_,j)=>j!==i) }));

  const orig  = Number(f.originalPrice) || 0;
  const combo = Number(f.comboPrice) || 0;
  const pct   = orig > 0 && combo > 0 && combo < orig ? Math.round(((orig-combo)/orig)*100) : 0;

  const valid = f.name.trim() && f.items.length >= 2 && f.items.every(i => i.name.trim()) &&
                orig > 0 && combo > 0 && combo < orig;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
        <p className="text-sm font-bold text-stone-800">{initial._id ? "✏️ Edit Combo" : "✨ New Combo"}</p>
        <button onClick={onCancel} className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-all">
          <X size={14}/>
        </button>
      </div>

      <div className="p-5 space-y-5">

        {/* Name + category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Combo Name *</label>
            <input className={inputCls} value={f.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Double Pizza Mania" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Category *</label>
            <select className={inputCls} value={f.comboType} onChange={e => set("comboType", e.target.value)}>
              {CATS.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
            </select>
          </div>
        </div>

        {/* Items builder */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag size={11}/> Combo Items * (min 2)
            </label>
            <button onClick={addItem} className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors">
              <Plus size={11}/> Add item
            </button>
          </div>
          <div className="space-y-2">
            {f.items.map((item, i) => (
              <ItemRow key={i} item={item} onChange={v => updateItem(i,v)} onRemove={() => removeItem(i)} canRemove={f.items.length > 2} />
            ))}
          </div>
        </div>

        {/* Price calculator */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Percent size={11}/> Price & Discount
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500">Original Price (sum of items) *</label>
              <div className="relative">
                <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="number" className={`${inputCls} pl-8`} value={f.originalPrice} onChange={e => set("originalPrice", e.target.value)} placeholder="478" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-500">Combo Price (discounted) *</label>
              <div className="relative">
                <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="number" className={`${inputCls} pl-8`} value={f.comboPrice} onChange={e => set("comboPrice", e.target.value)} placeholder="399" />
              </div>
            </div>
          </div>
          {orig > 0 && combo > 0 && (
            combo < orig ? (
              <div className="flex items-center gap-2 bg-emerald-100 border border-emerald-300 rounded-lg px-3 py-2">
                <CheckCircle size={13} className="text-emerald-600 flex-shrink-0" />
                <p className="text-xs text-emerald-700 font-bold">
                  Customer saves ₹{orig-combo} — {pct}% OFF
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-red-100 border border-red-300 rounded-lg px-3 py-2">
                <AlertTriangle size={13} className="text-red-600 flex-shrink-0" />
                <p className="text-xs text-red-600 font-bold">Combo price must be lower than original price</p>
              </div>
            )
          )}
        </div>

        {/* Tag */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
            <Tag size={11}/> Badge Tag (optional)
          </label>
          <input className={inputCls} value={f.tag} onChange={e => set("tag", e.target.value)} placeholder='e.g. "Most Popular", "Limited Time"' />
        </div>

        {/* Active toggle */}
        <button onClick={() => set("available", !f.available)} className="flex items-center gap-2 text-sm font-semibold text-stone-600">
          <div className={`w-10 h-5 rounded-full transition-all flex items-center px-0.5 ${f.available ? "bg-emerald-500 justify-end" : "bg-stone-300 justify-start"}`}>
            <div className="w-4 h-4 rounded-full bg-white shadow" />
          </div>
          {f.available ? "Active — visible to customers" : "Inactive — hidden from customers"}
        </button>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
          <button onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-500 text-xs font-bold hover:bg-stone-50 transition-all">
            Cancel
          </button>
          <button
            onClick={() => valid && onSave(f)}
            disabled={!valid || saveLoading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all
              ${!valid ? "bg-stone-300 cursor-not-allowed" : saved ? "bg-emerald-500" : "bg-orange-600 hover:bg-orange-500 shadow-md shadow-orange-200"}`}
          >
            {saveLoading ? <><RefreshCw size={12} className="animate-spin"/> Saving…</>
             : saved     ? <><CheckCircle size={12}/> Saved!</>
                         : <><Save size={12}/> {initial._id ? "Update Combo" : "Create Combo"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Combo row in list ──────────────────────────────────────────
function ComboRow({ combo, onEdit, onDelete, onToggle }) {
  const [delConfirm, setDelConfirm] = useState(false);
  const cat = CATS.find(c => c.key === combo.comboType);
  const pct = Math.round(((combo.originalPrice - combo.comboPrice) / combo.originalPrice) * 100);

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all ${combo.available ? "border-stone-200" : "border-stone-200 opacity-60"}`}>
      <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
        <span className="text-xl flex-shrink-0">{cat?.emoji}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-stone-700">{combo.name}</p>
            {combo.tag && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">{combo.tag}</span>}
          </div>
          <p className="text-xs text-stone-400 mt-0.5 truncate">
            {combo.items.map(i => `${i.qty}× ${i.name}`).join(" + ")}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-xs text-stone-400 line-through">₹{combo.originalPrice}</p>
          <p className="text-sm font-black text-orange-600">₹{combo.comboPrice}</p>
        </div>

        <span className="text-xs font-bold bg-red-50 text-red-500 px-2 py-1 rounded-full flex-shrink-0">{pct}% OFF</span>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={() => onToggle(combo._id)}
            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${combo.available ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "border-stone-200 bg-stone-50 text-stone-400 hover:bg-stone-100"}`}>
            {combo.available ? <Eye size={12}/> : <EyeOff size={12}/>}
          </button>
          <button onClick={() => onEdit(combo)}
            className="w-7 h-7 rounded-lg border border-stone-200 bg-stone-50 text-stone-500 hover:text-orange-600 hover:border-orange-300 flex items-center justify-center transition-all">
            <Edit3 size={12}/>
          </button>
          <button onClick={() => setDelConfirm(true)}
            className="w-7 h-7 rounded-lg border border-red-100 bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-all">
            <Trash2 size={12}/>
          </button>
        </div>
      </div>

      {delConfirm && (
        <div className="border-t border-red-100 bg-red-50 px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-xs text-red-600 font-semibold flex items-center gap-1.5">
            <AlertTriangle size={11}/> Delete "{combo.name}"? Cannot be undone.
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setDelConfirm(false)} className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 text-xs font-bold bg-white hover:bg-stone-50 transition-all">Cancel</button>
            <button onClick={() => { onDelete(combo._id); setDelConfirm(false); }} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-500 transition-all">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function ManageCombos() {
  const [combos,      setCombos]      = useState(INIT_COMBOS);
  const [view,        setView]        = useState("list");
  const [editing,     setEditing]     = useState(null);
  const [filter,      setFilter]      = useState("all");
  const [q,           setQ]           = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saved,       setSaved]       = useState(false);

  const openNew  = ()     => { setEditing(BLANK); setView("form"); };
  const openEdit = (c)    => { setEditing(c);     setView("form"); };
  const closeForm = ()    => { setView("list"); setEditing(null); setSaved(false); };

  const saveCombo = async (f) => {
    setSaveLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const payload = { ...f, originalPrice: Number(f.originalPrice), comboPrice: Number(f.comboPrice) };
    if (f._id) {
      setCombos(prev => prev.map(c => c._id === f._id ? payload : c));
    } else {
      setCombos(prev => [{ ...payload, _id: Date.now().toString() }, ...prev]);
    }
    setSaveLoading(false); setSaved(true);
    setTimeout(() => { setSaved(false); closeForm(); }, 1000);
  };

  const deleteCombo = (id) => setCombos(prev => prev.filter(c => c._id !== id));
  const toggleCombo = (id) => setCombos(prev => prev.map(c => c._id === id ? { ...c, available: !c.available } : c));

  const active   = combos.filter(c => c.available).length;
  const byType   = (t) => combos.filter(c => c.comboType === t).length;

  const visible = combos.filter(c =>
    (filter === "all" || c.comboType === filter) &&
    (!q || c.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        button { cursor: pointer; border: none; background: none; padding: 0; }
        input, select { font-family: inherit; outline: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 0.7s linear infinite; }
      `}</style>

      <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-stone-200 px-5 py-3.5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Playfair Display',serif" }}>Combo Deals</h2>
            <p className="text-xs text-stone-400 mt-0.5">{active} active · {combos.length} total</p>
          </div>
          {view === "list" ? (
            <button onClick={openNew} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md shadow-orange-200">
              <Plus size={14}/> New Combo
            </button>
          ) : (
            <button onClick={closeForm} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-50 transition-all">
              <X size={14}/> Cancel
            </button>
          )}
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">

          {view === "form" && editing !== null ? (
            <ComboForm initial={editing} onSave={saveCombo} onCancel={closeForm} saveLoading={saveLoading} saved={saved} />
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <StatCard icon="🔥" label="Total Combos" value={combos.length}            color="bg-white border border-stone-200" />
                <StatCard icon="🍕" label="Pizza+Pizza"   value={byType("pizza-pizza")}    color="bg-orange-50" />
                <StatCard icon="🎂" label="Pizza+Cake"    value={byType("pizza-cake")}      color="bg-pink-50"   />
                <StatCard icon="🍦" label="Pizza+IceCream" value={byType("pizza-icecream")} color="bg-blue-50"   />
              </div>

              {/* Filter + search */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 flex-1">
                  <Search size={14} className="text-stone-400 flex-shrink-0"/>
                  <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search combos…" className="flex-1 text-sm text-stone-700 bg-transparent"/>
                  {q && <button onClick={() => setQ("")}><X size={12} className="text-stone-400"/></button>}
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {["all", ...CATS.map(c=>c.key)].map(k => {
                    const cat = CATS.find(c=>c.key===k);
                    return (
                      <button key={k} onClick={() => setFilter(k)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex-shrink-0
                          ${filter===k ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"}`}>
                        {k==="all" ? "All" : `${cat.emoji} ${cat.label}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* List */}
              <div className="flex flex-col gap-3">
                {visible.map(combo => (
                  <ComboRow key={combo._id} combo={combo} onEdit={openEdit} onDelete={deleteCombo} onToggle={toggleCombo} />
                ))}
                {visible.length === 0 && (
                  <div className="text-center py-16 text-stone-400">
                    <div className="text-4xl mb-3">🔥</div>
                    <p className="text-sm font-semibold">No combos found</p>
                    <p className="text-xs mt-1">Try a different filter or create your first combo</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}