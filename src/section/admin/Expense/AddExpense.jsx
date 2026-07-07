import { useEffect, useState } from "react";
import { useExpenseStore } from "../../../store/expensesStore";

const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Bank Transfer"];
const BRANCHES = ["VK Bakes", "Morning Star Cafe"];
const STATUSES = ["Paid", "Pending"];

const todayInputValue = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  title: "",
  category: "",
  amount: "",
  paymentMethod: "Cash",
  branch: "VK Bakes",
  vendor: "",
  billNumber: "",
  expenseDate: todayInputValue(),
  notes: "",
  status: "Paid",
};

export default function AddExpense({ onDone }) {
  const createExpense = useExpenseStore((s) => s.createExpense);
  const categories = useExpenseStore((s) => s.categories);
  const fetchCategories = useExpenseStore((s) => s.fetchCategories);

  useEffect(() => {
    fetchCategories?.();
  }, [fetchCategories]);

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const update = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Title is required";
    if (!form.category.trim()) next.category = "Category is required";
    if (form.amount === "" || Number(form.amount) < 0)
      next.amount = "Enter a valid amount";
    if (!form.branch) next.branch = "Branch is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        title: form.title.trim(),
        category: form.category,
        vendor: form.vendor?.trim() || "",
        billNumber: form.billNumber?.trim() || "",
        notes: form.notes?.trim() || "",
        quantity: form.quantity ? Number(form.quantity) : undefined,
        pricePerUnit: form.pricePerUnit ? Number(form.pricePerUnit) : undefined,
        unit: form.unit || "pcs",
      };

      await createExpense(payload);
      setSuccessMsg(`"${form.title.trim()}" added successfully.`);
      setForm(emptyForm);
      // Uncomment to jump straight to history after saving:
      // onDone?.();
    } catch (err) {
      setErrors({
        submit: err?.response?.data?.message || "Could not save the expense. Try again.",
      });
      console.error("Error creating expense:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 space-y-5">
        {successMsg && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {successMsg}
          </div>
        )}
        {errors.submit && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={update("title")}
              maxLength={100}
              placeholder="e.g. Flour & Maida purchase"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={update("category")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Select a category</option>
              {categories
                .filter((c) => c.isActive)
                .map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                No categories yet — add one on the Categories tab first.
              </p>
            )}
            {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"

              value={form.amount}
              onChange={update("amount")}
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              min="0"

              value={form.quantity}
              onChange={update("quantity")}
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            {errors.quantity && <p className="text-xs text-red-600 mt-1">{errors.quantity}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              value={form.unit}
              onChange={update("unit")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="L">L</option>
              <option value="Q">Q</option>
              <option value="pcs">pcs</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit (₹)</label>
            <input
              type="number"

              value={form.pricePerUnit}
              onChange={update("pricePerUnit")}
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            {errors.pricePerUnit && <p className="text-xs text-red-600 mt-1">{errors.pricePerUnit}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expense Date</label>
            <input
              type="date"
              value={form.expenseDate}
              max={todayInputValue()}
              onChange={update("expenseDate")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <p className="text-xs text-gray-400 mt-1">Backdate this if the expense happened earlier.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch <span className="text-red-500">*</span>
            </label>
            <select
              value={form.branch}
              onChange={update("branch")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {BRANCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={form.paymentMethod}
              onChange={update("paymentMethod")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
            <input
              type="text"
              value={form.vendor}
              onChange={update("vendor")}
              placeholder="e.g. Local supplier name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number</label>
            <input
              type="text"
              value={form.billNumber}
              onChange={update("billNumber")}
              placeholder="Optional"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="flex gap-2">
              {STATUSES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${form.status === s
                      ? s === "Paid"
                        ? "bg-green-50 border-green-300 text-green-700"
                        : "bg-yellow-50 border-yellow-300 text-yellow-700"
                      : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={update("notes")}
            maxLength={500}
            rows={3}
            placeholder="Optional details about this expense"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setForm(emptyForm)}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}