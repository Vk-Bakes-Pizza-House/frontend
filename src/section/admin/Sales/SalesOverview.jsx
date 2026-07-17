import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell,
} from "recharts";
import { useSalesStore } from "../../../store";

const SOURCE_COLORS = { WhatsApp: "#25D366", Counter: "#F5A623", Instagram: "#E1306C", Other: "#8B6A4F" };
const PAYMENT_COLORS = { Cash: "#F5A623", UPI: "#7C3AED", Card: "#2563EB", "Bank Transfer": "#059669" };

export default function SalesOverview() {
  const { overview, topProducts, loading, getOverview, getTopSellingProducts } = useSalesStore();
  const [trendRange, setTrendRange] = useState("week"); // "week" | "month"

  useEffect(() => {
    getOverview();
    getTopSellingProducts(5);
  }, [getOverview, getTopSellingProducts]);

  if (loading && !overview) {
    return <div className="text-center text-xs text-[#8B6A4F] py-10">Loading overview…</div>;
  }

  const rawTrend = trendRange === "week" ? overview?.last7DaysTrend : overview?.last30DaysTrend;
  const trendData = (rawTrend || []).map((d) => ({
    date: new Date(d._id).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    total: d.total,
  }));

  const sourceData = (overview?.saleTypeBreakdown || []).map((s) => ({ name: s._id, total: s.total, count: s.count }));
  const paymentData = (overview?.paymentMethodBreakdown || []).map((p) => ({ name: p._id, total: p.total, count: p.count }));

  const ComparisonCard = ({ title, current, previous, pctChange, previousLabel }) => (
    <div className="bg-white p-6 rounded-2xl border border-[#E8D5C0] shadow-xs">
      <p className="text-xs font-semibold text-[#8B6A4F] uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-[#2D1400] mt-2">₹{current.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h3>
      <div className="flex items-center gap-1.5 mt-3 text-xs">
        {pctChange >= 0 ? <TrendingUp size={14} className="text-green-600" /> : <TrendingDown size={14} className="text-red-500" />}
        <span className={`font-bold ${pctChange >= 0 ? "text-green-600" : "text-red-500"}`}>{pctChange > 0 ? "+" : ""}{pctChange}%</span>
        <span className="text-[#8B6A4F]">vs {previousLabel} (₹{previous.toLocaleString("en-IN")})</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <ComparisonCard title="Today's Sales" current={overview?.todayTotal ?? 0} previous={overview?.yesterdayTotal ?? 0} pctChange={overview?.todayVsYesterdayPct ?? 0} previousLabel="yesterday" />
        <ComparisonCard title="This Week's Sales" current={overview?.thisWeekTotal ?? 0} previous={overview?.lastWeekTotal ?? 0} pctChange={overview?.weekVsLastWeekPct ?? 0} previousLabel="last week" />
        <ComparisonCard title="This Month's Sales" current={overview?.thisMonthTotal ?? 0} previous={overview?.lastMonthTotal ?? 0} pctChange={overview?.monthVsLastMonthPct ?? 0} previousLabel="last month" />
      </div>

      {/* Pending Payments Alert */}
      {overview?.pendingPayments?.count > 0 && (
        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs font-medium">
          <AlertCircle size={16} className="shrink-0" />
          <span>
            {overview.pendingPayments.count} sale{overview.pendingPayments.count > 1 ? "s" : ""} pending/partial payment —
            ₹{overview.pendingPayments.total.toLocaleString("en-IN")} yet to be collected.
          </span>
        </div>
      )}

      {/* Trend Chart with Week/Month toggle */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8D5C0]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-[#2D1400]">
            {trendRange === "week" ? "Last 7 Days Trend" : "Last 30 Days Trend"}
          </h3>
          <div className="flex gap-1.5 bg-[#FFF8F0] p-1 rounded-xl border border-[#E8D5C0]/60">
            {[{ key: "week", label: "Week" }, { key: "month", label: "Month" }].map((t) => (
              <button
                key={t.key}
                onClick={() => setTrendRange(t.key)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  trendRange === t.key ? "bg-white text-[#2D1400] shadow-xs" : "text-[#8B6A4F] hover:text-[#2D1400]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {trendData.length === 0 ? (
          <p className="text-xs text-[#8B6A4F]">No sales data in this period.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#8B6A4F" }}
                interval={trendRange === "month" ? 3 : 0}
              />
              <YAxis tick={{ fontSize: 11, fill: "#8B6A4F" }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip formatter={(v) => [`₹${Number(v).toFixed(2)}`, "Sales"]} contentStyle={{ borderRadius: 8, borderColor: "#E8D5C0", fontSize: 12 }} />
              <Line type="monotone" dataKey="total" stroke="#F5A623" strokeWidth={2.5} dot={trendRange === "week"} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Order Source + Payment Method side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-[#E8D5C0]">
          <h3 className="text-sm font-bold text-[#2D1400] mb-4">By Order Source</h3>
          {sourceData.length === 0 ? <p className="text-xs text-[#8B6A4F]">No data yet.</p> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sourceData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#8B6A4F" }} tickFormatter={(v) => `₹${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#2D1400", fontWeight: 700 }} width={70} />
                <Tooltip formatter={(v, k, p) => [`₹${Number(v).toFixed(2)} (${p.payload.count})`, p.payload.name]} contentStyle={{ borderRadius: 8, borderColor: "#E8D5C0", fontSize: 12 }} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                  {sourceData.map((e, i) => <Cell key={i} fill={SOURCE_COLORS[e.name] ?? "#8B6A4F"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E8D5C0]">
          <h3 className="text-sm font-bold text-[#2D1400] mb-4">By Payment Method</h3>
          {paymentData.length === 0 ? <p className="text-xs text-[#8B6A4F]">No data yet.</p> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={paymentData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#8B6A4F" }} tickFormatter={(v) => `₹${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#2D1400", fontWeight: 700 }} width={70} />
                <Tooltip formatter={(v, k, p) => [`₹${Number(v).toFixed(2)} (${p.payload.count})`, p.payload.name]} contentStyle={{ borderRadius: 8, borderColor: "#E8D5C0", fontSize: 12 }} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                  {paymentData.map((e, i) => <Cell key={i} fill={PAYMENT_COLORS[e.name] ?? "#8B6A4F"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8D5C0]">
        <h3 className="text-sm font-bold text-[#2D1400] mb-4">Top Selling Products</h3>
        {(!topProducts || topProducts.length === 0) ? <p className="text-xs text-[#8B6A4F]">No sales data yet.</p> : (
          <div className="space-y-4">
            {topProducts.map((prod, idx) => {
              const maxQty = Math.max(...topProducts.map((p) => p.qtySold ?? p.quantity ?? 0), 1);
              const pct = Math.round(((prod.qtySold ?? prod.quantity ?? 0) / maxQty) * 100);
              return (
                <div key={prod._id ?? idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#2D1400]">{prod.name}</span>
                    <span className="text-[#8B6A4F]">₹{(prod.revenue ?? 0).toLocaleString("en-IN")} ({prod.qtySold ?? prod.quantity ?? 0} sold)</span>
                  </div>
                  <div className="w-full h-2 bg-[#FFF8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#F5A623]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}