// src/admin/ManageItemDetail.jsx
// ─────────────────────────────────────────────────────────────
// Admin detail + edit page for a single menu item.
//
// Flow:
//   1. Pick a category   → fetches items from backend
//   2. Pick an item      → loads full form
//   3. Edit ALL fields   → save back to backend via useMenuStore
//
// Form covers every field that PizzaDetail page displays:
//   Basic  : name, category, price, description, tag, sortOrder
//   Media  : imageUrl (Cloudinary upload)
//   Status : available, deliverable
//   Detail : prepTime, isVeg, calories, serves   ← ADD these to your schema
//   Pizza  : sizes[] (label/price/tag), extras[] (label/price)
//   Info   : ingredients[]
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import {
  Save, Trash2, Eye, EyeOff, ToggleLeft, ToggleRight, Star,
  Camera, Plus, X, AlertTriangle, CheckCircle, RefreshCw,
  ChevronRight, IndianRupee, Search, Leaf, ArrowLeft, MenuSquare ,
} from "lucide-react";
import { toast } from "sonner";
import useMenuStore from "../../store/menuStore";

// ── Design tokens ─────────────────────────────────────────────
const C = {
  bg: "#FFF8F0",
  dark: "#1A0A00",
  mid: "#2D1400",
  red: "#D44B1A",
  gold: "#F5A623",
  muted: "#8B6A4F",
  border: "#E8D5C0",
  f1: "'Playfair Display', serif",
  f2: "'DM Sans', sans-serif",
};

const CATS = [
  { key: "pizza", label: "Pizza", emoji: "🍕" },
  { key: "cake", label: "Cake", emoji: "🎂" },
  { key: "bake", label: "Bakes", emoji: "🥐" },
  { key: "bread", label: "Bread", emoji: "🍞" },
  { key: "toast", label: "Toast", emoji: "🥖" },
  { key: "biscuit", label: "Biscuits", emoji: "🍪" },
  { key: "ice", label: "Ice Cream", emoji: "🍦" },
  { key: "drink", label: "Drinks", emoji: "🥤" },
];
const EMOJI = Object.fromEntries(CATS.map(c => [c.key, c.emoji]));

// ── Blank form — covers every field PizzaDetail needs ─────────
const BLANK_FORM = {
  name: "",
  category: "pizza",
  price: "",
  description: "",
  tag: "",
  sortOrder: 0,
  imageUrl: "",
  available: true,
  deliverable: true,
  // ── Fields PizzaDetail shows — add these to your Mongoose schema ──
  prepTime: "",          // e.g. "20–25 min"
  isVeg: true,
  calories: "",          // e.g. "~620 kcal"
  serves: "",          // e.g. "1–2"
  // Pizza-specific arrays
  sizes: [],          // [{ label, price, tag }]
  extras: [],          // [{ label, price }]
  ingredients: [],          // ["Hand-tossed dough", ...]
};

// ── Small shared components ───────────────────────────────────
const inp = "w-full px-3 py-2.5 rounded-xl border border-[#E8D5C0] bg-white text-sm text-[#1A0A00] outline-none focus:border-[#D44B1A] focus:ring-1 focus:ring-[#D44B1A]/20 transition-all font-sans";

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[11px] font-bold text-[#8B6A4F] uppercase tracking-wider">{label}</label>}
      {children}
      {hint && <p className="text-[11px] text-[#BBA890]">{hint}</p>}
    </div>
  );
}

