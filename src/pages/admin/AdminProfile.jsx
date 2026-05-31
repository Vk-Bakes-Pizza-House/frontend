import { useState, useRef, useEffect } from "react";
import {
  User, Lock, Store, Bell, AlertTriangle, Eye, EyeOff,
  Check, Camera, Phone, MapPin, Clock, Save, LogOut,
  Shield, ToggleLeft, ToggleRight, Edit3, Copy,
  CheckCircle, X, Trash2, RefreshCw, Smartphone,
  ChevronRight, Activity, Key, Globe, Volume2, Mail,
} from "lucide-react";

// import { StoreTab } from "./ManageStore";
import  ProfileTab  from "../../section/admin/ProfileTab";
import SecurityTab from "../../section/admin/SecurityTab";
import  NotificationsTab  from "../../section/admin/Notifications";
import  DangerTab  from "../../section/admin/DangerZone";

import { Input,SaveButton,Alert,ToggleRow,StrengthMeter,PasswordInput } from "../../components/From";
import { useProfileStore } from "../../store";

// ── Tabs config ───────────────────────────────────────────────
const TABS = [
  { key: "profile",       label: "Profile",       icon: User,          color: "text-orange-400"  },
  { key: "security",      label: "Security",      icon: Shield,        color: "text-blue-400"    },
  // { key: "store",         label: "Store Info",    icon: Store,         color: "text-emerald-400" },
  { key: "notifications", label: "Notifications", icon: Bell,          color: "text-yellow-400"  },
  { key: "danger",        label: "Danger Zone",   icon: AlertTriangle, color: "text-red-400"     },
];




// ─────────────────────────────────────────────────────────────
// ROOT — AdminProfile
// ─────────────────────────────────────────────────────────────
export default function AdminProfile({ onLogout }) {
  const [tab, setTab] = useState("profile");
  const { profile, fetchProfile } = useProfileStore();

  useEffect(() => {
    if (!profile) fetchProfile();
  }, [profile, fetchProfile]);

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