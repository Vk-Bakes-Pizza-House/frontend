import {useState} from "react"
import {ChevronUp,ChevronDown,Eye,EyeOff,Edit3,Trash2 } from "lucide-react"// ── FAQ accordion ─────────────────────────────────────────────
export function FaqItem({ q, a, last }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`w-full py-4 md:py-5 ${!last ? "border-b border-stone-100" : ""}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-start justify-between gap-4 w-full text-left"
      >
        {/* min-w-0 aur flex-1 zaroori hai width limits ke liye */}
        <div className="flex-1 min-w-0">
          <span className="text-sm md:text-base font-bold text-stone-700 leading-tight block break-words">
            {q}
          </span>
        </div>
        
        <div className={`flex-shrink-0 mt-1 w-6 h-6 rounded-full flex items-center justify-center transition-all ${open ? "bg-orange-600 text-white rotate-180" : "bg-stone-100 text-stone-400"}`}>
          <ChevronDown size={14} />
        </div>
      </button>

      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden px-1">
          <p className="text-xs md:text-sm text-stone-500 leading-relaxed break-words">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FaqRow({ faq, index, onEdit, onDelete, onToggle }) {
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState({ ...faq });
  const [delConfirm, setDelConfirm] = useState(false);
    const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-700 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 transition-all";

  const save = () => { onEdit(f); setEditing(false); };

  if (editing) {
    return (
      <div className="bg-white rounded-2xl border border-orange-200 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Question</label>
            <input className={inputCls} value={f.q} onChange={e => setF(p=>({...p,q:e.target.value}))} placeholder="e.g. How long does delivery take?" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Answer</label>
            <textarea className={`${inputCls} resize-none`} rows={3} value={f.a} onChange={e => setF(p=>({...p,a:e.target.value}))} placeholder="Your answer…" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 text-xs font-bold">Cancel</button>
            <button onClick={save} className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-bold hover:bg-orange-500 transition-all">Save</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden ${faq.active ? "border-stone-200" : "border-stone-200 opacity-60"}`}>
      <div className="flex items-start gap-3 px-4 py-3">
        <span className="text-xs font-mono text-stone-400 mt-1 flex-shrink-0">Q{index+1}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-700">{faq.q}</p>
          <p className="text-xs text-stone-400 mt-1 line-clamp-2">{faq.a}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={onToggle} className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${faq.active ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-stone-200 bg-stone-50 text-stone-400"}`}>
            {faq.active ? <Eye size={12}/> : <EyeOff size={12}/>}
          </button>
          <button onClick={() => setEditing(true)} className="w-7 h-7 rounded-lg border border-stone-200 bg-stone-50 text-stone-500 hover:text-orange-600 flex items-center justify-center transition-all">
            <Edit3 size={12}/>
          </button>
          <button onClick={() => setDelConfirm(true)} className="w-7 h-7 rounded-lg border border-red-100 bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-all">
            <Trash2 size={12}/>
          </button>
        </div>
      </div>
      {delConfirm && (
        <div className="border-t border-red-100 bg-red-50 px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-xs text-red-600 font-semibold">Delete this FAQ?</p>
          <div className="flex gap-2">
            <button onClick={() => setDelConfirm(false)} className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 text-xs font-bold">Cancel</button>
            <button onClick={() => { onDelete(); setDelConfirm(false); }} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-500">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AddFaqForm({ onSave, onCancel }) {
    const BLANK_FAQ  = { q:"", a:"", active:true };
    const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-700 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 transition-all";

  const [f, setF] = useState({ ...BLANK_FAQ });
  const valid = f.q.trim() && f.a.trim();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Question *</label>
        <input className={inputCls} value={f.q} onChange={e => setF(p=>({...p,q:e.target.value}))} placeholder="e.g. How long does delivery take?" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Answer *</label>
        <textarea className={`${inputCls} resize-none`} rows={3} value={f.a} onChange={e => setF(p=>({...p,a:e.target.value}))} placeholder="Your answer…" />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 text-xs font-bold">Cancel</button>
        <button onClick={() => valid && onSave(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white ${valid ? "bg-orange-600 hover:bg-orange-500" : "bg-stone-300 cursor-not-allowed"}`}>
          Add FAQ
        </button>
      </div>
    </div>
  );
}