function Card({ title, sub, accent, children }) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${accent ? "border-red-200" : "border-[#E8D5C0]"}`}>
      {title && (
        <div className={`px-5 py-3 border-b ${accent ? "border-red-200 bg-red-50" : "border-[#E8D5C0] bg-[#FDFAF7]"}`}>
          <p className="text-sm font-bold text-[#1A0A00]">{title}</p>
          {sub && <p className="text-xs text-[#8B6A4F] mt-0.5">{sub}</p>}
        </div>
      )}
      <div className="bg-white">{children}</div>
    </div>
  );
}

function Stars({ n }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12}
          fill={i <= Math.round(n) ? C.gold : "none"}
          color={i <= Math.round(n) ? C.gold : "#D0C0B0"}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LEFT PANEL — category tabs + item list
// ─────────────────────────────────────────────────────────────
function ItemSelector({ items, loading, activeId, activeCat, onCatChange, onSelect }) {
  const [search, setSearch] = useState("");


  const filtered = items.filter(i =>
    i.category === activeCat &&
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
  return (
    <div className="flex flex-col h-full bg-white border-r border-[#E8D5C0]" style={{ width: 240, flexShrink: 0 }}>
      {/* Header */}


      <div className="px-4 py-3 border-b border-[#E8D5C0]">
        <p className="font-bold text-sm text-[#1A0A00]" style={{ fontFamily: C.f1 }}>Menu Items</p>
        <p className="text-[11px] text-[#8B6A4F] mt-0.5">
          {items.filter(i => i.available).length} available
        </p>

      </div>

      {/* Category tabs */}
      <div className="flex gap-1 p-2 overflow-x-auto border-b border-[#E8D5C0]" style={{ scrollbarWidth: "none" }}>
        {CATS.map(c => (
          <button
            key={c.key}
            onClick={() => onCatChange(c.key)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${activeCat === c.key
                ? "bg-[#D44B1A] text-white border-[#D44B1A]"
                : "bg-white text-[#8B6A4F] border-[#E8D5C0] hover:bg-[#FFF8F0]"
              }`}
          >
            {c.emoji}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="p-2 border-b border-[#E8D5C0]">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B6A4F]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className={`${inp} pl-7 py-1.5 text-xs`}
          />
        </div>
      </div>

      {/* Item list */}
      <div className="flex-1 overflow-y-auto py-1">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-[#8B6A4F]">
            <RefreshCw size={14} className="animate-spin" />
            <span className="text-xs">Loading…</span>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-xs text-[#8B6A4F] py-8">No items found</p>
        ) : (
          filtered.map(item => (
            <button
              key={item._id}
              onClick={() => onSelect(item)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all border-l-2 ${activeId === item._id
                  ? "border-[#D44B1A] bg-[#FFF0E6]"
                  : "border-transparent hover:bg-[#FFF8F0]"
                }`}
            >
              <span className="text-xl shrink-0">{EMOJI[item.category] || "🍽️"}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${activeId === item._id ? "text-[#D44B1A]" : "text-[#1A0A00]"}`}>
                  {item.name}
                </p>
                <p className="text-[10px] text-[#8B6A4F]">₹{item.price}</p>
              </div>
              {!item.available && (
                <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full shrink-0">
                  Out
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ARRAY FIELD EDITORS
// ─────────────────────────────────────────────────────────────

// Ingredients — simple string array
function IngredientsEditor({ value, onChange }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    if (!draft.trim()) return;
    onChange([...value, draft.trim()]);
    setDraft("");
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="e.g. Mozzarella cheese"
          className={`${inp} flex-1`}
        />
        <button
          onClick={add}
          className="px-3 py-2 bg-[#D44B1A] text-white rounded-xl text-xs font-bold hover:bg-[#b83d13] transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((ing, i) => (
            <span key={i} className="flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {ing}
              <button onClick={() => onChange(value.filter((_, j) => j !== i))} className="hover:text-red-600">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Sizes — [{ label, price, tag }]
function SizesEditor({ value, onChange }) {
  const blank = { label: "", price: "", tag: "" };
  const update = (i, k, v) => onChange(value.map((s, j) => j === i ? { ...s, [k]: v } : s));
  return (
    <div className="flex flex-col gap-2">
      {value.map((s, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input value={s.label} onChange={e => update(i, "label", e.target.value)}
            placeholder='e.g. Medium (9")' className={`${inp} flex-[2] text-[10px]`} />
          <div className="relative flex-1">
            <IndianRupee size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B6A4F]" />
            <input type="number" value={s.price} onChange={e => update(i, "price", e.target.value)}
              placeholder="279" className={`${inp} pl-6`} />
          </div>
          <input value={s.tag} onChange={e => update(i, "tag", e.target.value)}
            placeholder="Popular ✨" className={`${inp} flex-1`} />
          <button onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="w-5 h-5 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-100 shrink-0">
            <X size={12} />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...value, { ...blank }])}
        className="flex items-center gap-1.5 text-xs font-bold text-[#D44B1A] hover:text-[#b83d13] transition-colors"
      >
        <Plus size={12} /> Add size option
      </button>
    </div>
  );
}

// Extras — [{ label, price }]
function ExtrasEditor({ value, onChange }) {
  const update = (i, k, v) => onChange(value.map((e, j) => j === i ? { ...e, [k]: v } : e));
  return (
    <div className="flex flex-col gap-2">
      {value.map((e, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input value={e.label} onChange={ev => update(i, "label", ev.target.value)}
            placeholder="e.g. Extra Cheese" className={`${inp} flex-[2]`} />
          <div className="relative flex-1">
            <IndianRupee size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B6A4F]" />
            <input type="number" value={e.price} onChange={ev => update(i, "price", ev.target.value)}
              placeholder="30 (0 = Free)" className={`${inp} pl-6`} />
          </div>
          <button onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-100 shrink-0">
            <X size={12} />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...value, { label: "", price: 0 }])}
        className="flex items-center gap-1.5 text-xs font-bold text-[#D44B1A] hover:text-[#b83d13] transition-colors"
      >
        <Plus size={12} /> Add extra option
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function ManageItemDetail() {
  const {
    items, loading, error,
    fetchMenu, updateItem, deleteItem,
  } = useMenuStore();

  const [activeCat, setActiveCat] = useState("pizza");
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [imgPreview, setImgPreview] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const fileRef = useRef();

  // ── Initial fetch ─────────────────────────────────────────
  useEffect(() => {
    fetchMenu({ includeUnavailable: true });
  }, [fetchMenu]);

  // ── When category changes fetch that category ─────────────
  useEffect(() => {
    fetchMenu({ category: activeCat, includeUnavailable: true });
    setSelectedItem(null);
    setForm(null);
  }, [activeCat]);

  // ── Load item into form ───────────────────────────────────
  const loadItem = (item) => {
    setSelectedItem(item);
    setSaved(false);
    // Merge item data with BLANK_FORM so missing fields get defaults
    setForm({ ...BLANK_FORM, ...item });
    setImgPreview(item.imageUrl || item.image || "");
  };

  // ── Form field updater ────────────────────────────────────
  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setSaved(false); };

  // ── Image upload ──────────────────────────────────────────
  const handleImg = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImgPreview(reader.result);
      set("imageUrl", reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form?.name || !form?.price) {
      toast.error("Name and price are required");
      return;
    }
    setSaving(true);
    const result = await updateItem(selectedItem._id, {
      ...form,
      price: Number(form.price),
    });
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async () => {
    const result = await deleteItem(selectedItem._id);
    if (result.success) {
      setDeleteModal(false);
      setDeleteConfirm("");
      setSelectedItem(null);
      setForm(null);
    }
  };

  const catItems = items.filter(i => i.category === activeCat);

  // ─────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: C.bg, fontFamily: C.f2 }}>

      {/* ── Left: item selector ──────────────────────────── */}
      <aside className="hidden md:block w-60 shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-[#E8D5C0]">
        <ItemSelector
          items={catItems}
          loading={loading}
          activeId={selectedItem?._id}
          activeCat={activeCat}
          onCatChange={setActiveCat}
          onSelect={loadItem}
          setIsOpen={setIsOpen}
        />
      </aside>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}
      <aside className={`fixed top-0 bottom-0 left-0 w-60 z-50 md:hidden bg-[#1A0A00] transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-[#8B6A4F] hover:text-white p-1 rounded-lg z-10"
        >
          <X size={18} />
        </button>
        <ItemSelector
          items={catItems}
          loading={loading}
          activeId={selectedItem?._id}
          activeCat={activeCat}
          onCatChange={setActiveCat}
          onSelect={loadItem}
          setIsOpen={setIsOpen}
        />
      </aside>
     
      {/* ── Right: form ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
         <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed -mt-6 md:hidden p-1.5 -ml-6 rounded-lg text-[#2D1400] hover:bg-gray-100 transition-colors"
        >
          <MenuSquare   size={20} />
        </button>
        {/* No item selected */}
        {!form ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[#8B6A4F]">
            <div className="text-6xl">🍽️</div>
            <p className="text-sm font-semibold">Select an item from the left to edit it</p>
            <p className="text-xs text-[#BBA890]">
              Showing {catItems.length} items in {CATS.find(c => c.key === activeCat)?.label}
            </p>
          </div>
        ) : (
          <>
            {/* Sticky topbar */}
            <div className="flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur border-b border-[#E8D5C0] shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-[#8B6A4F]">
                  {CATS.find(c => c.key === activeCat)?.emoji} {CATS.find(c => c.key === activeCat)?.label}
                </span>
                <ChevronRight size={12} className="text-[#E8D5C0]" />
                {/* <span className="text-sm font-bold text-[#1A0A00] truncate max-w-[200px]">{form.name}</span> */}

                {/* Quick availability pill */}
                <button
                  onClick={() => set("available", !form.available)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${form.available
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-500"
                    }`}
                >
                  {form.available ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                  {form.available ? "In Stock" : "Sold Out"}
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* <button
                  onClick={() => setDeleteModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button> */}
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all ${saved ? "bg-green-600" : "bg-[#D44B1A] hover:bg-[#b83d13]"
                    }`}
                >
                  {saving ? <RefreshCw size={12} className="animate-spin" /> : saved ? <CheckCircle size={12} /> : <Save size={12} />}
                  {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Scrollable form body */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-1 py-6 flex flex-col gap-5">

                {/* ── Hero row: image + name + quick stats ── */}
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#E8D5C0]">
                  {/* Image */}
                  <div className="relative shrink-0 cursor-pointer" onClick={() => fileRef.current?.click()}>
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#FFF0E6] border-2 border-dashed border-[#E8D5C0] flex items-center justify-center">
                      {imgPreview
                        ? <img src={imgPreview} alt="" className="w-full h-full object-cover" />
                        : <span className="text-4xl">{EMOJI[form.category] || "🍽️"}</span>}
                    </div>
                    <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-[#D44B1A] rounded-lg flex items-center justify-center">
                      <Camera size={11} className="text-white" />
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImg} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg text-[#1A0A00] truncate" style={{ fontFamily: C.f1 }}>{form.name || "Untitled"}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-[#8B6A4F]">{EMOJI[form.category]} {form.category}</span>
                      <span className="text-[#E8D5C0]">·</span>
                      <span className="text-base font-black text-[#D44B1A]">₹{form.price || 0}</span>
                      {form.isVeg && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <Leaf size={9} /> VEG
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── 1. Basic Information ─────────────────── */}
                <Card title="Basic Information" sub="Shown on menu cards">
                  <div className="p-5 grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Field label="Item Name *">
                        <input className={inp} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Paneer Tikka Pizza" />
                      </Field>
                    </div>
                    <Field label="Category *">
                      <select className={inp} value={form.category} onChange={e => set("category", e.target.value)}>
                        {CATS.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
                      </select>
                    </Field>
                    <Field label="Price (₹) *">
                      <div className="relative">
                        <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6A4F]" />
                        <input type="number" className={`${inp} pl-7`} value={form.price} onChange={e => set("price", e.target.value)} min="1" />
                      </div>
                    </Field>
                    <div className="col-span-2">
                      <Field label="Description" hint="Shown on menu cards and detail page">
                        <textarea className={`${inp} resize-none`} rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe the item…" />
                      </Field>
                    </div>
                    <Field label='Tag / Badge' hint='"Bestseller", "🌶️ Spicy", "New"'>
                      <input className={inp} value={form.tag} onChange={e => set("tag", e.target.value)} placeholder="Bestseller" />
                    </Field>
                    <Field label="Sort Order" hint="Lower number = appears first">
                      <input type="number" className={inp} value={form.sortOrder} onChange={e => set("sortOrder", +e.target.value)} min="0" />
                    </Field>
                  </div>
                </Card>

                {/* ── 2. Image ─────────────────────────────── */}
                <Card title="Item Photo" sub="Shown on cards and detail page">
                  <div className="p-5">
                    <Field label="Image URL" hint="Paste a Cloudinary URL, or upload above">
                      <input className={inp} value={form.imageUrl || ""} onChange={e => { set("imageUrl", e.target.value); setImgPreview(e.target.value); }} placeholder="https://res.cloudinary.com/…" />
                    </Field>
                  </div>
                </Card>

                {/* ── 3. Detail Page Info (PizzaDetail fields) ─ */}
                <Card title="Detail Page Info" sub="Shown on the public item detail page — add these fields to your Mongoose schema">
                  <div className="p-5 grid grid-cols-2 gap-4">
                    <Field label="Prep Time" hint='e.g. "20–25 min"'>
                      <input className={inp} value={form.prepTime} onChange={e => set("prepTime", e.target.value)} placeholder="20–25 min" />
                    </Field>
                    <Field label="Serves" hint='e.g. "1–2"'>
                      <input className={inp} value={form.serves} onChange={e => set("serves", e.target.value)} placeholder="1–2" />
                    </Field>
                    <Field label="Calories" hint='e.g. "~620 kcal"'>
                      <input className={inp} value={form.calories} onChange={e => set("calories", e.target.value)} placeholder="~620 kcal" />
                    </Field>

                    {/* Veg toggle */}
                    <Field label="Food Type">
                      <button
                        onClick={() => set("isVeg", !form.isVeg)}
                        className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl border-2 transition-all ${form.isVeg ? "border-green-300 bg-green-50" : "border-[#E8D5C0] bg-white"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Leaf size={14} className={form.isVeg ? "text-green-600" : "text-[#8B6A4F]"} />
                          <span className={`text-sm font-bold ${form.isVeg ? "text-green-700" : "text-[#8B6A4F]"}`}>
                            {form.isVeg ? "Pure Veg" : "Non-Veg"}
                          </span>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${form.isVeg ? "bg-green-500" : "bg-[#E8D5C0]"}`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isVeg ? "translate-x-5" : "translate-x-0.5"}`} />
                        </div>
                      </button>
                    </Field>

                    {/* Ingredients */}
                    <div className="col-span-2">
                      <Field label="Ingredients" hint="Press Enter or click + to add">
                        <IngredientsEditor
                          value={form.ingredients}
                          onChange={v => set("ingredients", v)}
                        />
                      </Field>
                    </div>
                  </div>
                </Card>

                {/* ── 4. Sizes (pizza / cake) ───────────────── */}
                {(form.category === "pizza" || form.category === "cake") && (
                  <Card title="Size Options" sub="Shown as size picker on detail page — leave empty to hide">
                    <div className="p-5">
                      <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 mb-2">
                        <span className="text-[10px] font-bold text-[#8B6A4F] uppercase">Size Label</span>
                        <span className="text-[10px] font-bold text-[#8B6A4F] uppercase">Price (₹)</span>
                        <span className="text-[10px] font-bold text-[#8B6A4F] uppercase">Tag</span>
                        <span />
                      </div>
                      <SizesEditor value={form.sizes} onChange={v => set("sizes", v)} />
                    </div>
                  </Card>
                )}

                {/* ── 5. Extras ────────────────────────────── */}
                <Card title="Extras / Add-ons" sub="Optional add-ons shown on detail page (e.g. Extra Cheese, Stuffed Crust)">
                  <div className="p-5">
                    <div className="grid grid-cols-[2fr_1fr_auto] gap-2 mb-2">
                      <span className="text-[10px] font-bold text-[#8B6A4F] uppercase">Extra Name</span>
                      <span className="text-[10px] font-bold text-[#8B6A4F] uppercase">Price (₹ / 0=Free)</span>
                      <span />
                    </div>
                    <ExtrasEditor value={form.extras} onChange={v => set("extras", v)} />
                  </div>
                </Card>

                {/* ── 6. Availability + Delivery ───────────── */}
                <div className="grid grid-cols-2 gap-5">
                  {/* Availability */}
                  <Card title="Availability">
                    <div className="p-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-[#1A0A00]">In Stock</p>
                         
                        </div>
                        <button onClick={() => set("available", !form.available)}>
                          {form.available
                            ? <ToggleRight size={30} className="text-green-500" />
                            : <ToggleLeft size={30} className="text-[#E8D5C0]" />}
                        </button>
                      </div>
                      <div className={`text-xs font-semibold px-3 py-2 rounded-xl border ${form.available
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-red-50 border-red-200 text-red-600"
                        }`}>
                        {form.available ? "✅ Visible to customers" : "⚠️ Hidden from menu"}
                      </div>
                    </div>
                  </Card>

                  {/* Delivery rule */}
                  <Card title="Delivery Rule">
                    <div className="p-5 flex flex-col gap-2">
                      {[
                        { v: true, label: "🚚 Always deliverable", sub: "Pizza, Bakes, Cakes" },
                        { v: "cond", label: "🍦 Only with Pizza/Cake", sub: "Ice Cream" },
                        { v: false, label: "🏪 Store pickup only", sub: "Bread, Toast, Biscuits" },
                      ].map(opt => {
                        const sel = form.deliverable === opt.v;
                        return (
                          <button
                            key={String(opt.v)}
                            onClick={() => set("deliverable", opt.v)}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border-2 text-left transition-all ${sel ? "border-[#D44B1A] bg-[#FFF0E6]" : "border-[#E8D5C0] bg-white hover:bg-[#FFF8F0]"
                              }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${sel ? "border-[#D44B1A] bg-[#D44B1A]" : "border-[#C4A882]"}`}>
                              {sel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div>
                              <p className={`text-xs font-bold ${sel ? "text-[#D44B1A]" : "text-[#1A0A00]"}`}>{opt.label}</p>
                              <p className="text-[10px] text-[#8B6A4F]">{opt.sub}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                </div>

                {/* ── 7. Danger zone ───────────────────────── */}
                <div className="rounded-2xl border border-red-200 overflow-hidden">
                  <div className="px-5 py-3 border-b border-red-200 bg-red-50">
                    <p className="text-sm font-bold text-red-700 flex items-center gap-1.5">
                      <AlertTriangle size={13} /> Danger Zone
                    </p>
                  </div>
                  <div className="p-5 bg-white flex items-center justify-between gap-4">
                    
                    <button
                      onClick={() => setDeleteModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors shrink-0"
                    >
                      <Trash2 size={12} /> Delete Item
                    </button>
                  </div>
                </div>

       
                
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Delete confirmation modal ─────────────────────── */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-2xl border border-[#E8D5C0] p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
              <Trash2 size={22} className="text-red-600" />
            </div>
            <p className="font-bold text-base text-[#1A0A00] mb-2">Delete "{form?.name}"?</p>
            <p className="text-xs text-[#8B6A4F] leading-relaxed mb-4">
              This permanently removes the item. Type <code className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-mono">delete item</code> to confirm.
            </p>
            <input
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="delete item"
              className={`${inp} font-mono mb-4`}
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setDeleteModal(false); setDeleteConfirm(""); }}
                className="flex-1 py-2.5 rounded-xl border border-[#E8D5C0] text-sm font-bold text-[#8B6A4F] hover:bg-[#FFF0E6] transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deleteConfirm !== "delete item"}
                onClick={handleDelete}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${deleteConfirm === "delete item" ? "bg-red-600 hover:bg-red-700" : "bg-red-200 cursor-not-allowed"
                  }`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}