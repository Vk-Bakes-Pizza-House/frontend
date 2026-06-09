import { useState, useEffect } from "react";
import {
  LayoutDashboard, ChevronDown, UtensilsCrossed, ShoppingBag,
  Star, LogOut, Menu as MenuIcon, X,
} from "lucide-react";

import { NAV } from "../../section/admin/Nav";
import { AdminShell } from "../../section/admin/AdminShell";
import { useReviewStore, useOrderStore } from "../../store";
import { useNavigate } from "react-router-dom";

// Design Token Color Configs mapped directly for structural lookup reference
export const C = {
  bg: "bg-[#FFF8F0]",
  dark: "text-[#1A0A00]",
  mid: "text-[#2D1400]",
  red: "text-[#D44B1A]",
  muted: "text-[#8B6A4F]",
  border: "border-[#E8D5C0]",
  card: "bg-white",
  sidebar: "bg-[#1A0A00]",
};

const STATUS_CLASSES = {
  Delivered: "bg-green-100 text-green-800",
  Preparing: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Cancelled: "bg-red-100 text-red-800",
};

// ── NEW ADMIN PROFILE COMPONENT VIA SIDENAVBAR ──────────────────────────────



// Mocking NAV configuration array layer wrapper. Ensure this is imported or accessible within your project data structure



// ── MAIN APPLICATION SHELL CONTAINER ──


// ── Stat card ────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, colorHex }) {
  return (
    <div className="bg-white border border-[#E8D5C0] rounded-2xl p-5 flex gap-4 items-start shadow-xs hover:shadow-md transition-all duration-200">
      <div
        style={{ backgroundColor: `${colorHex}15` }}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-sans font-extrabold text-[#2D1400] text-2xl tracking-tight leading-none">{value}</div>
        <div className="font-sans font-bold text-[#2D1400] text-sm mt-1.5 truncate">{label}</div>
        <div className="font-sans text-[#8B6A4F] text-[11px] mt-0.5 truncate">{sub}</div>
      </div>
    </div>
  );
}

// ── Dashboard page ───────────────────────────────────────────
export default function Dashboard() {
  const { orders, stats, loading: ordersLoading, fetchOrders, fetchStats } = useOrderStore();
  const { pendingCount } = useReviewStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchOrders({ page: 1, limit: 5 });
  }, [fetchStats, fetchOrders]);

  const todayStats = stats ? {
    totalOrders: stats.totalOrders || 0,
    pendingOrders: orders.filter(o => o.status === 'Pending').length,
    completedToday: orders.filter(o => o.status === 'Delivered').length,

  } : { totalOrders: 0, pendingOrders: 0, completedToday: 0, revenue: 0 
    
  };



  const RECENT_ORDERS_DATA = orders.slice(0, 5).map(o => ({
    id: o._id,
    customer: o.customer?.name || "Unknown",
    items: o.items?.map(i => `${i.name} × ${i.qty}`).join(", ") || "",
    total: `₹${o.total || 0}`,
    status: o.status,
    date: new Date(o.createdAt).toLocaleDateString("en-IN")
  }));

  const allRevenue = RECENT_ORDERS_DATA.reduce((sum, o) => sum + parseInt(o.total.replace('₹', '')), 0);
  const todayRevenue = orders.reduce((sum, o) => {
    const isToday = new Date(o.createdAt).toDateString() === new Date().toDateString();
    return sum + (isToday ? parseInt(o.total || 0) : 0);
  }, 0);
  const STATS_DATA = [
    { label: "Revenue", value: `₹${allRevenue}`, sub: "Total revenue generated", icon: "💰", colorHex: "#D44B1A" },
    { label: "Today's Orders", value: todayStats.totalOrders.toString(), sub: "Total orders received", icon: "🛒", colorHex: "#D44B1A" },
    { label: "Pending", value: todayStats.pendingOrders.toString(), sub: "Awaiting confirmation", icon: "⏳", colorHex: "#D97706" },
    { label: "Completed Today", value: todayStats.completedToday.toString(), sub: `₹${todayRevenue} revenue`, icon: "✅", colorHex: "#16A34A" },
    { label: "Pending Reviews", value: pendingCount.toString(), sub: "Awaiting approval", icon: "⭐", colorHex: "#F5A623" },
  ];
  return (
    <div className="flex flex-col gap-6">

      {/* Welcome Title Segment */}
      <div>
        <h2 className="font-serif text-[#2D1400] text-2xl font-black">Good morning! 👋</h2>
        <p className="font-sans text-[#8B6A4F] text-xs mt-1">
          Here's what's happening at VK Bakes & Pizza House today.
          {ordersLoading && <span className="text-[#D44B1A] font-semibold animate-pulse"> (Updating live...)</span>}
        </p>
      </div>

      {/* Stat Grid Grid Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS_DATA.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Recent Orders Data Grid Layout Box Container */}
      <div className="bg-white border border-[#E8D5C0] rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-[#E8D5C0] flex justify-between items-center bg-[#FFF8F4]/30">
          <span className="font-sans font-bold text-[#2D1400] text-sm">Recent Orders</span>
          <button onClick={() => navigate("/admin/orders")} className="font-sans text-xs text-[#D44B1A] font-bold hover:underline">
            View all →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#FFF8F4] border-b border-[#E8D5C0]">
                {["Order", "Customer", "Items", "Total", "Status", "Time"].map(h => (
                  <th key={h} className="p-3.5 font-sans font-bold text-[11px] text-[#8B6A4F] tracking-wider uppercase whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D5C0]">
              {RECENT_ORDERS_DATA.map((o, i) => (
                <tr key={o.id} className={`hover:bg-[#FFF8F4]/20 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-[#FEFAF7]"}`}>
                  <td className="p-3.5 font-sans font-bold text-[#D44B1A] text-xs max-w-[100px] truncate">{o.id}</td>
                  <td className="p-3.5 font-sans text-[#2D1400] text-sm font-medium whitespace-nowrap">{o.customer}</td>
                  <td className="p-3.5 font-sans text-[#8B6A4F] text-xs max-w-[220px] truncate">{o.items}</td>
                  <td className="p-3.5 font-sans font-bold text-[#2D1400] text-sm whitespace-nowrap">{o.total}</td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_CLASSES[o.status] || "bg-gray-100 text-gray-700"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3.5 font-sans text-[#8B6A4F] text-xs whitespace-nowrap">{o.date}</td>
                </tr>
              ))}
              {RECENT_ORDERS_DATA.length === 0 && !ordersLoading && (
                <tr>
                  <td colSpan={6} className="p-10 text-center font-sans text-sm text-[#8B6A4F]">
                    No orders processed yet today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Action Operations Panels Bar */}
      <div className="bg-white border border-[#E8D5C0] rounded-2xl p-5 shadow-xs">
        <div className="font-sans font-bold text-[#2D1400] text-sm mb-3.5">Quick Actions</div>
        <div className="flex gap-2.5 flex-wrap">
          {[
            { label: "Add Menu Item", emoji: "➕", action: () => navigate("/admin/menu") },
            { label: "Manage Orders", emoji: "📋", action: () => navigate("/admin/orders") },
            { label: "Approve Reviews", emoji: "⭐", action: () => navigate("/admin/reviews") },
          ].map(a => (
            <button
              key={a.label}
              onClick={a.action}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8D5C0] hover:border-[#D44B1A] hover:bg-[#FFF8F0] rounded-xl font-sans text-xs font-bold text-[#2D1400] transition-all shadow-xs"
            >
              <span>{a.emoji}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}