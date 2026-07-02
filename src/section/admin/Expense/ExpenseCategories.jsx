import { useEffect, useMemo, useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { useExpenseStore } from "../../../store/expensesStore";

const formatINR = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function ExpenseCategories() {
  const {
    expenses,
    fetchExpenses,
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    deactivateCategory,
  } = useExpenseStore();

  const [sortBy, setSortBy] = useState("amount"); // amount | count | name
  const [showInactive, setShowInactive] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchExpenses?.();
    fetchCategories?.();
  }, [fetchExpenses, fetchCategories]);

  // Spend rollup per category name, from actual expenses
  const spendByCategory = useMemo(() => {
    const map = new Map();
    for (const e of expenses) {
      if (e.isDeleted || !e.category) continue;
      if (!map.has(e.category)) {
        map.set(e.category, { total: 0, count: 0, pending: 0, lastDate: null });
      }
      const row = map.get(e.category);
      row.total += Number(e.amount || 0);
      row.count += 1;
      if (e.status === "Pending") row.pending += 1;
      const d = new Date(e.expenseDate);
      if (!row.lastDate || d > row.lastDate) row.lastDate = d;
    }
    return map;
  }, [expenses]);

  // Every category shows up here, even ones with zero expenses logged yet
  const rows = useMemo(() => {
    const list = categories
      .filter((c) => (showInactive ? true : c.isActive))
      .map((c) => {
        const spend = spendByCategory.get(c.name) || { total: 0, count: 0, pending: 0, lastDate: null };
        return { ...c, ...spend };
      });

    if (sortBy === "amount") list.sort((a, b) => b.total - a.total);
    if (sortBy === "count") list.sort((a, b) => b.count - a.count);
    if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [categories, spendByCategory, sortBy, showInactive]);

  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);

  const handleDeactivate = async (cat) => {
    if (!confirm(`Deactivate "${cat.name}"? Existing expenses keep this category; it just won't be offered for new ones.`)) return;
    await deactivateCategory(cat._id);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-gray-500">
          {rows.length} categor{rows.length === 1 ? "y" : "ies"} · {formatINR(grandTotal)} total spend
        </p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
            Show deactivated
          </label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm">
            <option value="amount">Sort by amount</option>
            <option value="count">Sort by frequency</option>
            <option value="name">Sort A–Z</option>
          </select>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-700"
          >
            <Plus size={15} /> New Category
          </button>
        </div>
      </div>

      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</div>}

      {loading && <div className="text-sm text-gray-400 py-8 text-center">Loading categories...</div>}

      {!loading && rows.length === 0 && (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl py-12 text-center text-gray-400 text-sm">
          No categories yet. Add your first one to get started.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((r) => {
          const share = grandTotal > 0 ? (r.total / grandTotal) * 100 : 0;
          return (
            <div
              key={r._id}
              className={`bg-white border rounded-xl p-4 relative ${r.isActive ? "border-gray-200" : "border-gray-200 opacity-50"}`}
            >
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-gray-900">{r.name}</h3>
                <div className="flex items-center gap-2">
                  {r.pending > 0 && (
                    <span className="text-xs font-medium bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">
                      {r.pending} pending
                    </span>
                  )}
                  {!r.isActive && (
                    <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      Deactivated
                    </span>
                  )}
                  {r.isActive && (
                    <button
                      onClick={() => handleDeactivate(r)}
                      className="p-1 rounded text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Deactivate category"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {r.description && <p className="text-xs text-gray-400 mt-0.5">{r.description}</p>}

              <p className="text-2xl font-semibold text-gray-900 mt-2">{formatINR(r.total)}</p>
              <p className="text-xs text-gray-400 mt-1">
                {r.count > 0
                  ? `${r.count} expense${r.count !== 1 ? "s" : ""} · last on ${r.lastDate?.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`
                  : "No expenses logged yet"}
              </p>

              <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${share}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{share.toFixed(1)}% of total spend</p>
            </div>
          );
        })}
      </div>

      {showAddForm && (
        <AddCategoryModal
          onClose={() => setShowAddForm(false)}
          onCreate={async (data) => {
            await createCategory(data);
            setShowAddForm(false);
          }}
        />
      )}
    </div>
  );
}

function AddCategoryModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErr("Category name is required");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      await onCreate({ name: name.trim(), description: description.trim() });
    } catch (e) {
      setErr(e?.response?.data?.message || "Could not create category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">New Category</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {err && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</div>}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Packaging"
              maxLength={50}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description (optional)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What falls under this category"
              maxLength={200}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}