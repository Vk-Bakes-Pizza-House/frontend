import { useState, useEffect, useMemo } from "react";
import {
  Calendar, DollarSign, TrendingUp, ChevronDown, Pencil, X, Receipt, BarChart3,
} from "lucide-react";
import useSalesStore from "../../../store/salesStore";

const SALE_TYPES = ["WhatsApp", "Counter", "Instagram", "Other"];
const BRANCHES = ["VK Bakes", "Morning Star Cafe"];
const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Bank Transfer"];
const PAYMENT_STATUSES = ["Paid", "Pending", "Partial"];

// How many periods each tab shows
const RANGE_INFO = {
  Day: { count: 7, caption: "Last 7 days" },
  Week: { count: 4, caption: "Last 4 weeks" },
  Month: { count: 12, caption: "Last 12 months" },
  Year: { count: null, caption: "All years" },
};

const money = (n, decimals = 2) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;

const formatLocalDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const parseSaleDate = (value) => {
  if (typeof value === "string") {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  return new Date(value);
};

const getGroupKey = (date, granularity) => {
  const d = parseSaleDate(date);
  if (granularity === "Day") return formatLocalDateKey(d);
  if (granularity === "Week") {
    const t = new Date(d);
    t.setDate(t.getDate() - ((t.getDay() + 6) % 7)); // Monday start
    t.setHours(0, 0, 0, 0);
    return formatLocalDateKey(t);
  }
  if (granularity === "Month") return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return String(d.getFullYear());
};

const getGroupLabel = (key, granularity) => {
  if (granularity === "Day")
    return parseSaleDate(key).toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });
  if (granularity === "Week") {
    const s = parseSaleDate(key);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    return `${s.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} – ${e.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`;
  }
  if (granularity === "Month") {
    const [y, m] = key.split("-");
    return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  }
  return key;
};

const getShortLabel = (key, granularity) => {
  if (granularity === "Day")
    return parseSaleDate(key).toLocaleDateString("en-IN", { weekday: "short" });
  if (granularity === "Week")
    return parseSaleDate(key).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  if (granularity === "Month") {
    const [y, m] = key.split("-");
    return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-IN", { month: "short" });
  }
  return key;
};

// Build the fixed list of period keys for each tab (oldest -> newest)
const buildPeriodKeys = (granularity, sales) => {
  const now = new Date();
  const keys = [];
  if (granularity === "Day") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      keys.push(formatLocalDateKey(d));
    }
  } else if (granularity === "Week") {
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
      keys.push(getGroupKey(d, "Week"));
    }
  } else if (granularity === "Month") {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(getGroupKey(d, "Month"));
    }
  } else {
    const years = new Set([String(now.getFullYear())]);
    (sales || []).forEach((r) => {
      const d = parseSaleDate(r.saleDate || r.createdAt);
      if (!isNaN(d.getTime())) years.add(String(d.getFullYear()));
    });
    keys.push(...Array.from(years).sort());
  }
  return keys;
};

