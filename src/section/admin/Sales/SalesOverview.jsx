import React, { useEffect } from "react";
import { TrendingUp, ShoppingBag, CreditCard } from "lucide-react";
import { useSalesStore } from "../../../store";

export default function SalesOverview() {
  const { overview, topProducts, loading, getOverview, getTopSellingProducts } = useSalesStore();

  useEffect(() => {
    getOverview();
    getTopSellingProducts(5);
  }, [getOverview, getTopSellingProducts]);

  const cards = [
    {
      title: "Gross Revenue",
      value: `₹${(overview?.totalRevenue ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      change: overview?.revenueChangePct != null ? `${overview.revenueChangePct > 0 ? "+" : ""}${overview.revenueChangePct}%` : "—",
      desc: "vs last week",
      icon: TrendingUp,
      color: "text-green-600 bg-green-50",
    },
    {
      title: "Total Transactions",
      value: overview?.totalTransactions ?? 0,
      change: overview?.transactionChangePct != null ? `${overview.transactionChangePct > 0 ? "+" : ""}${overview.transactionChangePct}%` : "—",
      desc: "vs last week",
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Average Ticket",
      value: `₹${(overview?.avgTicket ?? 0).toFixed(2)}`,
      change: overview?.avgTicketChangePct != null ? `${overview.avgTicketChangePct > 0 ? "+" : ""}${overview.avgTicketChangePct}%` : "—",
      desc: "vs last week",
      icon: CreditCard,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  if (loading && !overview) {
    return <div className="text-center text-xs text-[#8B6A4F] py-10">Loading overview…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-[#E8D5C0] shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-[#8B6A4F] uppercase tracking-wider">{card.title}</p>
                <h3 className="text-2xl font-bold text-[#2D1400] mt-2">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-xs">
              <span className={`font-bold ${String(card.change).startsWith("+") ? "text-green-600" : card.change === "—" ? "text-gray-400" : "text-red-500"}`}>
                {card.change}
              </span>
              <span className="text-[#8B6A4F]">{card.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#E8D5C0]">
        <h3 className="text-sm font-bold text-[#2D1400] mb-4">Top Selling Products</h3>
        {(!topProducts || topProducts.length === 0) ? (
          <p className="text-xs text-[#8B6A4F]">No sales data yet.</p>
        ) : (
          <div className="space-y-4">
            {topProducts.map((prod, idx) => {
              const maxQty = Math.max(...topProducts.map((p) => p.qtySold ?? p.qty ?? 0), 1);
              const pct = Math.round(((prod.qtySold ?? prod.qty ?? 0) / maxQty) * 100);
              return (
                <div key={prod._id ?? idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#2D1400]">{prod.name ?? prod.itemName}</span>
                    <span className="text-[#8B6A4F]">
                      ₹{(prod.revenue ?? 0).toLocaleString("en-IN")} ({prod.qtySold ?? prod.qty ?? 0} sold)
                    </span>
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