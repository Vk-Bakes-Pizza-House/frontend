import { useState, useRef, useEffect } from "react";
import {
  User, Lock, Store, Bell, AlertTriangle, Eye, EyeOff,
  Check, Camera, Phone, MapPin, Clock, Save, LogOut,
  Shield, ToggleLeft, ToggleRight, Edit3, Copy,
  CheckCircle, X, Trash2, RefreshCw, Smartphone,
  ChevronRight, Activity, Key, Globe, Volume2, Mail,
} from "lucide-react";
import { Input,SaveButton,Alert,ToggleRow,StrengthMeter,PasswordInput } from "../../components/From";
// Within security tab: 
import { useProfileStore } from "../../store";

export default function SecurityTab() {
  const [pwd,  setPwd]  = useState({ current: "", next: "", confirm: "" });
  const [err,  setErr]  = useState({});
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [sessionLoading, setSessionLoading] = useState(null);
//   const [sessions, setSessions] = useState([
//     { device: "Chrome · Windows", location: "Lucknow, IN", time: "Now",          current: true  },
//     { device: "Safari · iPhone",  location: "Lucknow, IN", time: "2 hrs ago",    current: false },
//     { device: "Firefox · Mac",    location: "Delhi, IN",   time: "3 days ago",   current: false },
//   ]);

  const set = (k, v) => { setPwd(p => ({ ...p, [k]: v })); setErr({}); setSaved(false); };

  const validate = () => {
    const e = {};
    if (!pwd.current)              e.current = "Enter your current password";
    if (pwd.next.length < 8)       e.next    = "Password must be at least 8 characters";
    if (pwd.next !== pwd.confirm)  e.confirm  = "Passwords do not match";
    setErr(e);
    return Object.keys(e).length === 0;
  };
const { profile, changePassword, revokeSession, revokeAllSessions } = useProfileStore();
const sessions = profile?.sessions || [];

const handleRevokeSession = async (session) => {
  const id = session.id || session._id || session.key || null;
  if (!id) return;
  setSessionLoading(id);
  await revokeSession(id);
  setSessionLoading(null);
};

const handleRevokeAll = async () => {
  setSessionLoading("all");
  await revokeAllSessions();
  setSessionLoading(null);
};

const save = async () => {
  if (!validate()) return;
  setLoading(true);
  try {
    await changePassword(pwd.current, pwd.next);
    setSaved(true);
    setPwd({ current: "", next: "", confirm: "" });
    setTimeout(() => setSaved(false), 3000);
  } catch (apiErr) {
    setErr({ current: apiErr.message });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="space-y-5">

      {/* Change password */}
      <div className="bg-stone-800/50 rounded-2xl border border-stone-700/50 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Key size={16} className="text-blue-400" />
          <p className="text-sm font-bold text-stone-200">Change Password</p>
        </div>
        <p className="text-xs text-stone-500 mb-5">Use a strong, unique password you don't use elsewhere.</p>

        <div className="space-y-4 max-w-md">
          <PasswordInput
            label="Current Password"
            value={pwd.current}
            onChange={e => set("current", e.target.value)}
            placeholder="Enter current password"
            error={err.current}
          />
          <div>
            <PasswordInput
              label="New Password"
              value={pwd.next}
              onChange={e => set("next", e.target.value)}
              placeholder="Create new password"
              error={err.next}
            />
            <StrengthMeter password={pwd.next} />
          </div>
          <PasswordInput
            label="Confirm New Password"
            value={pwd.confirm}
            onChange={e => set("confirm", e.target.value)}
            placeholder="Repeat new password"
            error={err.confirm}
          />
        </div>

        <div className="mt-5 flex gap-3">
          <SaveButton onClick={save} loading={loading} saved={saved} label="Update Password" />
        </div>
      </div>

      {/* Active sessions */}
      <div className="bg-stone-800/50 rounded-2xl border border-stone-700/50 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Smartphone size={16} className="text-blue-400" />
              <p className="text-sm font-bold text-stone-200">Active Sessions</p>
            </div>
            <p className="text-xs text-stone-500">Devices currently signed into your account</p>
          </div>
          <button
            onClick={handleRevokeAll}
            disabled={sessionLoading === "all"}
            className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut size={12} /> {sessionLoading === "all" ? "Signing out..." : "Sign out all"}
          </button>
        </div>

        <div className="space-y-2">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 bg-stone-900/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.current ? "bg-emerald-400" : "bg-stone-600"}`} />
                <div>
                  <p className="text-sm font-medium text-stone-200">{s.device}</p>
                  <p className="text-xs text-stone-500">{s.location} · {s.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {s.current
                  ? <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">Current</span>
                  : <button
                  onClick={() => handleRevokeSession(s)}
                  disabled={sessionLoading === s.id || sessionLoading === s._id || sessionLoading === s.key}
                  className="text-xs text-stone-500 hover:text-red-400 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sessionLoading === s.id || sessionLoading === s._id || sessionLoading === s.key ? "Revoking..." : "Revoke"}
                </button>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-factor info */}
      <div className="bg-stone-800/50 rounded-2xl border border-stone-700/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-blue-400" />
          <p className="text-sm font-bold text-stone-200">Security Tips</p>
        </div>
        <div className="space-y-2">
          {[
            "Change your password every 3–6 months",
            "Never share your admin credentials with anyone",
            "Always sign out after using a shared device",
            "Use a unique password not used on other websites",
          ].map(tip => (
            <div key={tip} className="flex items-start gap-2.5 text-xs text-stone-400">
              <CheckCircle size={12} className="text-blue-400 flex-shrink-0 mt-0.5" />
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}