export default function SalesHistory() {
  const [timeframe, setTimeframe] = useState("Month");
  const [expandedKey, setExpandedKey] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const { sales, loading, fetchAllSales, updateSale } = useSalesStore();

  useEffect(() => {
    fetchAllSales();
  }, [fetchAllSales]);

  // Fixed-length period list (empty periods show as ₹0 so the range is always complete)
  const groups = useMemo(() => {
    const keys = buildPeriodKeys(timeframe, sales);
    const map = new Map(
      keys.map((key) => [key, { key, label: getGroupLabel(key, timeframe), short: getShortLabel(key, timeframe), total: 0, count: 0, records: [] }])
    );

    for (const rec of sales || []) {
      const saleDate = rec.saleDate || rec.createdAt;
      if (!saleDate) continue;
      const d = parseSaleDate(saleDate);
      if (isNaN(d.getTime())) continue;
      const bucket = map.get(getGroupKey(d, timeframe));
      if (!bucket) continue; // outside the visible range
      bucket.total += Number(rec.grandTotal ?? 0);
      bucket.count += 1;
      bucket.records.push(rec);
    }
    return Array.from(map.values()); // oldest -> newest
  }, [sales, timeframe]);

  const currentKey = useMemo(() => getGroupKey(new Date(), timeframe), [timeframe]);
  const rangeTotal = groups.reduce((s, g) => s + g.total, 0);
  const rangeCount = groups.reduce((s, g) => s + g.count, 0);
  const maxTotal = Math.max(...groups.map((g) => g.total), 1);
  const rows = [...groups].reverse(); // newest first for the list

  const { dayTotal, monthTotal } = useMemo(() => {
    const now = new Date();
    return (sales || []).reduce(
      (acc, rec) => {
        const d = parseSaleDate(rec.saleDate || rec.createdAt);
        const amt = Number(rec.grandTotal ?? 0);
        if (d.toDateString() === now.toDateString()) acc.dayTotal += amt;
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) acc.monthTotal += amt;
        return acc;
      },
      { dayTotal: 0, monthTotal: 0 }
    );
  }, [sales]);

  const toggleExpand = (key) => setExpandedKey((p) => (p === key ? null : key));

  return (
    <div className="space-y-5">
      {/* ── METRICS ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Metric label="Today" value={money(dayTotal)} icon={<DollarSign size={18} />} tone="bg-amber-100 text-[#C77F0A]" />
        <Metric label="This month" value={money(monthTotal)} icon={<TrendingUp size={18} />} tone="bg-sky-100 text-sky-700" />
        <Metric
          label={RANGE_INFO[timeframe].caption}
          value={money(rangeTotal)}
          sub={`${rangeCount} sale${rangeCount === 1 ? "" : "s"}`}
          icon={<Receipt size={18} />}
          tone="bg-emerald-100 text-emerald-700"
        />
      </div>

      {/* ── MAIN PANEL ── */}
      <div className="overflow-hidden rounded-3xl border border-[#E8D5C0] bg-white shadow-[0_8px_30px_-12px_rgba(45,20,0,0.15)]">
        {/* Header: tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6">
          <div>
            <h2 className="text-lg font-black text-[#2D1400]">Sales history</h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#8B6A4F]">
              <Calendar size={13} /> {RANGE_INFO[timeframe].caption}, grouped by {timeframe.toLowerCase()}
            </p>
          </div>
          <div role="tablist" aria-label="Group sales by" className="flex rounded-full bg-[#FFF3E4] p-1">
            {Object.keys(RANGE_INFO).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={timeframe === t}
                type="button"
                onClick={() => { setTimeframe(t); setExpandedKey(null); }}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D1400] ${
                  timeframe === t ? "bg-[#2D1400] text-white shadow-sm" : "text-[#8B6A4F] hover:text-[#2D1400]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Trend chart */}
        <div className="px-5 pb-2 pt-6 sm:px-6">
          <div className="flex items-end gap-1.5 sm:gap-2" style={{ height: 130 }} aria-hidden="true">
            {groups.map((g) => {
              const h = g.total > 0 ? Math.max((g.total / maxTotal) * 100, 6) : 3;
              const isCurrent = g.key === currentKey;
              return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => g.count && toggleExpand(g.key)}
                  title={`${g.label}: ${money(g.total)}`}
                  className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
                >
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      g.total === 0
                        ? "bg-[#F1E4D3]"
                        : isCurrent
                        ? "bg-[#F5A623]"
                        : "bg-[#2D1400]/80 group-hover:bg-[#2D1400]"
                    } ${expandedKey === g.key ? "ring-2 ring-[#F5A623] ring-offset-2" : ""}`}
                    style={{ height: `${h}%` }}
                  />
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex gap-1.5 sm:gap-2">
            {groups.map((g) => (
              <span
                key={g.key}
                className={`min-w-0 flex-1 truncate text-center text-[11px] ${
                  g.key === currentKey ? "font-bold text-[#C77F0A]" : "text-[#8B6A4F]"
                }`}
              >
                {g.short}
              </span>
            ))}
          </div>
        </div>

        {/* Period list */}
        <div className="mt-3 border-t border-[#E8D5C0]/70">
          {loading ? (
            <div className="space-y-3 p-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-[#FFF3E4]" />
              ))}
            </div>
          ) : !sales || sales.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center">
              <BarChart3 size={28} className="text-[#C9A98A]" />
              <p className="font-bold text-[#2D1400]">No sales yet</p>
              <p className="text-sm text-[#8B6A4F]">Sales you record will show up here, grouped by {timeframe.toLowerCase()}.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#E8D5C0]/60">
              {rows.map((g) => {
                const open = expandedKey === g.key;
                const empty = g.count === 0;
                const pct = (g.total / maxTotal) * 100;
                return (
                  <li key={g.key}>
                    <button
                      type="button"
                      disabled={empty}
                      onClick={() => toggleExpand(g.key)}
                      aria-expanded={open}
                      className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-4 px-5 py-4 text-left transition-colors focus:outline-none focus-visible:bg-[#FFF3E4] sm:px-6 ${
                        empty ? "cursor-default" : "hover:bg-[#FFF8F0]"
                      }`}
                    >
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${empty ? "text-[#D8C4AE]" : "bg-[#FFF3E4] text-[#8B6A4F]"}`}>
                        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : "-rotate-90"}`} />
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className={`font-bold ${empty ? "text-[#A58B73]" : "text-[#2D1400]"}`}>{g.label}</span>
                          {g.key === currentKey && (
                            <span className="rounded-full bg-[#F5A623]/20 px-2 py-0.5 text-[11px] font-bold text-[#A8680A]">
                              {timeframe === "Day" ? "Today" : `This ${timeframe.toLowerCase()}`}
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs text-[#8B6A4F]">
                          {empty ? "No sales" : `${g.count} sale${g.count > 1 ? "s" : ""}`}
                        </span>
                        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[#F6EADB]">
                          <span className="block h-full rounded-full bg-[#F5A623]" style={{ width: `${pct}%` }} />
                        </span>
                      </span>
                      <span className={`text-right text-base font-black ${empty ? "text-[#C9B39B]" : "text-[#2D1400]"}`}>
                        {money(g.total)}
                      </span>
                    </button>

                    {open && (
                      <div className="space-y-2 bg-[#FFF8F0] px-4 pb-4 pt-1 sm:px-6">
                        {g.records.map((rec) => (
                          <div
                            key={rec._id}
                            className="flex items-center gap-3 rounded-2xl border border-[#E8D5C0]/80 bg-white p-3 sm:p-4"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="font-mono text-xs font-bold text-[#2D1400]">{rec.invoiceNo}</span>
                                {rec.branch && <Chip>{rec.branch}</Chip>}
                                {rec.saleType && <Chip>{rec.saleType}</Chip>}
                                {rec.paymentStatus && rec.paymentStatus !== "Paid" && (
                                  <Chip warn>{rec.paymentStatus}</Chip>
                                )}
                              </div>
                              <p className="mt-1 truncate text-sm text-[#6B4E37]">
                                {(rec.items || []).map((it) => `${it.quantity}× ${it.name}`).join(", ") || "No items"}
                              </p>
                            </div>
                            <span className="font-black text-[#2D1400]">{money(rec.grandTotal)}</span>
                            <button
                              type="button"
                              onClick={() => setEditingSale(rec)}
                              className="rounded-xl p-2 text-[#8B6A4F] hover:bg-[#FFF3E4] hover:text-[#2D1400] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D1400]"
                              title={`Edit sale ${rec.invoiceNo}`}
                              aria-label={`Edit sale ${rec.invoiceNo}`}
                            >
                              <Pencil size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
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

function Metric({ label, value, sub, icon, tone }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#E8D5C0] bg-white p-5">
      <div>
        <p className="text-sm font-medium text-[#8B6A4F]">{label}</p>
        <h3 className="mt-1 text-2xl font-black text-[#2D1400]">{value}</h3>
        {sub && <p className="mt-0.5 text-xs text-[#8B6A4F]">{sub}</p>}
      </div>
      <div className={`rounded-2xl p-3 ${tone}`}>{icon}</div>
    </div>
  );
}

function Chip({ children, warn }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        warn ? "bg-red-50 text-red-700" : "bg-[#FFF3E4] text-[#8B6A4F]"
      }`}
    >
      {children}
    </span>
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

  const setField = (field) => (e) => setForm((c) => ({ ...c, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      await onSave(form);
    } catch (error) {
      setSaveError(error.message || "Couldn't update this sale. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const input =
    "mt-1.5 w-full rounded-xl border border-[#E8D5C0] bg-white px-3 py-2.5 text-sm font-normal text-[#2D1400] focus:border-[#2D1400] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40";
  const labelCls = "text-sm font-bold text-[#6B4E37]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D1400]/50 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSave}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-sale-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#E8D5C0] px-6 py-5">
          <div>
            <h3 id="edit-sale-title" className="text-lg font-black text-[#2D1400]">Edit sale</h3>
            <p className="mt-0.5 font-mono text-xs text-[#8B6A4F]">{sale.invoiceNo}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-[#8B6A4F] hover:bg-[#FFF3E4] hover:text-[#2D1400]" aria-label="Close edit sale">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          <label className={labelCls}>
            Customer name
            <input required value={form.customerName} onChange={setField("customerName")} className={input} />
          </label>
          <label className={labelCls}>
            Customer phone
            <input type="tel" value={form.customerPhone} onChange={setField("customerPhone")} className={input} />
          </label>
          <label className={labelCls}>
            Payment method
            <select value={form.paymentMethod} onChange={setField("paymentMethod")} className={input}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label className={labelCls}>
            Sale date
            <input type="date" value={form.saleDate} max={formatLocalDateKey(new Date())} onChange={setField("saleDate")} className={input} />
          </label>
          <label className={labelCls}>
            Payment status
            <select value={form.paymentStatus} onChange={setField("paymentStatus")} className={input}>
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className={labelCls}>
            Order source
            <select value={form.saleType} onChange={setField("saleType")} className={input}>
              {SALE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className={labelCls}>
            Branch
            <select value={form.branch} onChange={setField("branch")} className={input}>
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>
          <label className={`${labelCls} sm:col-span-2`}>
            Notes
            <textarea rows={3} value={form.notes} onChange={setField("notes")} className={input} />
          </label>
          {saveError && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{saveError}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-[#E8D5C0] px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-bold text-[#8B6A4F] hover:text-[#2D1400]">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-xl bg-[#2D1400] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}