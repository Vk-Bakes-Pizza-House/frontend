import { useState, useRef, useEffect } from "react";
import {
  User, Lock, Store, Bell, AlertTriangle, Eye, EyeOff,
  Check, Camera, Phone, MapPin, Clock, Save, LogOut,
  Shield, ToggleLeft, ToggleRight, Edit3, Copy,
  CheckCircle, X, Trash2, RefreshCw, Smartphone,
  ChevronRight, Activity, Key, Globe, Volume2, Mail,
} from "lucide-react";

import { Input,SaveButton,Alert,ToggleRow,StrengthMeter,PasswordInput } from "../../components/From";
import { useProfileStore } from "../../store";
// Within danger tab:

export default function DangerTab({ onLogout }) {
  const [confirm, setConfirm] = useState("");
  const [modal,   setModal]   = useState(null); // "logout" | "clear" | "reset"
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");

  const ACTIONS = [
    {
      key:     "logout",
      icon:    LogOut,
      title:   "Sign Out Everywhere",
      desc:    "End all active sessions on every device. You'll need to log in again.",
      label:   "Sign Out All Sessions",
      color:   "text-amber-400",
      border:  "border-amber-500/20",
      bg:      "bg-amber-500/10",
      btnCls:  "bg-amber-600 hover:bg-amber-500",
      confirm: null,
    },
    {
      key:     "clear",
      icon:    Trash2,
      title:   "Clear Order History",
      desc:    "Permanently delete all delivered and cancelled order records. Cannot be undone.",
      label:   "Clear Old Orders",
      color:   "text-red-400",
      border:  "border-red-500/20",
      bg:      "bg-red-500/10",
      btnCls:  "bg-red-700 hover:bg-red-600",
      confirm: "clear orders",
    },
    {
      key:     "reset",
      icon:    RefreshCw,
      title:   "Reset All Settings",
      desc:    "Restore store info, notifications, and preferences to defaults. Your menu and orders are not affected.",
      label:   "Reset Settings",
      color:   "text-red-400",
      border:  "border-red-500/20",
      bg:      "bg-red-500/10",
      btnCls:  "bg-red-700 hover:bg-red-600",
      confirm: "reset settings",
    },
  ];

  const { clearOrderHistory, resetAllSettings, revokeAllSessions } = useProfileStore();

const ACTION_ERROR_LABELS = {
  logout: "sign out all sessions",
  clear: "clear order history",
  reset: "reset all settings",
};

const execute = async () => {
  if (!modal) return;

  setLoading(true);
  setError("");

  let success = false;
  let errorMessage = "";

  try {
    if (modal === "logout") success = await revokeAllSessions();
    if (modal === "clear") success = await clearOrderHistory();
    if (modal === "reset") success = await resetAllSettings();
  } catch (err) {
    success = false;
    errorMessage = `Unable to ${ACTION_ERROR_LABELS[modal]}: ${err?.message || "Please try again."}`;
  }

  setLoading(false);

  if (success) {
    setDone(true);
    if (modal === "logout" && onLogout) onLogout();
    setTimeout(() => { setDone(false); setModal(null); setConfirm(""); setError(""); }, 1500);
    return;
  }

  if (!success) {
    setError(errorMessage || `Unable to ${ACTION_ERROR_LABELS[modal] || "complete this action"}. Please try again.`);
  }
};

  const active = ACTIONS.find(a => a.key === modal);

  return (
    <div className="space-y-5">
      <Alert type="danger">
        Actions in this section are irreversible. Please read each description carefully before proceeding.
      </Alert>

      {ACTIONS.map(action => (
        <div key={action.key} className={`rounded-2xl border ${action.border} p-6`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <action.icon size={16} className={action.color} />
              </div>
              <div>
                <p className={`text-sm font-bold ${action.color}`}>{action.title}</p>
                <p className="text-xs text-stone-500 mt-1 max-w-md leading-relaxed">{action.desc}</p>
              </div>
            </div>
            <button
              onClick={() => { setModal(action.key); setConfirm(""); setError(""); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold text-white ${action.btnCls} transition-colors flex-shrink-0 flex items-center gap-1.5`}
            >
              <action.icon size={12} /> {action.label}
            </button>
          </div>
        </div>
      ))}

      {/* Confirmation modal */}
      {modal && active && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className={`w-12 h-12 rounded-xl ${active.bg} flex items-center justify-center mb-4`}>
              <active.icon size={20} className={active.color} />
            </div>
            <p className="text-base font-bold text-stone-100 mb-2">{active.title}</p>
            <p className="text-xs text-stone-400 leading-relaxed mb-5">{active.desc}</p>

            {active.confirm && (
              <div className="mb-4">
                <p className="text-xs text-stone-400 mb-2">
                  Type <span className="font-mono text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">{active.confirm}</span> to confirm:
                </p>
                <input
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder={active.confirm}
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-600 bg-stone-800 text-stone-100 text-sm outline-none focus:border-red-500 font-mono"
                />
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setModal(null); setConfirm(""); setError(""); }}
                className="flex-1 py-2.5 rounded-lg border border-stone-700 text-stone-400 text-sm font-semibold hover:bg-stone-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={execute}
                disabled={active.confirm && confirm !== active.confirm || loading}
                className={`flex-1 py-2.5 rounded-lg text-white text-sm font-bold transition-all flex items-center justify-center gap-2
                  ${active.confirm && confirm !== active.confirm
                    ? "bg-stone-700 cursor-not-allowed opacity-50"
                    : `${active.btnCls}`}`}
              >
                {loading ? (
                  <><RefreshCw size={13} className="animate-spin" /> Processing…</>
                ) : done ? (
                  <><CheckCircle size={13} /> Done!</>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}