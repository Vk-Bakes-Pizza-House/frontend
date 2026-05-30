import { useState, useRef, useEffect } from "react";
import {
  User, Lock, Store, Bell, AlertTriangle, Eye, EyeOff,
  Check, Camera, Phone, MapPin, Clock, Save, LogOut,
  Shield, ToggleLeft, ToggleRight, Edit3, Copy,
  CheckCircle, X, Trash2, RefreshCw, Smartphone,
  ChevronRight, Activity, Key, Globe, Volume2, Mail,
} from "lucide-react";
import { useProfileStore } from "../../store";
import { Input,SaveButton,Alert,ToggleRow,StrengthMeter,PasswordInput } from "../../components/From";///////////
// // Within Notifications tab configuration layout:
// const { profile, updateNotifications } = useProfileStore();
// const [settings, setSettings] = useState(profile?.notifications || {});

// const toggle = async (key) => {
//   const updated = { ...settings, [key]: !settings[key] };
//   setSettings(updated);
//   await updateNotifications(updated);
// };

export default function NotificationsTab() {
//   const [settings, setSettings] = useState({
//     newOrder:        true,
//     orderConfirm:    true,
//     newReview:       true,
//     reviewApproved:  false,
//     dailySummary:    true,
//     lowStock:        false,
//     sound:           true,
//     browserNotif:    false,
//   });
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);

// Within Notifications tab configuration layout:
const { profile, updateNotifications } = useProfileStore();
const [settings, setSettings] = useState(profile?.notifications || {});

const toggle = async (key) => {
  const updated = { ...settings, [key]: !settings[key] };
  setSettings(updated);
  await updateNotifications(updated);
};

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
