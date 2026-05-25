import { useState, useRef } from "react";
import {
  User, Lock, Store, Bell, AlertTriangle, Eye, EyeOff,
  Check, Camera, Phone, MapPin, Clock, Save, LogOut,
  Shield, ToggleLeft, ToggleRight, Edit3, Copy,
  CheckCircle, X, Trash2, RefreshCw, Smartphone,
  ChevronRight, Activity, Key, Globe, Volume2, Mail,
} from "lucide-react";

// import { StoreTab } from "./ManageStore";
import { Input,SaveButton,Alert,ToggleRow,StrengthMeter,PasswordInput } from "../../components/From";

// ── Tabs config ───────────────────────────────────────────────
const TABS = [
  { key: "profile",       label: "Profile",       icon: User,          color: "text-orange-400"  },
  { key: "security",      label: "Security",      icon: Shield,        color: "text-blue-400"    },
  // { key: "store",         label: "Store Info",    icon: Store,         color: "text-emerald-400" },
  { key: "notifications", label: "Notifications", icon: Bell,          color: "text-yellow-400"  },
  { key: "danger",        label: "Danger Zone",   icon: AlertTriangle, color: "text-red-400"     },
];



// ─────────────────────────────────────────────────────────────
// TAB 1 — Profile
// ─────────────────────────────────────────────────────────────
function ProfileTab() {
  const [form, setForm]       = useState({ displayName: "VK Admin", username: "vkadmin", email: "", bio: "" });
  const [avatar, setAvatar]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [copied,  setCopied]  = useState(false);
  const fileRef = useRef();

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setSaved(false); };

  const handleAvatar = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setAvatar(r.result);
    r.readAsDataURL(f);
  };

  const save = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const copyUsername = () => {
    navigator.clipboard?.writeText(form.username);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">

      {/* Avatar card */}
      <div className="bg-stone-800/50 rounded-2xl border border-stone-700/50 p-6">
        <p className="text-sm font-bold text-stone-200 mb-4">Profile Photo</p>
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center ring-2 ring-orange-500/40">
              {avatar
                ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-3xl font-black text-white select-none">VK</span>}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-orange-600 hover:bg-orange-500 flex items-center justify-center shadow-lg transition-colors"
            >
              <Camera size={12} className="text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-200 mb-1">{form.displayName}</p>
            <p className="text-xs text-stone-500 mb-3">@{form.username} · Admin</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 transition-colors"
            >
              <Edit3 size={11} /> Change photo
            </button>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-stone-800/50 rounded-2xl border border-stone-700/50 p-6">
        <p className="text-sm font-bold text-stone-200 mb-5">Personal Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Display Name"
            value={form.displayName}
            onChange={e => set("displayName", e.target.value)}
            placeholder="VK Admin"
            icon={User}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-400 tracking-wider uppercase">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-xs font-mono">@</span>
              <input
                value={form.username}
                readOnly
                className="w-full pl-7 pr-9 py-2.5 rounded-lg border border-stone-700 bg-stone-800/50 text-stone-500 text-sm cursor-default outline-none"
              />
              <button onClick={copyUsername} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-orange-400 transition-colors">
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>
            <p className="text-xs text-stone-600">Username cannot be changed</p>
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Email (optional)"
              type="email"
              value={form.email}
              onChange={e => set("email", e.target.value)}
              placeholder="you@example.com"
              icon={Mail}
              hint="Used for password recovery notifications"
            />
          </div>
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-400 tracking-wider uppercase">Short Bio</label>
            <textarea
              value={form.bio}
              onChange={e => set("bio", e.target.value)}
              placeholder="Owner & Baker at VK Bakes…"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-stone-600 bg-stone-800 text-stone-100 text-sm resize-none outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Account info (read-only) */}
      <div className="bg-stone-800/50 rounded-2xl border border-stone-700/50 p-6">
        <p className="text-sm font-bold text-stone-200 mb-5">Account Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Role",        value: "Super Admin", icon: Shield   },
            { label: "Last Login",  value: "Today, 9:41 AM", icon: Activity },
            { label: "Member Since",value: "Jan 2025",    icon: Clock    },
          ].map(item => (
            <div key={item.label} className="bg-stone-900/50 rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <item.icon size={14} className="text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-stone-200">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton onClick={save} loading={loading} saved={saved} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB 2 — Security
// ─────────────────────────────────────────────────────────────
function SecurityTab() {
  const [pwd,  setPwd]  = useState({ current: "", next: "", confirm: "" });
  const [err,  setErr]  = useState({});
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [sessions] = useState([
    { device: "Chrome · Windows", location: "Lucknow, IN", time: "Now",          current: true  },
    { device: "Safari · iPhone",  location: "Lucknow, IN", time: "2 hrs ago",    current: false },
    { device: "Firefox · Mac",    location: "Delhi, IN",   time: "3 days ago",   current: false },
  ]);

  const set = (k, v) => { setPwd(p => ({ ...p, [k]: v })); setErr({}); setSaved(false); };

  const validate = () => {
    const e = {};
    if (!pwd.current)              e.current = "Enter your current password";
    if (pwd.next.length < 8)       e.next    = "Password must be at least 8 characters";
    if (pwd.next !== pwd.confirm)  e.confirm  = "Passwords do not match";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setLoading(true);
    // TODO: useAuthStore().changePassword(pwd.current, pwd.next)
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false); setSaved(true);
    setPwd({ current: "", next: "", confirm: "" });
    setTimeout(() => setSaved(false), 3000);
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
          <button className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5">
            <LogOut size={12} /> Sign out all
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
                  : <button className="text-xs text-stone-500 hover:text-red-400 transition-colors font-medium">Revoke</button>}
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

// ─────────────────────────────────────────────────────────────
// TAB 3 — Store Info
// ─────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────
// TAB 4 — Notifications
// ─────────────────────────────────────────────────────────────
function NotificationsTab() {
  const [settings, setSettings] = useState({
    newOrder:        true,
    orderConfirm:    true,
    newReview:       true,
    reviewApproved:  false,
    dailySummary:    true,
    lowStock:        false,
    sound:           true,
    browserNotif:    false,
  });
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);

  const toggle = k => { setSettings(p => ({ ...p, [k]: !p[k] })); setSaved(false); };

  const save = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const GROUPS = [
    {
      title: "📱 WhatsApp Alerts",
      sub:   "Sent to your WhatsApp number when these events happen",
      items: [
        { key: "newOrder",       label: "New Order Received",     sub: "Notify when a customer places an order"       },
        { key: "orderConfirm",   label: "Order Status Updates",   sub: "When you mark order as delivered/cancelled"   },
        { key: "newReview",      label: "New Review Submitted",   sub: "When a customer submits a review for approval" },
        { key: "reviewApproved", label: "Review Goes Live",       sub: "When you approve a review"                     },
      ],
    },
    {
      title: "📊 Reports",
      sub:   "Periodic summaries of your bakery performance",
      items: [
        { key: "dailySummary", label: "Daily Summary",  sub: "End-of-day order & revenue summary on WhatsApp" },
        { key: "lowStock",     label: "Low Stock Alert", sub: "When items are marked Sold Out for 24+ hours"   },
      ],
    },
    {
      title: "🔔 Browser Notifications",
      sub:   "In-browser alerts while admin panel is open",
      items: [
        { key: "sound",       label: "Sound Alerts",        sub: "Play a sound when new orders arrive"            },
        { key: "browserNotif",label: "Push Notifications",  sub: "Show browser notification for new orders"       },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {GROUPS.map(group => (
        <div key={group.title} className="bg-stone-800/50 rounded-2xl border border-stone-700/50 p-6">
          <p className="text-sm font-bold text-stone-200 mb-1">{group.title}</p>
          <p className="text-xs text-stone-500 mb-4">{group.sub}</p>
          <div>
            {group.items.map((item, i) => (
              <ToggleRow
                key={item.key}
                label={item.label}
                sub={item.sub}
                on={settings[item.key]}
                onToggle={() => toggle(item.key)}
                last={i === group.items.length - 1}
              />
            ))}
          </div>
        </div>
      ))}

      <Alert type="info">
        WhatsApp notifications use your store's WhatsApp number. Make sure it's set correctly in Store Info.
      </Alert>

      <div className="flex justify-end">
        <SaveButton onClick={save} loading={loading} saved={saved} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB 5 — Danger Zone
// ─────────────────────────────────────────────────────────────
function DangerTab({ onLogout }) {
  const [confirm, setConfirm] = useState("");
  const [modal,   setModal]   = useState(null); // "logout" | "clear" | "reset"
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

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

  const execute = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    if (modal === "logout" && onLogout) onLogout();
    setDone(true);
    setTimeout(() => { setDone(false); setModal(null); setConfirm(""); }, 1500);
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
              onClick={() => { setModal(action.key); setConfirm(""); }}
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

            <div className="flex gap-3">
              <button
                onClick={() => { setModal(null); setConfirm(""); }}
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

// ─────────────────────────────────────────────────────────────
// ROOT — AdminProfile
// ─────────────────────────────────────────────────────────────
export default function AdminProfile({ onLogout }) {
  const [tab, setTab] = useState("profile");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        button { cursor: pointer; border: none; background: none; padding: 0; }
        input, textarea, select { font-family: inherit; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 0.7s linear infinite; }
      `}</style>

      <div className="min-h-screen bg-stone-950 text-stone-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Page header ─────────────────────────────────── */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border-b border-stone-800">
          <div className="max-w-4xl mx-auto px-5 py-8">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center ring-2 ring-orange-500/30 flex-shrink-0">
                <span className="text-2xl font-black text-white">VK</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-white">
                    VK Admin
                  </h1>
                  <span className="text-xs font-semibold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full">
                    Super Admin
                  </span>
                </div>
                <p className="text-sm text-stone-500">@vkadmin · VK Bakes & Pizza House</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-5 py-6">
          <div className="flex gap-6 flex-col md:flex-row">

            {/* ── Sidebar tabs ──────────────────────────── */}
            <aside className="md:w-52 flex-shrink-0">
              <nav className="space-y-1 md:sticky md:top-6">
                {TABS.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                      ${tab === t.key
                        ? "bg-stone-800 text-stone-100 shadow-sm"
                        : "text-stone-500 hover:text-stone-300 hover:bg-stone-800/50"
                      }`}
                  >
                    <t.icon size={15} className={tab === t.key ? t.color : ""} />
                    {t.label}
                    {tab === t.key && <ChevronRight size={13} className="ml-auto text-stone-600" />}
                  </button>
                ))}

                {/* Quick logout */}
                <div className="pt-3 border-t border-stone-800 mt-3">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:text-red-400 hover:bg-red-400/5 transition-all"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </nav>
            </aside>

            {/* ── Tab content ───────────────────────────── */}
            <main className="flex-1 min-w-0">
              {tab === "profile"       && <ProfileTab />}
              {tab === "security"      && <SecurityTab />}
              {tab === "store"         && <StoreTab />}
              {tab === "notifications" && <NotificationsTab />}
              {tab === "danger"        && <DangerTab onLogout={onLogout} />}
            </main>

          </div>
        </div>
      </div>
    </>
  );
}