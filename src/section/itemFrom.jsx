import React, { useState, useEffect } from "react";
import { X, Check, Image as ImageIcon, Trash2 } from "lucide-react";
import ImageUploader from "../components/uploadToCloudinary";

const CATS  = ["all","pizza","bake","bread","toast","biscuit","cake","ice"];
const EMOJI = { pizza:"🍕", bread:"🍞", toast:"🥖", biscuit:"🍪", cake:"🎂", ice:"🍦", bake:"🥐" };
const PIZZA_SIZES = ["Regular", "Medium", "Large"];
const CAKE_SIZES  = ["0.5 kg", "1 kg", "1.5 kg", "2 kg"];
const CAKE_FLAVORS = ["Chocolate", "Vanilla", "Butterscotch", "Strawberry", "Black Forest", "Pineapple", "Red Velvet"];
const ICE_FLAVORS  = ["Chocolate", "Vanilla", "Strawberry", "Mango", "Butterscotch", "Mixed Fruit"];

const BLANK = { name:"", category:"pizza", price:"", description:"", deliverable:true, tag:"", available:true, size:"", flavor:"" };

const inpClasses = "w-full px-3 py-2 border border-gray-200 rounded-lg font-sans text-sm text-gray-800 bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors";

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-sans font-semibold text-gray-700 text-xs tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function ItemForm({ initial = BLANK, onSave, onCancel, saving = false }) {
  const [f, setF] = useState(() => ({
    ...BLANK,
    ...initial,
    image: initial.imageUrl || initial.image || "",
    imagePreview: initial.imageUrl || initial.image || "",
  }));

  useEffect(() => {
    setF({
      ...BLANK,
      ...initial,
      image: initial.imageUrl || initial.image || "",
      imagePreview: initial.imageUrl || initial.image || "",
    });
  }, [initial]);

  const setField = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const cat = f.category;

  // Category groups
  const isPizza  = cat === "pizza";
  const isCake   = cat === "cake";
  const isIce    = cat === "ice";
  const isSimple = ["bread", "toast", "biscuit"].includes(cat); // no size/flavor

  const valid = f.name?.trim() && f.price && Number(f.price) > 0;

  const handleImageUpload = (url) => {
    setField("image", url);
    setField("imagePreview", url);
  };

  // Reset size/flavor when category changes
  const handleCategoryChange = (val) => {
    setF(p => ({ ...p, category: val, size: "", flavor: "", tag: "" }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="font-sans font-bold text-gray-800 text-lg">
            {(initial._id || initial.id) ? "Edit Menu Item" : "Add New Item"}
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">

          {/* Image */}
          <Field label="Item Image">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 relative">
                {f.imagePreview ? (
                  <>
                    <img src={f.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { setField("image", ""); setField("imagePreview", ""); }}
                      className="absolute top-1 right-1 rounded-full bg-white/80 p-1 text-gray-600 hover:text-gray-900"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <ImageIcon className="text-gray-300" size={32} />
                )}
              </div>
              <ImageUploader currentImage={f.imagePreview} onUpload={handleImageUpload} />
            </div>
          </Field>

          {/* Name */}
          <Field label="Item Name *">
            <input
              className={inpClasses}
              value={f.name}
              onChange={e => setField("name", e.target.value)}
              placeholder="e.g. Farmhouse Pizza"
            />
          </Field>

          {/* Category + Price */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category *">
              <select className={inpClasses} value={cat} onChange={e => handleCategoryChange(e.target.value)}>
                {CATS.filter(c => c !== "all").map(c => (
                  <option key={c} value={c}>
                    {EMOJI[c]} {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Price (₹) *">
              <input
                className={inpClasses}
                type="number" min="0"
                value={f.price}
                onChange={e => setField("price", e.target.value)}
                placeholder="e.g. 199"
              />
            </Field>
          </div>

          {/* Description */}
          <Field label="Description">
            <input
              className={inpClasses}
              value={f.description}
              onChange={e => setField("description", e.target.value)}
              placeholder="Short item description"
            />
          </Field>

          {/* Pizza — Size */}
          {isPizza && (
            <Field label="Pizza Size *">
              <div className="flex gap-4">
                {PIZZA_SIZES.map(size => (
                  <label key={size} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio" name="pizzaSize" value={size}
                      checked={f.size === size}
                      onChange={e => setField("size", e.target.value)}
                      className="w-4 h-4 text-red-500"
                    />
                    <span className="text-sm text-gray-700">{size}</span>
                  </label>
                ))}
              </div>
            </Field>
          )}

          {/* Cake — Size + Flavor */}
          {isCake && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Cake Size">
                <select className={inpClasses} value={f.size} onChange={e => setField("size", e.target.value)}>
                  <option value="">Select size</option>
                  {CAKE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Flavor">
                <select className={inpClasses} value={f.flavor} onChange={e => setField("flavor", e.target.value)}>
                  <option value="">Select flavor</option>
                  {CAKE_FLAVORS.map(fl => <option key={fl} value={fl}>{fl}</option>)}
                </select>
              </Field>
            </div>
          )}

          {/* Ice Cream — Flavor (replaces tag) */}
          {isIce && (
            <Field label="Ice Cream Flavor">
              <select className={inpClasses} value={f.flavor} onChange={e => setField("flavor", e.target.value)}>
                <option value="">Select flavor</option>
                {ICE_FLAVORS.map(fl => <option key={fl} value={fl}>{fl}</option>)}
              </select>
            </Field>
          )}

          {/* Tag — hidden for ice cream, toast, bread, biscuit */}
          {!isIce && !isSimple && (
            <Field label="Tag (optional)">
              <input
                className={inpClasses}
                value={f.tag}
                onChange={e => setField("tag", e.target.value)}
                placeholder='e.g. "Bestseller" or "🌶️ Spicy"'
              />
            </Field>
          )}

          {/* Delivery Rule */}
          <Field label="Delivery Rule">
            <select
              className={inpClasses}
              value={String(f.deliverable)}
              onChange={e => {
                const v = e.target.value;
                setField("deliverable", v === "true" ? true : v === "false" ? false : "cond");
              }}
            >
              <option value="true">🚚 Always deliverable</option>
              <option value="cond">🍕 Only with Pizza/Cake/Bake</option>
              <option value="false">🏪 Store pickup only</option>
            </select>
          </Field>

          {/* Actions */}
          <div className="flex gap-2.5 justify-end pt-4 border-t border-gray-100">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-200 rounded-lg font-sans text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
           onClick={() => {
  if (!valid || saving) return;
  const cleaned = { ...f };
  // Empty strings ko undefined karo — Mongoose ignore karega
  if (!cleaned.size) delete cleaned.size;
  if (!cleaned.flavor) delete cleaned.flavor;
  if (!cleaned.tag) delete cleaned.tag;
  onSave(cleaned);
}}
              disabled={!valid || saving}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-sans text-sm font-bold text-white transition-colors ${
                valid && !saving ? "bg-red-500 hover:bg-red-600 cursor-pointer shadow-md" : "bg-red-300 cursor-not-allowed"
              }`}
            >
              <Check size={14} />
              {saving
                ? (initial._id || initial.id ? "Saving..." : "Creating...")
                : (initial._id || initial.id ? "Save Changes" : "Create Item")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemForm;