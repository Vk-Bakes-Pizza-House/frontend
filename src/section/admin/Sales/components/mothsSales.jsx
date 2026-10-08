import  { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

const parseSaleDate = (value) => {
  if (typeof value === "string") {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  return new Date(value);
};

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// Every product sold in each of the last 12 months (newest month first)
const buildMonthlyProducts = (sales) => {
  const now = new Date();
  const months = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: monthKey(d),
      label: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      isCurrent: i === 0,
      sales: 0,
      units: 0,
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
    bucket.sales += 1;
    bucket.revenue += Number(rec.grandTotal ?? 0);
    for (const it of rec.items || []) {
      if (!it.name) continue;
      const qty = Number(it.quantity ?? 0);
      const amount = Number(it.total ?? it.subtotal ?? Number(it.price ?? 0) * qty);
      const p = bucket.products.get(it.name) || { name: it.name, qty: 0, revenue: 0 };
      p.qty += qty;
      p.revenue += amount;
      bucket.products.set(it.name, p);
      bucket.units += qty;
    }
  }

  return months.map((m) => ({
    ...m,
    list: Array.from(m.products.values()).sort((a, b) => b.qty - a.qty),
  }));
};

export default function MonthlyProductBreakdown({ sales }) {
  const months = useMemo(() => buildMonthlyProducts(sales), [sales]);
  const [open, setOpen] = useState(() => new Set([monthKey(new Date())]));

  const withSales = months.filter((m) => m.sales > 0);
  const allOpen = withSales.length > 0 && withSales.every((m) => open.has(m.key));

  const toggle = (key) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleAll = () => setOpen(allOpen ? new Set() : new Set(withSales.map((m) => m.key)));

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E8D5C0]">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#2D1400]">Products sold each month</h3>
          <p className="text-xs text-[#8B6A4F] mt-0.5">Every product sold in the last 12 months, highest quantity first.</p>
        </div>
        {withSales.length > 0 && (
          <button
            type="button"
            onClick={toggleAll}
            className="rounded-lg border border-[#E8D5C0] px-3 py-1.5 text-xs font-bold text-[#8B6A4F] hover:text-[#2D1400] hover:bg-[#FFF8F0]"
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        )}
      </div>

      {withSales.length === 0 ? (
        <p className="text-xs text-[#8B6A4F]">No sales recorded in the last 12 months.</p>
      ) : (
        <ul className="divide-y divide-[#E8D5C0]/60 border-y border-[#E8D5C0]/60">
          {months.map((m) => {
            const empty = m.sales === 0;
            const isOpen = open.has(m.key);
            const maxQty = Math.max(...m.list.map((p) => p.qty), 1);
            return (
              <li key={m.key}>
                <button
                  type="button"
                  disabled={empty}
                  onClick={() => toggle(m.key)}
                  aria-expanded={isOpen}
                  className={`flex w-full items-center gap-3 py-3 text-left ${empty ? "cursor-default" : "hover:bg-[#FFF8F0]"}`}
                >
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform ${empty ? "text-[#D8C4AE]" : "text-[#8B6A4F]"} ${isOpen ? "" : "-rotate-90"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className={`text-sm font-bold ${empty ? "text-[#A58B73]" : "text-[#2D1400]"}`}>{m.label}</span>
                    {m.isCurrent && (
                      <span className="ml-2 rounded-full bg-[#F5A623]/20 px-2 py-0.5 text-[11px] font-bold text-[#A8680A]">This month</span>
                    )}
                    <span className="block text-xs text-[#8B6A4F]">
                      {empty
                        ? "No sales"
                        : `${m.sales} sale${m.sales > 1 ? "s" : ""} · ${m.list.length} product${m.list.length > 1 ? "s" : ""} · ${m.units} units`}
                    </span>
                  </span>
                  {!empty && <span className="pr-1 text-sm font-black text-[#2D1400]">{inr(m.revenue)}</span>}
                </button>

                {isOpen && !empty && (
                  <div className="space-y-3 pb-4 pl-7 pr-1">
                    {m.list.map((p) => (
                      <div key={p.name} className="space-y-1">
                        <div className="flex justify-between gap-3 text-xs font-medium">
                          <span className="text-[#2D1400]">{p.name}</span>
                          <span className="shrink-0 text-[#8B6A4F]">
                            {p.qty} sold{p.revenue > 0 ? ` · ${inr(p.revenue)}` : ""}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#FFF8F0]">
                          <div className="h-full rounded-full bg-[#F5A623]" style={{ width: `${(p.qty / maxQty) * 100}%` }} />
                        </div>
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
  );
}