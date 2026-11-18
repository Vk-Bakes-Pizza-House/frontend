import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Trash2,
  RotateCcw,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  CalendarDays,
  Receipt,
  ChevronsUpDown,
  Plus,
} from "lucide-react";
import { useExpenseStore } from "../../../store/expensesStore";
import AddExpense from "./AddExpense"; // path apne folder ke hisaab se badlo

const BRANCHES = ["All", "VK Bakes", "Morning Star Cafe"];
const STATUSES = ["All", "Paid", "Pending"];
const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Bank Transfer"];

const formatINR = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const categoryId = (c) => (c && typeof c === "object" ? c._id : c);
const categoryName = (c) => (c && typeof c === "object" ? c.name : c) || "-";

const Field = ({ label, children, full }) => (
  <div className={full ? "col-span-2" : ""}>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    {children}
  </div>
);

const dayKey = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "unknown");

const dayParts = (key) => {
  if (key === "unknown") return { day: "--", month: "", weekday: "No date", full: "No date" };
  const dt = new Date(`${key}T00:00:00`);
  return {
    day: dt.toLocaleDateString("en-IN", { day: "2-digit" }),
    month: dt.toLocaleDateString("en-IN", { month: "short" }),
    weekday: dt.toLocaleDateString("en-IN", { weekday: "long" }),
    full: dt.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
  };
};

