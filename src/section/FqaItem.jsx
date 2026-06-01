import {useState} from "react"
import {ChevronUp,ChevronDown } from "lucide-react"
// ── FAQ accordion ─────────────────────────────────────────────
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