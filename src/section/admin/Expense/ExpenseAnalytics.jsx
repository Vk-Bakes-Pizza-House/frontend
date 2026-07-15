import { useEffect, useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { useExpenseStore } from "../../../store/expensesStore";

const COLORS = ["#D97706", "#F59E0B", "#FBBF24", "#B45309", "#92400E", "#78350F", "#FCD34D", "#EA580C"];

const formatINR = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const getCategoryLabel = (category) => {
  if (!category) return "Uncategorized";
  if (typeof category === "object") return category.name || "Uncategorized";
  return category;
};

export default function ExpenseAnalytics() {
  const { expenses, loading, fetchExpenses } = useExpenseStore();

  useEffect(() => {
    fetchExpenses?.();
  }, [fetchExpenses]);
console.log("expenses", expenses);
  const active = useMemo(() => expenses.filter((e) => !e.isDeleted), [expenses]);

  const { totalSpend, avgExpense, pendingCount, topCategory } = useMemo(() => {
    const total = active.reduce((s, e) => s + Number(e.amount || 0), 0);
    const pending = active.filter((e) => e.status === "Pending").length;
    const byCategory = {};
    active.forEach((e) => {
      const label = getCategoryLabel(e.category);
      byCategory[label] = (byCategory[label] || 0) + Number(e.amount || 0);
    });
    const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    return {
      totalSpend: total,
      avgExpense: active.length ? total / active.length : 0,
      pendingCount: pending,
      topCategory: top ? top[0] : "-",
    };
  }, [active]);

  const categoryData = useMemo(() => {
    const map = {};
    active.forEach((e) => {
      const label = getCategoryLabel(e.category);
      map[label] = (map[label] || 0) + Number(e.amount || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [active]);

  const branchData = useMemo(() => {
    const map = {};
    active.forEach((e) => {
      map[e.branch] = (map[e.branch] || 0) + Number(e.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [active]);

  const monthlyData = useMemo(() => {
    const map = {};
    active.forEach((e) => {
      const d = new Date(e.expenseDate);
      const key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      map[key] = (map[key] || 0) + Number(e.amount || 0);
    });
    return Object.entries(map)
      .map(([month, total]) => ({ month, total, sortKey: new Date(month) }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ month, total }) => ({ month, total }));
  }, [active]);

  const paymentData = useMemo(() => {
    const map = {};
    active.forEach((e) => {
      map[e.paymentMethod] = (map[e.paymentMethod] || 0) + Number(e.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [active]);

  if (loading) {
    return <div className="text-sm text-gray-400 py-12 text-center">Loading analytics...</div>;
  }

  if (active.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl py-12 text-center text-gray-400 text-sm">
        No expense data yet — add a few expenses to see analytics here.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Spend" value={formatINR(totalSpend)} />
        <SummaryCard label="Avg. Expense" value={formatINR(avgExpense)} />
        <SummaryCard label="Pending" value={pendingCount} />
        <SummaryCard label="Top Category" value={topCategory} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Spend by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatINR(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Branch comparison */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Spend by Branch</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={branchData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatINR(v)} />
              <Bar dataKey="value" fill="#D97706" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly trend */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatINR(v)} />
              <Bar dataKey="total" fill="#F59E0B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment method split */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={paymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {paymentData.map((_, i) => (
                  <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatINR(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900 mt-1 truncate">{value}</p>
    </div>
  );
}