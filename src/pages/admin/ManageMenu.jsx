// admin/ManageMenu.jsx
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { toast, Toaster } from "sonner";
import useMenuStore from "../../store/menuStore";
import ItemForm from "../../section/itemFrom";

const CATS  = ["all","pizza","bake","bread","toast","biscuit","cake","ice"];
const EMOJI = { pizza:"🍕", bake:"🥐", bread:"🍞", toast:"🥖", biscuit:"🍪", cake:"🎂", ice:"🍦" };
const BLANK = { name:"", category:"pizza", price:"", description:"", deliverable:true, tag:"", available:true, image:"" };

export default function ManageMenu() {
  const {
    items,
    loading,
    error,
    fetchMenu,
    createItem,
    updateItem,
    deleteItem,
    toggleAvailability,
    clearError,
  } = useMenuStore();

  const [cat,    setCat]    = useState("all");
  const [q,      setQ]      = useState("");
  const [adding, setAdding] = useState(false);
  const [editing,setEditing]= useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMenu({ includeUnavailable: true });
  }, [fetchMenu]);

  const menuItems = Array.isArray(items) ? items : [];

  // ✅ FIX — plain JSON object, key is `image` (matches backend req.body.image)
  //    No FormData needed — image is already on Cloudinary before submit
  const buildPayload = (form) => ({
    name:        form.name,
    category:    form.category,
    price:       Number(form.price),
    description: form.description || "",
    deliverable: form.deliverable,
    tag:         form.tag || "",
    size:       form.size,
    image:       form.image || form.imageUrl || "",   // preserve existing image URL if unchanged
  });

  const visible = menuItems.filter(i =>
    (cat === "all" || i.category === cat) &&
    i.name.toLowerCase().includes(q.toLowerCase())
  );

  const handleAddItem = async (f) => {
    setSaving(true);
    const result = await createItem(buildPayload(f));
    setSaving(false);
    if (result.success) {
      toast.success("Item created!");
      setAdding(false);
      fetchMenu({ includeUnavailable: true });
    } else {
      toast.error(result.message || "Failed to create item");
    }
  };

  const handleUpdateItem = async (f) => {
    setSaving(true);
    const result = await updateItem(f._id, buildPayload(f));
    setSaving(false);
    if (result.success) {
      toast.success("Item updated!");
      setEditing(null);
      fetchMenu({ includeUnavailable: true });
    } else {
      toast.error(result.message || "Failed to update item");
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Delete this item from the menu?")) {
      const result = await deleteItem(id);
      if (result.success) fetchMenu({ includeUnavailable: true });
    }
  };

  const dlvLabel = (d) =>
    d === true   ? { t: "Delivers",    s: "bg-green-100 text-green-800" } :
    d === "cond" ? { t: "Cond.",       s: "bg-yellow-100 text-yellow-800" } :
                   { t: "Pickup only", s: "bg-gray-100 text-gray-600" };

  if (error) {
    return (
      <div className="w-full p-8 text-center">
        <div className="text-red-600 font-sans mb-4">Error: {error}</div>
        <button
          onClick={() => { clearError(); fetchMenu({ includeUnavailable: true }); }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg font-sans"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex justify-between items-start mb-5 flex-wrap gap-3">
        <div>
          <h2 className="font-sans text-2xl font-bold text-gray-800">Manage Menu</h2>
          <p className="font-sans text-sm text-gray-500 mt-1">
            {menuItems.length} items · {menuItems.filter(i => !i.available).length} out of stock
            {loading && " (Loading...)"}
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-sans text-sm font-bold text-white transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 flex-1 min-w-[180px] shadow-sm">
          <Search size={16} className="text-gray-400" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search items…"
            className="border-none outline-none font-sans text-sm text-gray-800 py-2.5 flex-1 bg-transparent"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATS.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-full font-sans text-xs font-medium transition-colors border ${
                cat === c
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {c === "all" ? "All" : `${EMOJI[c]} ${c.charAt(0).toUpperCase() + c.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-orange-50/50">
                {["Item","Category","Price","Tag","Delivery","Stock","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 font-sans text-xs font-bold text-gray-500 tracking-wider text-left whitespace-nowrap uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((item, idx) => {
                const dl = dlvLabel(item.deliverable);
                return (
                  <tr
                    key={item._id}
                    className={`border-t border-gray-200 transition-opacity ${idx % 2 === 0 ? "bg-white" : "bg-orange-50/20"} ${item.available ? "opacity-100" : "opacity-60"}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* ✅ Show thumbnail in table row */}
                        {(item.imageUrl || item.image) ? (
                          <img
                            src={item.imageUrl || item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-xl shrink-0">
                            {EMOJI[item.category] || "🍽️"}
                          </div>
                        )}
                        <div>
                          <div className="font-sans font-semibold text-gray-800 text-sm">{item.name}</div>
                          <div className="font-sans text-gray-500 text-xs mt-0.5">{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-sans text-sm text-gray-700">{EMOJI[item.category]} {item.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-sans font-bold text-red-500 text-sm">₹{item.price}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-sans text-xs text-gray-500">{item.tag || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-sans font-bold ${dl.s}`}>
                        {dl.t}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleAvail(item._id)} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                        {item.available
                          ? <ToggleRight size={26} className="text-green-500" />
                          : <ToggleLeft  size={26} className="text-gray-400" />}
                        <span className={`font-sans text-xs font-semibold ${item.available ? "text-green-600" : "text-gray-500"}`}>
                          {item.available ? "In Stock" : "Sold Out"}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditing({ ...item, image: item.imageUrl || item.image || "" })}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-gray-200 font-sans text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-red-100 bg-red-50 font-sans text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {visible.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="p-10 text-center font-sans text-gray-500 text-sm">
                    No items found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {(adding || editing) && (
        <ItemForm
          initial={editing ?? BLANK}
          saving={saving}
          onSave={editing ? handleUpdateItem : handleAddItem}
          onCancel={() => { setAdding(false); setEditing(null); }}
        />
      )}
    </div>
  );

  async function handleToggleAvail(id) {
    await toggleAvailability(id);
  }
}