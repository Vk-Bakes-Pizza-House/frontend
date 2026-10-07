import React, { useState, useEffect, useMemo } from "react";
import { Calendar, DollarSign, TrendingUp, ChevronDown, ChevronRight, Pencil, X } from "lucide-react";
import useSalesStore from "../../../store/salesStore";

const SALE_TYPES = ["WhatsApp", "Counter", "Instagram", "Other"];
const BRANCHES = ["VK Bakes", "Morning Star Cafe"];
const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Bank Transfer"];
const PAYMENT_STATUSES = ["Paid", "Pending", "Partial"];

const formatLocalDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const parseSaleDate = (value) => {
  if (typeof value === "string") {
    const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateOnly) {
      return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
    }
  }
  return new Date(value);
};

// ── Helpers to build a group key + label for each granularity ──
const getGroupKey = (date, granularity) => {
  const d = parseSaleDate(date);
  if (granularity === "Day") {
    return formatLocalDateKey(d);
  }
  if (granularity === "Week") {
    // ISO week: Monday as start
    const temp = new Date(d);
    const dayNum = (temp.getDay() + 6) % 7; // Mon=0..Sun=6
    temp.setDate(temp.getDate() - dayNum);
    temp.setHours(0, 0, 0, 0);
    return formatLocalDateKey(temp);
  }
  if (granularity === "Month") {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  return String(d.getFullYear()); // Year
};

const getGroupLabel = (key, granularity) => {
  if (granularity === "Day") {
    return parseSaleDate(key).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  }
  if (granularity === "Week") {
    const start = parseSaleDate(key);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} – ${end.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`;
  }
  if (granularity === "Month") {
    const [year, month] = key.split("-");
    return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  }
  return key; // Year
};

export default function SalesHistory() {
  const [timeframe, setTimeframe] = useState("Month");
  const [expandedKey, setExpandedKey] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const { sales, loading, fetchAll, updateSale } = useSalesStore();

  useEffect(() => {
    if (typeof fetchAll === "function") fetchAll();
  }, [fetchAll]);

  // ── Group sales by selected granularity ──
  const groups = useMemo(() => {
    if (!sales || !sales.length) return [];

    const map = new Map();

    for (const rec of sales) {
      const saleDate = rec.saleDate || rec.createdAt;
      if (!saleDate) continue;
      const d = parseSaleDate(saleDate);
      if (isNaN(d.getTime())) continue;

      const key = getGroupKey(d, timeframe);
      if (!map.has(key)) {
        map.set(key, { key, label: getGroupLabel(key, timeframe), total: 0, count: 0, records: [] });
      }
      const bucket = map.get(key);
      bucket.total += Number(rec.grandTotal ?? 0);
      bucket.count += 1;
      bucket.records.push(rec);
    }

    // Newest period first
    return Array.from(map.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [sales, timeframe]);

  // ── Overall metrics (today + this month), independent of the group toggle ──
  const { dayTotal, monthTotal } = useMemo(() => {
    if (!sales || !sales.length) return { dayTotal: 0, monthTotal: 0 };
    const now = new Date();
    return sales.reduce(
      (acc, rec) => {
        const d = parseSaleDate(rec.saleDate || rec.createdAt);
        const amount = Number(rec.grandTotal ?? 0);
        if (d.toDateString() === now.toDateString()) acc.dayTotal += amount;
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) acc.monthTotal += amount;
        return acc;
      },
      { dayTotal: 0, monthTotal: 0 }
    );
  }, [sales]);

  const toggleExpand = (key) => setExpandedKey((prev) => (prev === key ? null : key));

  return (
    <div className="space-y-4">
      {/* ── METRICS ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E8D5C0] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#8B6A4F] uppercase tracking-wider">Today's Sales Total</p>
            <h3 className="text-xl font-black text-[#2D1400] mt-1">
              ₹{dayTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-[#F5A623]">
            <DollarSign size={18} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E8D5C0] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#8B6A4F] uppercase tracking-wider">This Month's Sales Total</p>
            <h3 className="text-xl font-black text-[#2D1400] mt-1">
              ₹{monthTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <TrendingUp size={18} />
          </div>
        </div>
      </div>

      {/* ── GRANULARITY TOGGLE ── */}
      <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-4 rounded-xl border border-[#E8D5C0]">
        <div className="flex gap-1.5 bg-[#FFF8F0] p-1 rounded-xl border border-[#E8D5C0]/60">
          {["Day", "Week", "Month", "Year"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTimeframe(t); setExpandedKey(null); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeframe === t ? "bg-white text-[#2D1400] shadow-xs" : "text-[#8B6A4F] hover:text-[#2D1400]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="text-xs font-medium text-[#8B6A4F] flex items-center gap-2">
          <Calendar size={14} /> Grouped by <strong className="text-[#2D1400]">{timeframe}</strong>
        </div>
      </div>

      {/* ── GROUPED LEDGER ── */}
      <div className="bg-white rounded-2xl border border-[#E8D5C0] overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FFF8F0] border-b border-[#E8D5C0] text-xs font-bold text-[#2D1400] uppercase tracking-wider">
              <th className="p-4 w-8"></th>
              <th className="p-4">{timeframe} Period</th>
              <th className="p-4">Transactions</th>
              <th className="p-4 text-right">Total Sales</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8D5C0]/50 text-xs text-[#2D1400]">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-[#8B6A4F] font-medium">
                  Fetching ledger statements from server...
                </td>
              </tr>
            ) : groups.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-[#8B6A4F] font-medium">
                  No sales records found.
                </td>
              </tr>
            ) : (
              groups.map((g) => (
                <React.Fragment key={g.key}>
                  <tr
                    onClick={() => toggleExpand(g.key)}
                    className="hover:bg-[#FFF8F0]/40 transition-colors cursor-pointer"
                  >
                    <td className="p-4 text-[#8B6A4F]">
                      {expandedKey === g.key ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </td>
                    <td className="p-4 font-bold">{g.label}</td>
                    <td className="p-4 text-[#8B6A4F]">{g.count} sale{g.count > 1 ? "s" : ""}</td>
                    <td className="p-4 text-right font-black text-[#2D1400]">
                      ₹{g.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>

                  {expandedKey === g.key && (
                    <tr>
                      <td colSpan={4} className="p-0 bg-[#FFF8F0]/30">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-[10px] font-bold text-[#8B6A4F] uppercase border-b border-[#E8D5C0]/50">
                              <th className="pl-12 py-2">Invoice No.</th>
                              <th className="py-2">Items</th>
                              <th className="py-2">Branch</th>
                              <th className="py-2">Source</th>
                              <th className="py-2 text-right pr-4">Amount</th>
                              <th className="py-2 text-right pr-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E8D5C0]/30">
                            {g.records.map((rec) => (
                              <tr key={rec._id}>
                                <td className="pl-12 py-2 font-mono font-bold text-[#8B6A4F]">{rec.invoiceNo}</td>
                                <td className="py-2 max-w-[220px] truncate">
                                  {(rec.items || []).map((it) => `${it.quantity}x ${it.name}`).join(", ")}
                                </td>
                                <td className="py-2 text-[#8B6A4F]">{rec.branch}</td>
                                <td className="py-2 text-[#8B6A4F]">{rec.saleType}</td>
                                <td className="py-2 text-right pr-4 font-bold">
                                  ₹{Number(rec.grandTotal ?? 0).toFixed(2)}
                                </td>
                                <td className="py-2 text-right pr-4">
                                  <button
                                    type="button"
                                    onClick={() => setEditingSale(rec)}
                                    className="inline-flex p-1.5 rounded-lg text-[#8B6A4F] hover:bg-white hover:text-[#2D1400]"
                                    title={`Edit sale ${rec.invoiceNo}`}
                                    aria-label={`Edit sale ${rec.invoiceNo}`}
                                  >
                                    <Pencil size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      {editingSale && (
        <EditSaleModal
          sale={editingSale}
          onClose={() => setEditingSale(null)}
          onSave={async (data) => {
            await updateSale(editingSale._id, data);
            setEditingSale(null);
          }}
        />
      )}
    </div>
  );
}

function EditSaleModal({ sale, onClose, onSave }) {
  const [form, setForm] = useState({
    customerName: sale.customerName || "",
    customerPhone: sale.customerPhone || "",
    paymentMethod: sale.paymentMethod || "Cash",
    paymentStatus: sale.paymentStatus || "Paid",
    saleType: sale.saleType || "Counter",
    branch: sale.branch || "VK Bakes",
    notes: sale.notes || "",
    saleDate: formatLocalDateKey(parseSaleDate(sale.saleDate || sale.createdAt)),
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const saleUpdateField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      await onSave(form);
    } catch (error) {
      setSaveError(error.message || "Unable to saleUpdate this sale.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSave}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-sale-title"
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white"
      >
        <div className="flex items-center justify-between border-b border-[#E8D5C0] px-5 py-4">
          <div>
            <h3 id="edit-sale-title" className="font-bold text-[#2D1400]">Edit Sale</h3>
            <p className="mt-1 text-xs text-[#8B6A4F]">{sale.invoiceNo}</p>
          </div>
          <button type="button" onClick={onClose} className="text-[#8B6A4F] hover:text-[#2D1400]" aria-label="Close edit sale">
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <label className="text-xs font-bold text-[#8B6A4F]">
            Customer Name
            <input
              required
              value={form.customerName}
              onChange={saleUpdateField("customerName")}
              className="mt-1 w-full rounded-lg border border-[#E8D5C0] px-3 py-2 text-sm font-normal text-[#2D1400]"
            />
          </label>
          <label className="text-xs font-bold text-[#8B6A4F]">
            Customer Phone
            <input
              type="tel"
              value={form.customerPhone}
              onChange={saleUpdateField("customerPhone")}
              className="mt-1 w-full rounded-lg border border-[#E8D5C0] px-3 py-2 text-sm font-normal text-[#2D1400]"
            />
          </label>
          <label className="text-xs font-bold text-[#8B6A4F]">
            Payment Method
            <select value={form.paymentMethod} onChange={saleUpdateField("paymentMethod")} className="mt-1 w-full rounded-lg border border-[#E8D5C0] bg-white px-3 py-2 text-sm font-normal text-[#2D1400]">
              {PAYMENT_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
            </select>

          </label>
           <label className="text-xs font-bold text-[#8B6A4F]">
            Sale Date
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-[#E8D5C0] px-3 py-2 text-sm font-normal text-[#2D1400]"
              value={form.saleDate}
              max={formatLocalDateKey(new Date())}
              onChange={saleUpdateField("saleDate")}
            />
          </label>
          <label className="text-xs font-bold text-[#8B6A4F]">
            Payment Status
            <select value={form.paymentStatus} onChange={saleUpdateField("paymentStatus")} className="mt-1 w-full rounded-lg border border-[#E8D5C0] bg-white px-3 py-2 text-sm font-normal text-[#2D1400]">
              {PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-[#8B6A4F]">
            Order Source
            <select value={form.saleType} onChange={saleUpdateField("saleType")} className="mt-1 w-full rounded-lg border border-[#E8D5C0] bg-white px-3 py-2 text-sm font-normal text-[#2D1400]">
              {SALE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-[#8B6A4F]">
            Branch
            <select value={form.branch} onChange={saleUpdateField("branch")} className="mt-1 w-full rounded-lg border border-[#E8D5C0] bg-white px-3 py-2 text-sm font-normal text-[#2D1400]">
              {BRANCHES.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-[#8B6A4F] sm:col-span-2">
            Notes
            <textarea
              rows={3}
              value={form.notes}
              onChange={saleUpdateField("notes")}
              className="mt-1 w-full rounded-lg border border-[#E8D5C0] px-3 py-2 text-sm font-normal text-[#2D1400]"
            />
          </label>
          {saveError && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{saveError}</p>}
        </div>
        <div className="flex justify-end gap-3 border-t border-[#E8D5C0] px-5 py-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#8B6A4F] hover:text-[#2D1400]">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-lg bg-[#2D1400] px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}