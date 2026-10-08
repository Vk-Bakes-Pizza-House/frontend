import React, { useEffect, useMemo, useState } from "react";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, LabelList,
} from "recharts";
import { useSalesStore } from "../../../store";
import  MonthlyProductBreakdown from "./components/mothsSales"

const parseSaleDate = (value) => {
  if (typeof value === "string") {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  return new Date(value);
};

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

// Last 12 months: sales count, revenue and top-selling product for each month
const buildMonthlyStats = (sales) => {
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: monthKey(d),
      month: d.toLocaleDateString("en-IN", { month: "short" }),
      fullLabel: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      isCurrent: i === 0,
      count: 0,
      revenue: 0,
      products: new Map(),
    });
  }
  const byKey = new Map(months.map((m) => [m.key, m]));

  for (const rec of sales || []) {
    const raw = rec.saleDate || rec.createdAt;
    if (!raw) continue;
    const d = parseSaleDate(raw);
    if (isNaN(d.getTime())) continue;
    const bucket = byKey.get(monthKey(d));
    if (!bucket) continue;
    bucket.count += 1;
    bucket.revenue += Number(rec.grandTotal ?? 0);
    for (const it of rec.items || []) {
      if (!it.name) continue;
      bucket.products.set(it.name, (bucket.products.get(it.name) || 0) + Number(it.quantity ?? 0));
    }
  }

  return months.map((m) => {
    let topName = "";
    let topQty = 0;
    m.products.forEach((qty, name) => {
      if (qty > topQty) { topQty = qty; topName = name; }
    });
    return {
      key: m.key,
      month: m.month,
      fullLabel: m.fullLabel,
      isCurrent: m.isCurrent,
      count: m.count,
      revenue: m.revenue,
      topName: topName || "No sales",
      topQty,
      topLabel: topName ? `${topName} (${topQty})` : "No sales",
    };
  });
};

const MonthTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-[#E8D5C0] bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-bold text-[#2D1400]">{d.fullLabel}</p>
      <p className="mt-1 text-[#8B6A4F]">
        {d.count} sale{d.count === 1 ? "" : "s"} · ₹{d.revenue.toLocaleString("en-IN")}
      </p>
      <p className="mt-0.5 text-[#8B6A4F]">
        Top product: <span className="font-bold text-[#2D1400]">{d.topName}</span>
        {d.topQty > 0 && ` (${d.topQty} sold)`}
      </p>
    </div>
  );
};

export default function SalesOverview() {
  const { overview, topProducts, sales, loading, getOverview, getTopSellingProducts, fetchAllSales } = useSalesStore();
  const [trendRange, setTrendRange] = useState("week"); // "week" | "month"

  useEffect(() => {
    getOverview();
    getTopSellingProducts(5);
    if (typeof fetchAllSales === "function") fetchAllSales();
  }, [getOverview, getTopSellingProducts, fetchAllSales]);

  const monthlyStats = useMemo(() => buildMonthlyStats(sales), [sales]);
  const hasMonthlySales = monthlyStats.some((m) => m.count > 0);
  const maxTopQty = Math.max(...monthlyStats.map((m) => m.topQty), 1);

  if (loading && !overview) {
    return <div className="text-center text-xs text-[#8B6A4F] py-10">Loading overview…</div>;
  }

  const rawTrend = trendRange === "week" ? overview?.last7DaysTrend : overview?.last30DaysTrend;
  const trendData = (rawTrend || []).map((d) => ({
    date: new Date(d._id).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    total: d.total,
  }));

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

      <div className="bg-white p-6 rounded-2xl border border-[#E8D5C0]">
       
        <MonthlyProductBreakdown sales={sales} />
      </div>

    </div>
  );
}