/* ---------- month helpers (value format: "YYYY-MM") ---------- */
const pad = (n) => String(n).padStart(2, "0");
const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
const shiftMonth = (value, delta) => {
  const [y, m] = value.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
const monthRange = (value) => {
  const [y, m] = value.split("-").map(Number);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  return { startDate: `${value}-01`, endDate: end.toISOString() };
};
const monthLabel = (value) => {
  const [y, m] = value.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500";

export default function ExpenseHistory() {
  const {
    expenses,
    loading,
    error,
    fetchAllExpenses,
    softDeleteExpense,
    restoreExpense,
    updateExpense,
    categories,
    fetchCategories,
  } = useExpenseStore();

  const [month, setMonth] = useState(currentMonth());
  const [branch, setBranch] = useState("All");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [openDays, setOpenDays] = useState(() => new Set());

  const isCurrentMonth = month === currentMonth();

  useEffect(() => {
    fetchCategories?.();
  }, [fetchCategories]);

  const loadExpenses = useCallback(() => {
    const { startDate, endDate } = monthRange(month);
    fetchAllExpenses?.({
      month,
      startDate,
      endDate,
      search: search.trim(),
      branch: branch === "All" ? "" : branch,
      status: status === "All" ? "" : status,
      category: category === "All" ? "" : category,
    });
  }, [month, search, branch, status, category, fetchAllExpenses]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // mahina badalne par khule hue din band kar do
  useEffect(() => {
    setOpenDays(new Set());
  }, [month]);

  // Sirf chuna hua mahina (backend ne date filter na bhi kiya ho to bhi safe)
  const visibleExpenses = useMemo(
    () =>
      expenses.filter(
        (e) => dayKey(e.expenseDate).startsWith(month) && (showDeleted ? true : !e.isDeleted)
      ),
    [expenses, month, showDeleted]
  );

  const days = useMemo(() => {
    const map = new Map();
    visibleExpenses.forEach((e) => {
      const key = dayKey(e.expenseDate);
      if (!map.has(key)) map.set(key, { key, items: [], total: 0, pending: 0 });
      const g = map.get(key);
      g.items.push(e);
      if (!e.isDeleted) {
        g.total += Number(e.amount || 0);
        if (e.status === "Pending") g.pending += Number(e.amount || 0);
      }
    });
    return [...map.values()].sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [visibleExpenses]);

  const monthTotal = days.reduce((s, d) => s + d.total, 0);
  const monthPending = days.reduce((s, d) => s + d.pending, 0);
  const expenseCount = visibleExpenses.filter((e) => !e.isDeleted).length;
  const allOpen = days.length > 0 && days.every((d) => openDays.has(d.key));

  const toggleDay = (key) =>
    setOpenDays((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleAll = () =>
    setOpenDays(allOpen ? new Set() : new Set(days.map((d) => d.key)));

  const handleDelete = async (exp) => {
    if (!confirm(`Remove "${exp.title}" from expense history?`)) return;
    await softDeleteExpense(exp._id);
  };

  const handleAdded = () => {
    setShowAdd(false);
    loadExpenses();
  };

  return (
    <div className="space-y-5">
      {/* Top bar: month switcher + New Expense */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
            title="Previous month"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="relative">
            <input
              type="month"
              value={month}
              max={currentMonth()}
              onChange={(e) => e.target.value && setMonth(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <button
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
            disabled={isCurrentMonth}
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Next month"
          >
            <ChevronRight size={18} />
          </button>

          {!isCurrentMonth && (
            <button
              onClick={() => setMonth(currentMonth())}
              className="text-xs font-medium text-amber-700 hover:underline ml-1"
            >
              This month
            </button>
          )}
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 shadow-sm"
        >
          <Plus size={16} /> New Expense
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search title, category, vendor, bill no."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputCls} pl-9`}
            />
          </div>
          <select value={branch} onChange={(e) => setBranch(e.target.value)} className={`${inputCls} !w-auto`}>
            {BRANCHES.map((b) => <option key={b} value={b}>{b === "All" ? "All branches" : b}</option>)}
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputCls} !w-auto`}>
            <option value="All">All categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} !w-auto`}>
            {STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All status" : s}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
              className="accent-amber-600"
            />
            Show removed
          </label>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>
      )}

      {/* Month summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard accent label={`${monthLabel(month)} total`} value={formatINR(monthTotal)} />
        <SummaryCard icon={<Receipt size={18} />} label="Expenses" value={expenseCount} />
        <SummaryCard icon={<CalendarDays size={18} />} label="Days with expenses" value={days.length} />
        <SummaryCard label="Pending" value={formatINR(monthPending)} />
      </div>

      {days.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={toggleAll}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-amber-700"
          >
            <ChevronsUpDown size={14} />
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>
      )}

      {/* Day list */}
      <div className="space-y-3">
        {loading && (
          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-10 text-center text-gray-400">
            Loading expenses...
          </div>
        )}

        {!loading && days.length === 0 && (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl px-4 py-10 text-center text-gray-400">
            {monthLabel(month)} mein koi expense nahi mila.
          </div>
        )}

        {!loading &&
          days.map((d) => {
            const p = dayParts(d.key);
            const open = openDays.has(d.key);
            const activeCount = d.items.filter((e) => !e.isDeleted).length;

            return (
              <div
                key={d.key}
                className={`bg-white border rounded-2xl overflow-hidden transition-shadow ${
                  open ? "border-amber-300 shadow-md" : "border-gray-200 shadow-sm hover:shadow-md"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleDay(d.key)}
                  aria-expanded={open}
                  className="w-full flex items-center gap-4 px-4 py-3.5 text-left"
                >
                  <div
                    className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0 transition-colors ${
                      open ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    <span className="text-lg font-bold leading-none">{p.day}</span>
                    <span className="text-[11px] uppercase tracking-wide mt-0.5">{p.month}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{p.weekday}</p>
                    <p className="text-xs text-gray-500">
                      {p.full} · {activeCount} expense{activeCount !== 1 ? "s" : ""}
                      {d.pending > 0 && (
                        <span className="ml-2 inline-block px-1.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700 font-medium">
                          {formatINR(d.pending)} pending
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Day total</p>
                    <p className="text-lg font-bold text-gray-900">{formatINR(d.total)}</p>
                  </div>

                  <ChevronDown
                    size={20}
                    className={`text-gray-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-amber-600" : ""}`}
                  />
                </button>

                <div
                  inert={!open}
                  className={`grid transition-all duration-300 ease-in-out ${
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-gray-100 bg-gray-50/60 divide-y divide-gray-100">
                      {d.items.map((e) => (
                        <div
                          key={e._id}
                          className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 ${
                            e.isDeleted ? "opacity-50" : ""
                          }`}
                        >
                          <div className="flex-1 min-w-[180px]">
                            <p className={`font-medium text-gray-900 ${e.isDeleted ? "line-through" : ""}`}>
                              {e.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <Chip>{categoryName(e.category)}</Chip>
                              <Chip>{e.branch}</Chip>
                              <Chip>{e.paymentMethod}</Chip>
                              {e.vendor && <Chip>{e.vendor}</Chip>}
                              {e.billNumber && <Chip>Bill #{e.billNumber}</Chip>}
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              e.status === "Paid"
                                ? "bg-green-50 text-green-700"
                                : "bg-yellow-50 text-yellow-700"
                            }`}
                          >
                            {e.status}
                          </span>

                          <span className="w-24 text-right font-semibold text-gray-900">
                            {formatINR(e.amount)}
                          </span>

                          <div className="flex gap-1">
                            {!e.isDeleted ? (
                              <>
                                <IconBtn title="Edit" onClick={() => setEditingExpense(e)}>
                                  <Pencil size={15} />
                                </IconBtn>
                                <IconBtn title="Remove" danger onClick={() => handleDelete(e)}>
                                  <Trash2 size={15} />
                                </IconBtn>
                              </>
                            ) : (
                              <IconBtn title="Restore" success onClick={() => restoreExpense(e._id)}>
                                <RotateCcw size={15} />
                              </IconBtn>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* New expense popup */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-gray-50 rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">New Expense</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <AddExpense onDone={handleAdded} />
            </div>
          </div>
        </div>
      )}

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

/* ---------- small UI helpers ---------- */

function SummaryCard({ icon, label, value, accent }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 shadow-sm flex items-center gap-3 ${
        accent ? "bg-amber-600 border-amber-600 text-white" : "bg-white border-gray-200"
      }`}
    >
      {icon && (
        <div className={`p-2 rounded-xl ${accent ? "bg-white/20" : "bg-amber-50 text-amber-700"}`}>{icon}</div>
      )}
      <div>
        <p className={`text-xs ${accent ? "text-amber-100" : "text-gray-500"}`}>{label}</p>
        <p className={`text-lg font-bold ${accent ? "text-white" : "text-gray-900"}`}>{value}</p>
      </div>
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[11px] text-gray-600">
      {children}
    </span>
  );
}

function IconBtn({ children, onClick, title, danger, success }) {
  const hover = danger
    ? "hover:bg-red-50 hover:text-red-600"
    : success
    ? "hover:bg-green-50 hover:text-green-600"
    : "hover:bg-gray-100 hover:text-gray-800";
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg text-gray-500 transition-colors ${hover}`}
    >
      {children}
    </button>
  );
}

/* ---------- Edit modal (pehle jaisa) ---------- */

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Edit Expense</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 grid grid-cols-2 gap-3">
          <Field label="Title" full>
            <input value={form.title} onChange={update("title")} className={inputCls} />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={update("category")} className={inputCls}>
              <option value="">Select a category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Amount (₹)">
            <input type="number" min="0" value={form.amount} onChange={update("amount")} className={inputCls} />
          </Field>
          <Field label="Branch">
            <select value={form.branch} onChange={update("branch")} className={inputCls}>
              <option value="VK Bakes">VK Bakes</option>
              <option value="Morning Star Cafe">Morning Star Cafe</option>
            </select>
          </Field>
          <Field label="Payment Method">
            <select value={form.paymentMethod} onChange={update("paymentMethod")} className={inputCls}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Expense Date">
            <input type="date" value={form.expenseDate} onChange={update("expenseDate")} className={inputCls} />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={update("status")} className={inputCls}>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </Field>
          <Field label="Vendor">
            <input value={form.vendor} onChange={update("vendor")} className={inputCls} />
          </Field>
          <Field label="Bill Number">
            <input value={form.billNumber} onChange={update("billNumber")} className={inputCls} />
          </Field>
          <Field label="Notes" full>
            <textarea value={form.notes} onChange={update("notes")} rows={2} className={inputCls} />
          </Field>
        </div>

        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}