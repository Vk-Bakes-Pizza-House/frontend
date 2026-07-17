import React, { useState, useEffect, useMemo } from "react";
import { Calendar, DollarSign, TrendingUp, ChevronDown, ChevronRight } from "lucide-react";
import useSalesStore from "../../../store/salesStore";

// ── Helpers to build a group key + label for each granularity ──
const getGroupKey = (date, granularity) => {
  const d = new Date(date);
  if (granularity === "Day") {
    return d.toISOString().slice(0, 10); // yyyy-mm-dd
  }
  if (granularity === "Week") {
    // ISO week: Monday as start
    const temp = new Date(d);
    const dayNum = (temp.getDay() + 6) % 7; // Mon=0..Sun=6
    temp.setDate(temp.getDate() - dayNum);
    temp.setHours(0, 0, 0, 0);
    return temp.toISOString().slice(0, 10); // week start date as key
  }
  if (granularity === "Month") {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  return String(d.getFullYear()); // Year
};

const getGroupLabel = (key, granularity) => {
  if (granularity === "Day") {
    return new Date(key).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  }
  if (granularity === "Week") {
    const start = new Date(key);
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
  const { sales, loading, fetchAll } = useSalesStore();

  useEffect(() => {
    if (typeof fetchAll === "function") fetchAll();
  }, [fetchAll]);

  // ── Group sales by selected granularity ──
  const groups = useMemo(() => {
    if (!sales || !sales.length) return [];

    const map = new Map();

    for (const rec of sales) {
      if (!rec.createdAt) continue;
      const d = new Date(rec.createdAt);
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
        const d = new Date(rec.createdAt);
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
    </div>
  );
}