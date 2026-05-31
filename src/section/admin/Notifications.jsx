import { useState, useEffect } from "react";
import { useProfileStore } from "../../store";
import { SaveButton,Alert,ToggleRow } from "../../components/From";
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
  const [error,   setError]   = useState(null);

  const { profile, updateNotifications } = useProfileStore();
  const [settings, setSettings] = useState(profile?.notifications || {});

  useEffect(() => {
    if (profile?.notifications) setSettings(profile.notifications);
  }, [profile?.notifications]);

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const save = async () => {
    setLoading(true);
    setError(null);
    try {
      const success = await updateNotifications(settings);
      if (!success) throw new Error("Unable to save notification settings");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || "Could not save changes.");
    } finally {
      setLoading(false);
    }
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

      {error && (
        <Alert type="error">{error}</Alert>
      )}
      <div className="flex justify-end">
        <SaveButton onClick={save} loading={loading} saved={saved} />
      </div>
    </div>
  );
}
