import { useEffect, useState } from "react";
import { toast } from "sonner";
import useProductStore from "../../../../store/productStore";

const PRODUCT_TYPES = ["Raw Material", "Packaging", "Finished Good"];
const UNITS = ["g", "kg", "ml", "l", "pcs", "dozen", "box"];

const emptyForm = {
  name: "",
  type: "Raw Material",
  category: "",
  sku: "",
  unit: "kg",
  reorderLevel: 0,
  avgCostPerUnit: 0,
  sellingPrice: "",
  description: "",
};

export default function ManageProducts() {
  const {
    fetchAll,
    create,
    update,
    remove,
    loading,
    typeFilter,
    searchTerm,
    setTypeFilter,
    setSearchTerm,
    getFilteredProducts,
  } = useProductStore();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const products = getFilteredProducts();

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      type: product.type,
      category: product.category,
      sku: product.sku || "",
      unit: product.unit,
      reorderLevel: product.reorderLevel,
      avgCostPerUnit: product.avgCostPerUnit,
      sellingPrice: product.sellingPrice ?? "",
      description: product.description || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      sellingPrice: form.sellingPrice === "" ? null : Number(form.sellingPrice),
    };
    try {
      if (editingId) {
        await update(editingId, payload);
        toast.success("Product updated");
      } else {
        await create(payload);
        toast.success("Product added");
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await remove(id);
      toast.success("Product deleted");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  return (
    <div className="p-6 bg-[#FFF8F0] min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#2D1400]">Products</h1>
        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-lg bg-[#F5A623] text-[#2D1400] font-medium hover:opacity-90 transition"
        >
          + Add product
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-[#E8D5C0] bg-white text-[#2D1400] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#E8D5C0] bg-white text-[#2D1400]"
        >
          <option value="All">All types</option>
          {PRODUCT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-[#E8D5C0] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#E8D5C0] text-[#2D1400]">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-left px-4 py-3 font-medium">Unit</th>
              <th className="text-right px-4 py-3 font-medium">Current stock</th>
              <th className="text-right px-4 py-3 font-medium">Reorder level</th>
              <th className="text-right px-4 py-3 font-medium">Avg cost</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="text-center py-6 text-[#8B6A4F]">Loading...</td></tr>
            )}
            {!loading && products.length === 0 && (
              <tr><td colSpan={8} className="text-center py-6 text-[#8B6A4F]">No products found</td></tr>
            )}
            {!loading && products.map((p) => {
              const isLow = p.currentStock <= p.reorderLevel;
              return (
                <tr key={p._id} className="border-t border-[#E8D5C0]">
                  <td className="px-4 py-3 text-[#2D1400] font-medium">
                    {p.name}
                    {p.sku && <span className="block text-xs text-[#8B6A4F] font-normal">SKU: {p.sku}</span>}
                    {isLow && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        Low stock
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#8B6A4F]">{p.type}</td>
                  <td className="px-4 py-3 text-[#8B6A4F]">{p.category}</td>
                  <td className="px-4 py-3 text-[#8B6A4F]">{p.unit}</td>
                  <td className="px-4 py-3 text-right text-[#2D1400]">{p.currentStock}</td>
                  <td className="px-4 py-3 text-right text-[#8B6A4F]">{p.reorderLevel}</td>
                  <td className="px-4 py-3 text-right text-[#8B6A4F]">₹{p.avgCostPerUnit}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEditModal(p)} className="text-[#F5A623] hover:underline">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl p-6 w-full max-w-md space-y-4"
          >
            <h2 className="text-lg font-semibold text-[#2D1400]">
              {editingId ? "Edit product" : "Add product"}
            </h2>

            <div>
              <label className="block text-sm text-[#8B6A4F] mb-1">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E8D5C0]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-[#8B6A4F] mb-1">Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flour, Dairy, Frosting"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8D5C0]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8B6A4F] mb-1">SKU (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. RM-FLR-001"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8D5C0]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-[#8B6A4F] mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8D5C0]"
                >
                  {PRODUCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#8B6A4F] mb-1">Unit</label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8D5C0]"
                >
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-[#8B6A4F] mb-1">Reorder level</label>
                <input
                  type="number"
                  min="0"
                  value={form.reorderLevel}
                  onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8D5C0]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8B6A4F] mb-1">Avg cost/unit</label>
                <input
                  type="number"
                  min="0"
                  value={form.avgCostPerUnit}
                  onChange={(e) => setForm({ ...form, avgCostPerUnit: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8D5C0]"
                />
              </div>
            </div>

            {form.type === "Finished Good" && (
              <div>
                <label className="block text-sm text-[#8B6A4F] mb-1">Selling price (optional)</label>
                <input
                  type="number"
                  min="0"
                  value={form.sellingPrice}
                  onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8D5C0]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-[#8B6A4F] mb-1">Description (optional)</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E8D5C0]"
              />
            </div>

            <p className="text-xs text-[#8B6A4F]">
              Current stock isn't set here — it updates automatically from Purchases and Sales. Purchase price is a rolling average calculated from Purchase records too.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-[#E8D5C0] text-[#8B6A4F]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#F5A623] text-[#2D1400] font-medium"
              >
                {editingId ? "Save changes" : "Add product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}