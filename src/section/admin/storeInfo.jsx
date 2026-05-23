import { useState, useEffect } from "react";
import { Store, Globe, Clock, Phone, MapPin } from "lucide-react";
import { Input, Alert, SaveButton } from "../../components/From";
import { useStoreStore } from "../../store";

export function StoreTab() {
  const { store, fetchStore, updateStore: apiUpdateStore, loading: apiLoading } = useStoreStore();
  const [form, setForm] = useState({
    storeName:    "VK Bakes & Pizza House",
    tagline:      "Fresh · Local · Delivered",
    discription:  "Fresh-baked breads, artisan cakes, and hot pizzas — delivered right to your door.",
    whatsapp:     "919999999999",
    address:      "Your Locality, City — 000000",
    deliveryZone: "Within 5 km",
    deliveryFee:  "20",
    timings: {
      monFri:   { open: "08:00", close: "21:00" },
      saturday: { open: "08:00", close: "21:30" },
      sunday:   { open: "09:00", close: "20:00" },
    },
    closedDays: "",
  });
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch store data on component mount
  useEffect(() => {
    fetchStore().then((data) => {
      if (data) {
        setForm({
          storeName: data.storeName || form.storeName,
          tagline: data.tagline || form.tagline,
          discription: data.discription || form.discription,
          whatsapp: data.whatsapp || form.whatsapp,
          address: data.address || form.address,
          deliveryZone: data.deliveryZone || form.deliveryZone,
          deliveryFee: String(data.deliveryFee) || form.deliveryFee,
          timings: data.timings || form.timings,
          closedDays: data.closedDays || form.closedDays,
        });
      }
      setInitialLoading(false);
    });
  }, []);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setSaved(false); };
  const setTiming = (day, field, v) =>
    setForm(p => ({ ...p, timings: { ...p.timings, [day]: { ...p.timings[day], [field]: v } } }));

  const save = async () => {
    setLoading(true);
    const updateData = {
      storeName: form.storeName,
      tagline: form.tagline,
      discription: form.discription,
      whatsapp: form.whatsapp,
      address: form.address,
      deliveryZone: form.deliveryZone,
      deliveryFee: Number(form.deliveryFee),
      timings: form.timings,
      closedDays: form.closedDays,
    };
    const result = await apiUpdateStore(updateData);
    setLoading(false);
    if (result) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const DAYS = [
    { key: "monFri",   label: "Mon – Fri"  },
    { key: "saturday", label: "Saturday"   },
    { key: "sunday",   label: "Sunday"     },
  ];

  if (initialLoading) {
    return <div className="text-center py-8 text-stone-400">Loading store information...</div>;
  }

  return (
    <div className="space-y-5">

      {/* Basic info */}
      <div className="bg-stone-800/50 rounded-2xl border border-stone-700/50 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Store size={16} className="text-emerald-400" />
          <p className="text-sm font-bold text-stone-200">Bakery Details</p>
        </div>
        <div className="space-y-4">
          <Input label="Store Name"  value={form.storeName}    onChange={e => set("storeName", e.target.value)}   placeholder="VK Bakes & Pizza House" icon={Store} />
          <Input label="Tagline"     value={form.tagline}      onChange={e => set("tagline", e.target.value)}     placeholder="Fresh · Local · Delivered" />
          <Input label="Discription"     value={form.discription}      onChange={e => set("discription", e.target.value)}     placeholder= "Discription" />
          <Input
            label="WhatsApp Number (with country code)"
            value={form.whatsapp}
            onChange={e => set("whatsapp", e.target.value)}
            placeholder="919999999999"
            icon={Phone}
            hint="Orders will be sent to this number via wa.me link"
          />
          <Input
            label="Store Address"
            value={form.address}
            onChange={e => set("address", e.target.value)}
            placeholder="Street, Locality, City — Pincode"
            icon={MapPin}
          />
        </div>
      </div>

      {/* Delivery settings */}
      <div className="bg-stone-800/50 rounded-2xl border border-stone-700/50 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe size={16} className="text-emerald-400" />
          <p className="text-sm font-bold text-stone-200">Delivery Settings</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Delivery Zone"       value={form.deliveryZone}  onChange={e => set("deliveryZone", e.target.value)} placeholder="e.g. Within 5 km" />
          <Input label="Delivery Fee (₹)"    value={form.deliveryFee}   onChange={e => set("deliveryFee", e.target.value)}  placeholder="20" type="number" />
        </div>
        <div className="mt-4">
          <Alert type="info">
            Delivery rules: Pizza, Bakes & Cakes → Home delivery. Ice Cream → Only with Pizza/Bake/Cake. Bread, Toast & Biscuits → Store pickup only.
          </Alert>
        </div>
      </div>

      {/* Store timings */}
      <div className="bg-stone-800/50 rounded-2xl border border-stone-700/50 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Clock size={16} className="text-emerald-400" />
          <p className="text-sm font-bold text-stone-200">Store Timings</p>
        </div>
        <div className="space-y-3">
          {DAYS.map(day => (
            <div key={day.key} className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold text-stone-400 w-20">{day.label}</span>
              <div className="flex items-center gap-2 flex-1 min-w-fit">
                <input
                  type="time"
                  value={form.timings[day.key].open}
                  onChange={e => setTiming(day.key, "open", e.target.value)}
                  className="px-3 py-2 rounded-lg border border-stone-600 bg-stone-800 text-stone-100 text-sm outline-none focus:border-orange-500 transition-all"
                />
                <span className="text-stone-600 text-xs">to</span>
                <input
                  type="time"
                  value={form.timings[day.key].close}
                  onChange={e => setTiming(day.key, "close", e.target.value)}
                  className="px-3 py-2 rounded-lg border border-stone-600 bg-stone-800 text-stone-100 text-sm outline-none focus:border-orange-500 transition-all"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Input
            label="Closed Days / Holidays"
            value={form.closedDays}
            onChange={e => set("closedDays", e.target.value)}
            placeholder="e.g. Holi, Diwali"
            hint="Comma-separated. Store will show as closed on these days."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton onClick={save} loading={loading || apiLoading} saved={saved} />
      </div>
    </div>
  );
}