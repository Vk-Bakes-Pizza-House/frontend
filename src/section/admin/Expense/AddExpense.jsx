import { useEffect, useState } from "react";
import { useExpenseStore } from "../../../store/expensesStore";

const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Bank Transfer"];
const BRANCHES = ["VK Bakes", "Morning Star Cafe"];
const STATUSES = ["Paid", "Pending"];
const UNITS = ["kg", "g", "L", "Q", "pcs"];

const todayInputValue = () => new Date().toISOString().slice(0, 10);

const emptyItem = {
  title: "",
  category: "",
  amount: "",
  quantity: "",
  unit: "pcs",
  pricePerUnit: "",
  vendor: "",
};

const sharedDefaults = {
  expenseDate: todayInputValue(),
  branch: "VK Bakes",
  paymentMethod: "Cash",
  status: "Paid",
};

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500";

export default function AddExpense({ onDone }) {
  const createExpense = useExpenseStore((s) => s.createExpense);
  const categories = useExpenseStore((s) => s.categories);
  const fetchCategories = useExpenseStore((s) => s.fetchCategories);

  useEffect(() => {
    fetchCategories?.();
  }, [fetchCategories]);

  const [shared, setShared] = useState(sharedDefaults); // din ka common data
  const [item, setItem] = useState(emptyItem);          // abhi bhara ja raha expense
  const [list, setList] = useState([]);                 // add kiye hue expenses (staged)
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [submitError, setSubmitError] = useState("");

  const updateShared = (field) => (e) =>
    setShared((s) => ({ ...s, [field]: e.target.value }));

  const updateItem = (field) => (e) => {
    const value = e.target.value;
    setItem((i) => ({ ...i, [field]: value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  };

  const categoryName = (id) => categories.find((c) => c._id === id)?.name || "-";

  const validate = () => {
    const next = {};
    if (!item.title.trim()) next.title = "Name is required";
    if (!item.category) next.category = "Category is required";
    if (item.amount === "" || Number(item.amount) < 0) next.amount = "Enter a valid amount";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // Add button: list me daalo, form clear karo
  const handleAdd = () => {
    if (submitting) return;
    setSuccessMsg("");
    setSubmitError("");
    if (!validate()) return;
    setList((l) => [...l, { ...item, id: crypto.randomUUID() }]);
    setItem(emptyItem);
  };

  const removeFromList = (id) => {
    if (submitting) return;
    setList((l) => l.filter((x) => x.id !== id));
  };

  // Final save: poore din ke expenses
  const handleSaveDay = async () => {
    if (list.length === 0) return;
    setSuccessMsg("");
    setSubmitError("");
    setSubmitting(true);

    const savedIds = [];
    let saved = 0;

    for (const r of list) {
      try {
        await createExpense({
          ...shared,
          title: r.title.trim(),
          category: r.category,
          amount: Number(r.amount),
          quantity: r.quantity ? Number(r.quantity) : undefined,
          pricePerUnit: r.pricePerUnit ? Number(r.pricePerUnit) : undefined,
          unit: r.unit || "pcs",
          vendor: r.vendor.trim(),
        });
        savedIds.push(r.id);
        saved++;
      } catch (err) {
        console.error("Error creating expense:", err);
      }
    }

    setSubmitting(false);
    setList((current) => current.filter((item) => !savedIds.includes(item.id)));

    const failedCount = list.length - saved;
    if (failedCount === 0) {
      setSuccessMsg(`${saved} expense(s) saved for ${shared.expenseDate}.`);
      // onDone?.();
    } else {
      if (saved) setSuccessMsg(`${saved} saved.`);
      setSubmitError(`${failedCount} expense(s) could not be saved. Please try again.`);
    }
  };

  const total = list.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  return (
    <div className="max-w-2xl space-y-5">
      {successMsg && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {successMsg}
        </div>
      )}
      {submitError && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {submitError}
        </div>
      )}

      {/* Shared details for the selected day */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expense date</label>
          <input
            type="date"
            value={shared.expenseDate}
            max={todayInputValue()}
            onChange={updateShared("expenseDate")}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
          <select value={shared.branch} onChange={updateShared("branch")} className={inputCls}>
            {BRANCHES.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
          <select value={shared.paymentMethod} onChange={updateShared("paymentMethod")} className={inputCls}>
            {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={shared.status} onChange={updateShared("status")} className={inputCls}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Individual expense form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={item.title}
              onChange={updateItem("title")}
              maxLength={100}
              placeholder="e.g. Flour & Maida"
              className={inputCls}
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select value={item.category} onChange={updateItem("category")} className={inputCls}>
              <option value="">Select a category</option>
              {categories.filter((c) => c.isActive).map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={item.amount}
              onChange={updateItem("amount")}
              placeholder="0.00"
              className={inputCls}
            />
            {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input type="number" min="0" value={item.quantity} onChange={updateItem("quantity")}
            placeholder="Quantity" className={inputCls} />
          <select value={item.unit} onChange={updateItem("unit")} className={inputCls}>
            {UNITS.map((u) => <option key={u}>{u}</option>)}
          </select>
          <input type="number" min="0" value={item.pricePerUnit} onChange={updateItem("pricePerUnit")}
            placeholder="Price / unit" className={inputCls} />
          <input type="text" value={item.vendor} onChange={updateItem("vendor")}
            placeholder="Vendor" className={inputCls} />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAdd}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-700"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Staged expenses */}
      {list.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Expenses for {shared.expenseDate} ({list.length})
          </h3>

          <ul className="divide-y divide-gray-100">
            {list.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="font-medium text-gray-800">{r.title}</p>
                  <p className="text-xs text-gray-500">{categoryName(r.category)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">₹{Number(r.amount).toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => removeFromList(r.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Total: <span className="font-semibold">₹{total.toFixed(2)}</span>
            </p>
            <button
              type="button"
              onClick={handleSaveDay}
              disabled={submitting}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Day"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}