import { useState } from "react";
import {
  User, Lock, Store, Bell, AlertTriangle, Eye, EyeOff,
  Check, Camera, Phone, MapPin, Clock, Save, LogOut,
  Shield, ToggleLeft, ToggleRight, Edit3, Copy,
  CheckCircle, X, Trash2, RefreshCw, Smartphone,
  ChevronRight, Activity, Key, Globe, Volume2, Mail,
} from "lucide-react";

// ── Reusable Input ────────────────────────────────────────────
export function Input({ label, hint, error, type = "text", value, onChange, placeholder, disabled, readOnly, icon: Icon }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-[#1A0A00] tracking-wider uppercase">{label}</label>}
      <div className="relative">
        {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6A4F]"><Icon size={14} /></div>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className={`
            w-full rounded-lg border text-sm transition-all outline-none
            ${Icon ? "pl-9 pr-3" : "px-3"} py-2.5
            ${disabled || readOnly
              ? "bg-white/60 border-[#E8D5C0] text-[#8B6A4F] cursor-default"
              : "bg-white border-[#E8D5C0] text-[#1A0A00] focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]/20"
            }
            ${error ? "border-red-500" : ""}
          `}
        />
      </div>
      {hint  && <p className="text-xs text-[#8B6A4F]">{hint}</p>}
      {error && <p className="text-xs text-red-400 flex items-center gap-1"><X size={10} />{error}</p>}
    </div>
  );
}

// ── Password Input ────────────────────────────────────────────
export function PasswordInput({ label, value, onChange, placeholder, error }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-[#1A0A00] tracking-wider uppercase">{label}</label>}
      <div className="relative">
        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6A4F]" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-lg border text-sm transition-all outline-none pl-9 pr-10 py-2.5
            bg-white border-[#E8D5C0] text-[#1A0A00]
            focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]/20
            ${error ? "border-red-500" : ""}
          `}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B6A4F] hover:text-[#1A0A00] transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-400 flex items-center gap-1"><X size={10} />{error}</p>}
    </div>
  );
}

// ── Strength Meter ────────────────────────────────────────────
export function StrengthMeter({ password }) {
  const checks = [
    { label: "8+ chars",   ok: password.length >= 8       },
    { label: "Uppercase",  ok: /[A-Z]/.test(password)     },
    { label: "Number",     ok: /\d/.test(password)        },
    { label: "Symbol",     ok: /[!@#$%^&*]/.test(password) },
  ];
  const score  = checks.filter(c => c.ok).length;
  const colors = ["bg-stone-700", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const lColors = ["", "text-red-400", "text-amber-400", "text-blue-400", "text-emerald-400"];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-stone-700"}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          {checks.map(c => (
            <span key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? "text-emerald-400" : "text-stone-600"}`}>
              {c.ok ? <Check size={9} /> : <X size={9} />}{c.label}
            </span>
          ))}
        </div>
        {score > 0 && <span className={`text-xs font-bold ${lColors[score]}`}>{labels[score]}</span>}
      </div>
    </div>
  );
}

// ── Toggle Row ────────────────────────────────────────────────
export function ToggleRow({ label, sub, on, onToggle, last }) {
  return (
    <div className={`flex items-center justify-between py-3.5 ${!last ? "border-b border-stone-700/60" : ""}`}>
      <div>
        <p className="text-sm font-medium text-stone-200">{label}</p>
        {sub && <p className="text-xs text-stone-500 mt-0.5">{sub}</p>}
      </div>
      <button onClick={onToggle}>
        {on
          ? <ToggleRight size={28} className="text-orange-400" />
          : <ToggleLeft  size={28} className="text-stone-600"  />}
      </button>
    </div>
  );
}

// ── Save Button ───────────────────────────────────────────────
export function SaveButton({ onClick, loading, saved, label = "Save Changes" }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-all duration-300
        ${saved ? "bg-emerald-600" : "bg-orange-600 hover:bg-orange-500 active:scale-95"}`}
    >
      {loading ? (
        <><RefreshCw size={14} className="animate-spin" /> Saving…</>
      ) : saved ? (
        <><CheckCircle size={14} /> Saved!</>
      ) : (
        <><Save size={14} /> {label}</>
      )}
    </button>
  );
}

// ── Alert box ─────────────────────────────────────────────────
export function Alert({ type = "info", children }) {
  const styles = {
    info:    "bg-blue-500/10 border-blue-500/30 text-blue-300",
    warning: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    danger:  "bg-red-500/10  border-red-500/30  text-red-300",
  };
  const icons = { info: "ℹ️", warning: "⚠️", danger: "🚨" };
  return (
    <div className={`flex gap-3 p-3.5 rounded-lg border text-xs leading-relaxed ${styles[type]}`}>
      <span className="flex-shrink-0 mt-0.5">{icons[type]}</span>
      <span>{children}</span>
    </div>
  );
}