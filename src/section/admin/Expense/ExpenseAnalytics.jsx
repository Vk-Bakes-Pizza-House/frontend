import { useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { useExpenseStore } from "../../../store/expensesStore";

const COLORS = ["#D97706", "#F59E0B", "#FBBF24", "#B45309", "#92400E", "#78350F", "#FCD34D", "#EA580C"];

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function ExpenseAnalytics() {
  const { analytics, loading, getExpenseAnalytics } = useExpenseStore();

  useEffect(() => {
    getExpenseAnalytics();
  }, [getExpenseAnalytics]);

  if (loading && !analytics) {
    return <div className="text-sm text-gray-400 py-12 text-center">Loading analytics...</div>;
  }

  if (!analytics || (analytics.categoryData?.length ?? 0) === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl py-12 text-center text-gray-400 text-sm">
        No expense data yet — add a few expenses to see analytics here.
      </div>
    );
  }

  const { totalSpend, monthlySpend, pendingCount, topCategory, categoryData, branchData, monthlyData, yearlyData } = analytics;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="This Year's Spend" value={formatINR(totalSpend)} />
        <SummaryCard label="This Month" value={formatINR(monthlySpend)} />
        <SummaryCard label="Pending" value={pendingCount} />
        <SummaryCard label="Top Category" value={topCategory} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Spend by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => formatINR(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

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

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Spend by Month</h3>
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

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Spend by Year</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatINR(v)} />
              <Bar dataKey="total" fill="#D97706" radius={[6, 6, 0, 0]} />
            </BarChart>
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