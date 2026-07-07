import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, RotateCcw, X } from "lucide-react";
import { useExpenseStore } from "../../../store/expensesStore";

const BRANCHES = ["All", "VK Bakes", "Morning Star Cafe"];
const STATUSES = ["All", "Paid", "Pending"];
const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Bank Transfer"];

const formatINR = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";

// expense.category can arrive as a populated { _id, name } object (after
// backend .populate("category", "name")) or, if unpopulated, as a bare id
// string — these helpers handle both.
const categoryId = (c) => (c && typeof c === "object" ? c._id : c);
const categoryName = (c) => (c && typeof c === "object" ? c.name : c) || "-";

export default function ExpenseHistory() {
  const {
    expenses,
    loading,
    error,
    fetchExpenses,
    softDeleteExpense,
    restoreExpense,
    updateExpense,
    categories,
    fetchCategories,
  } = useExpenseStore();

  const [branch, setBranch] = useState("All");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All"); // holds a category _id or "All"
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    fetchExpenses?.();
    fetchCategories?.();
  }, [fetchExpenses, fetchCategories]);
console.log("expenses", expenses);
  const filtered = useMemo(() => {
    return expenses
      .filter((e) => (showDeleted ? true : !e.isDeleted))
      .filter((e) => (branch === "All" ? true : e.branch === branch))
      .filter((e) => (status === "All" ? true : e.status === status))
      .filter((e) => (category === "All" ? true : categoryId(e.category) === category))
      .filter((e) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          e.title?.toLowerCase().includes(q) ||
          categoryName(e.category).toLowerCase().includes(q) ||
          e.vendor?.toLowerCase().includes(q) ||
          e.billNumber?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
  }, [expenses, branch, status, category, search, showDeleted]);

  const total = filtered.reduce((sum, e) => sum + (e.isDeleted ? 0 : Number(e.amount || 0)), 0);

  const handleDelete = async (exp) => {
    if (!confirm(`Remove "${exp.title}" from expense history?`)) return;
    await softDeleteExpense(exp._id);
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center mb-4 bg-white border border-gray-200 rounded-xl p-4">
        <input
          type="text"
          placeholder="Search title, category, vendor, bill no."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <select value={branch} onChange={(e) => setBranch(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="All">All</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} />
          Show removed
        </label>
      </div>

      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</div>}

      {/* Summary */}
      <div className="mb-4 text-sm text-gray-600">
        {filtered.length} expense{filtered.length !== 1 ? "s" : ""} · Total {formatINR(total)}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Branch</th>
                <th className="text-left px-4 py-3 font-medium">Payment</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading expenses...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No expenses match these filters.</td></tr>
              )}
              {!loading && filtered.map((e) => (
                <tr key={e._id} className={e.isDeleted ? "opacity-50" : ""}>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(e.expenseDate)}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{e.title}</td>
                  <td className="px-4 py-3 text-gray-600">{categoryName(e.category)}</td>
                  <td className="px-4 py-3 text-gray-600">{e.branch}</td>
                  <td className="px-4 py-3 text-gray-600">{e.paymentMethod}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{formatINR(e.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      e.status === "Paid" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {!e.isDeleted ? (
                        <>
                          <button onClick={() => setEditingExpense(e)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800" title="Edit">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(e)} className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600" title="Remove">
                            <Trash2 size={15} />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => restoreExpense(e._id)} className="p-1.5 rounded-lg text-gray-500 hover:bg-green-50 hover:text-green-600" title="Restore">
                          <RotateCcw size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          categories={categories}
          onClose={() => setEditingExpense(null)}
          onSave={async (data) => {
            await updateExpense(editingExpense._id, data);
            setEditingExpense(null);
          }}
        />
      )}
    </div>
  );
}

function EditExpenseModal({ expense, categories, onClose, onSave }) {
  const [form, setForm] = useState({
    title: expense.title || "",
    category: categoryId(expense.category) || "",
    amount: expense.amount ?? "",
    paymentMethod: expense.paymentMethod || "Cash",
    branch: expense.branch || "VK Bakes",
    vendor: expense.vendor || "",
    billNumber: expense.billNumber || "",
    expenseDate: expense.expenseDate ? new Date(expense.expenseDate).toISOString().slice(0, 10) : "",
    notes: expense.notes || "",
    status: expense.status || "Paid",
  });
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ ...form, amount: Number(form.amount) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Edit Expense</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
              <input value={form.title} onChange={update("title")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <select value={form.category} onChange={update("category")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">Select a category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Amount (₹)</label>
              <input type="number" min="0" value={form.amount} onChange={update("amount")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Branch</label>
              <select value={form.branch} onChange={update("branch")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="VK Bakes">VK Bakes</option>
                <option value="Morning Star Cafe">Morning Star Cafe</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Payment Method</label>
              <select value={form.paymentMethod} onChange={update("paymentMethod")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Expense Date</label>
              <input type="date" value={form.expenseDate} onChange={update("expenseDate")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select value={form.status} onChange={update("status")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Vendor</label>
              <input value={form.vendor} onChange={update("vendor")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Bill Number</label>
              <input value={form.billNumber} onChange={update("billNumber")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
              <textarea value={form.notes} onChange={update("notes")} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}