import React, { useState, useEffect, useMemo } from "react";
import { Calendar, DollarSign, TrendingUp } from "lucide-react";
import useSalesStore from "../../../store/salesStore"; // Ensure path matches your project layout

export default function SalesHistory() {
  const [timeframe, setTimeframe] = useState("Month");
  const { sales, loading, fetchAll, getDailySales } = useSalesStore();

  // Fetch all dependencies when the component mounts
  useEffect(() => {
    if (typeof fetchAll === "function") fetchAll();
    if (typeof getDailySales === "function") getDailySales();
  }, [fetchAll, getDailySales]);

  // ── FILTER HISTORY TRANSACTIONS ──
  const filtered = useMemo(() => {
    if (!sales || !sales.length) return [];
    const now = new Date();

    return sales.filter((rec) => {
      const dateString = rec.createdAt ?? rec.date ?? rec.updatedAt;
      if (!dateString) return false;
      const d = new Date(dateString);

      if (timeframe === "Day") {
        return d.toDateString() === now.toDateString();
      }
      if (timeframe === "Week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo;
      }
      if (timeframe === "Month") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return d.getFullYear() === now.getFullYear(); // Year
    });
  }, [sales, timeframe]);

  // ── LIVE METRIC CALCULATION (Daily vs Monthly Summaries) ──
  const { dayTotal, monthTotal } = useMemo(() => {
    if (!sales || !sales.length) return { dayTotal: 0, monthTotal: 0 };
    const now = new Date();
    
    return sales.reduce(
      (acc, rec) => {
        const dateString = rec.createdAt ?? rec.date ?? rec.updatedAt;
        if (!dateString) return acc;
        const d = new Date(dateString);
        const amount = Number(rec.totalAmount ?? rec.total ?? 0);

        // Check if item belongs to today
        if (d.toDateString() === now.toDateString()) {
          acc.dayTotal += amount;
        }
        // Check if item belongs to current month
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          acc.monthTotal += amount;
        }
        return acc;
      },
      { dayTotal: 0, monthTotal: 0 }
    );
  }, [sales]);

  return (
    <div className="space-y-4">
      {/* ── METRICS DISPLAY ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Daily Sales Card */}
        <div className="bg-white p-4 rounded-xl border border-[#E8D5C0] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#8B6A4F] uppercase tracking-wider">Today's Sales Total</p>
            <h3 className="text-xl font-black text-[#2D1400] mt-1">₹{dayTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-[#F5A623]">
            <DollarSign size={18} />
          </div>
        </div>

        {/* Monthly Sales Card */}
        <div className="bg-white p-4 rounded-xl border border-[#E8D5C0] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#8B6A4F] uppercase tracking-wider">This Month's Sales Total</p>
            <h3 className="text-xl font-black text-[#2D1400] mt-1">₹{monthTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <TrendingUp size={18} />
          </div>
        </div>
      </div>

      {/* ── FILTER NAVIGATION BAR ── */}
      <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-4 rounded-xl border border-[#E8D5C0]">
        <div className="flex gap-1.5 bg-[#FFF8F0] p-1 rounded-xl border border-[#E8D5C0]/60">
          {["Day", "Week", "Month", "Year"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeframe(t)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeframe === t ? "bg-white text-[#2D1400] shadow-xs" : "text-[#8B6A4F] hover:text-[#2D1400]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="text-xs font-medium text-[#8B6A4F] flex items-center gap-2">
          <Calendar size={14} /> Showing entries matching: <strong className="text-[#2D1400]">{timeframe}</strong>
        </div>
      </div>

      {/* ── DATA LEDGER TABLE ── */}
      <div className="bg-white rounded-2xl border border-[#E8D5C0] overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FFF8F0] border-b border-[#E8D5C0] text-xs font-bold text-[#2D1400] uppercase tracking-wider">
              <th className="p-4">Transaction ID</th>
              <th className="p-4">Timestamp Date</th>
              <th className="p-4">Items Summary</th>
              <th className="p-4">Channel Origin</th>
              <th className="p-4 text-right">Settled Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8D5C0]/50 text-xs text-[#2D1400]">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#8B6A4F] font-medium">
                  Fetching ledger statements from server...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#8B6A4F] font-medium">
                  No sales transactions logged for the selected period.
                </td>
              </tr>
            ) : (
              filtered.map((rec) => (
                <tr key={rec._id || rec.id} className="hover:bg-[#FFF8F0]/30 transition-colors">
                  <td className="p-4 font-mono font-bold text-[#8B6A4F] truncate max-w-[120px]">
                    {rec._id || rec.id}
                  </td>
                  <td className="p-4">
                    {new Date(rec.createdAt ?? rec.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4 font-medium max-w-[250px] truncate">
                    {(rec.items || []).map((it) => `${it.qty}x ${it.name}`).join(", ") || "Custom Item"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wide uppercase ${
                        rec.source === "Online" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {rec.source ?? rec.orderType ?? "Counter POS"}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-[#2D1400]">
                    ₹{Number(rec.totalAmount ?? rec.total ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}