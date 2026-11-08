import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, Search } from "lucide-react";
import { useExpenseStore } from "../../../store/expensesStore";

/* ---------- helpers ---------- */
const inr = (n) => "₹" + Math.round(n || 0).toLocaleString("en-IN");

const parseDate = (d) => {
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [year, month, day] = d.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(d);
};

const dayKey = (d) => {
  const dt = parseDate(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
    dt.getDate()
  ).padStart(2, "0")}`;
};

const prettyDay = (key) =>
  new Date(key + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const shortDay = (d) =>
  parseDate(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

// category can be a populated object or a bare id string
const getCatId = (e) =>
  typeof e.category === "object" ? e.category?._id : e.category;

const monthValue = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

// { kg: 25, pcs: 10 } -> "25 kg · 10 pcs"
const fmtQty = (obj) => {
  const parts = Object.entries(obj)
    .filter(([, v]) => v > 0)
    .map(([u, v]) => `${Math.round(v * 100) / 100} ${u}`);
  return parts.length ? parts.join(" · ") : "—";
};

const BRANCHES = ["VK Bakes", "Morning Star Cafe"];

const PERIODS = [
  { id: "this", label: "This month" },
  { id: "last", label: "Last month" },
  { id: "3m", label: "Last 3 months" },
  { id: "custom", label: "Pick month" },
  { id: "all", label: "All time" },
];

/**
 * Props (all optional):
 *  categoryId – pre-select a category when the page opens
 *  onBack     – shows a Back button if provided
 */
export default function DailyExpenses({ categoryId = null, onBack }) {
  const {
    expenses = [],
    categories = [],
    fetchAllExpenses,
    fetchExpenses,
    fetchCategories,
  } = useExpenseStore();

  const [view, setView] = useState("day");
  const [period, setPeriod] = useState(categoryId ? "all" : "this");
  const [customMonth, setCustomMonth] = useState(monthValue());
  const [catFilter, setCatFilter] = useState(categoryId || "all");
  const [branch, setBranch] = useState("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState({});
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadExpenses = fetchAllExpenses || fetchExpenses;

    loadExpenses?.()
      .then(() => {
        if (!cancelled) {
          setLoadError("");
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err?.response?.data?.message || err?.message || "Failed to load expenses");
          setIsLoading(false);
        }
      });
    fetchCategories?.();

    return () => {
      cancelled = true;
    };
  }, [fetchAllExpenses, fetchExpenses, fetchCategories]);

  const activeCat = catFilter === "all" ? null : catFilter;

  // [from, to) date range for the selected period
  const range = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    if (period === "this") return [new Date(y, m, 1), null];
    if (period === "last") return [new Date(y, m - 1, 1), new Date(y, m, 1)];
    if (period === "3m") return [new Date(y, m - 2, 1), null];
    if (period === "custom" && customMonth) {
      const [cy, cm] = customMonth.split("-").map(Number);
      return [new Date(cy, cm - 1, 1), new Date(cy, cm, 1)];
    }
    return [null, null];
  }, [period, customMonth]);

  const catName = useMemo(() => {
    const map = {};
    categories.forEach((c) => (map[c._id] = c.name));
    return (e) =>
      (typeof e.category === "object" && e.category?.name) ||
      map[getCatId(e)] ||
      "Uncategorised";
  }, [categories]);

  const heading = activeCat
    ? categories.find((c) => c._id === activeCat)?.name || "Expenses"
    : "Daily Expenses";

  /* filtered rows */
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expenses
      .filter((e) => !e.isDeleted)
      .filter((e) => (activeCat ? getCatId(e) === activeCat : true))
      .filter((e) => (branch === "all" ? true : e.branch === branch))
      .filter((e) => {
        const t = parseDate(e.expenseDate);
        return (
          !Number.isNaN(t.getTime()) &&
          (!range[0] || t >= range[0]) &&
          (!range[1] || t < range[1])
        );
      })
      .filter((e) => (q ? (e.title || "").toLowerCase().includes(q) : true))
      .map((e) => ({
        id: e._id,
        date: e.expenseDate,
        day: dayKey(e.expenseDate),
        title: (e.title || "Unnamed").trim(),
        key: (e.title || "Unnamed").trim().toLowerCase(),
        amount: Number(e.amount) || 0,
        quantity: Number(e.quantity) || 0,
        unit: e.unit || "pcs",
        pricePerUnit: Number(e.pricePerUnit) || 0,
        vendor: e.vendor || "",
        branch: e.branch,
        payment: e.paymentMethod,
        status: e.status,
        category: catName(e),
      }));
  }, [expenses, activeCat, branch, range, query, catName]);

  const total = rows.reduce((s, r) => s + r.amount, 0);
  const pendingTotal = rows
    .filter((r) => r.status === "Pending")
    .reduce((s, r) => s + r.amount, 0);

  /* same product (same title) stats */
  const itemStats = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      const s = (map[r.key] ||= {
        name: r.title,
        times: 0,
        total: 0,
        last: r.date,
        qty: {},
        categories: new Set(),
      });
      s.times += 1;
      s.total += r.amount;
      s.qty[r.unit] = (s.qty[r.unit] || 0) + r.quantity;
      s.categories.add(r.category);
      if (new Date(r.date) > new Date(s.last)) s.last = r.date;
    });
    return map;
  }, [rows]);

  const repeatedList = useMemo(
    () =>
      Object.values(itemStats)
        .filter((item) => item.times > 1)
        .sort((a, b) => b.times - a.times || b.total - a.total),
    [itemStats]
  );

  /* day-wise */
  const days = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      const d = (map[r.day] ||= { day: r.day, total: 0, list: [] });
      d.total += r.amount;
      d.list.push(r);
    });
    return Object.values(map).sort((a, b) => (a.day < b.day ? 1 : -1));
  }, [rows]);
  const allDaysOpen = days.length > 0 && days.every((d) => open["d" + d.day] ?? true);

  /* category -> items (only used when not opened from a single category) */
  const categoryGroups = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      const g = (map[r.category] ||= { name: r.category, total: 0, count: 0, items: {} });
      g.total += r.amount;
      g.count += 1;
      const it = (g.items[r.key] ||= { name: r.title, times: 0, total: 0, qty: {} });
      it.times += 1;
      it.total += r.amount;
      it.qty[r.unit] = (it.qty[r.unit] || 0) + r.quantity;
    });
    return Object.values(map)
      .map((g) => ({ ...g, items: Object.values(g.items).sort((a, b) => b.total - a.total) }))
      .sort((a, b) => b.total - a.total);
  }, [rows]);

  const views = activeCat
    ? [
        { id: "day", label: "Day-wise" },
        { id: "items", label: "Repeated items" },
      ]
    : [
        { id: "day", label: "Day-wise" },
        { id: "items", label: "Repeated items" },
        { id: "category", label: "Category-wise" },
      ];

  const curView = activeCat && view === "category" ? "day" : view;

  const toggle = (k, defaultOpen = false) =>
    setOpen((o) => ({ ...o, [k]: !(o[k] ?? defaultOpen) }));

  /* ---------- UI ---------- */
  return (
    <div className="min-h-full bg-[#FFF8F0] p-4 md:p-6">
      {/* header */}
      <div className="flex items-start gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="mt-0.5 rounded-lg border border-[#E8D5C0] bg-white p-2 text-[#8B6A4F] hover:text-[#2D1400]"
            aria-label="Back to categories"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-[#2D1400]">{heading}</h1>
          <p className="mt-1 text-sm text-[#8B6A4F]">
            {rows.length} expenses · {inr(total)} total · {repeatedList.length} repeated{" "}
            {repeatedList.length === 1 ? "item" : "items"}
            {pendingTotal > 0 && ` · ${inr(pendingTotal)} pending`}
          </p>
        </div>
      </div>

      {/* filters */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl border border-[#E8D5C0] bg-white p-1">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                period === p.id
                  ? "bg-[#2D1400] text-white"
                  : "text-[#8B6A4F] hover:text-[#2D1400]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {period === "custom" && (
          <input
            type="month"
            value={customMonth}
            onChange={(e) => setCustomMonth(e.target.value)}
            className="rounded-lg border border-[#E8D5C0] bg-white px-3 py-2 text-sm text-[#2D1400]"
          />
        )}

        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="rounded-lg border border-[#E8D5C0] bg-white px-3 py-2 text-sm text-[#2D1400]"
        >
          <option value="all">Both branches</option>
          {BRANCHES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="rounded-lg border border-[#E8D5C0] bg-white px-3 py-2 text-sm text-[#2D1400]"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="relative min-w-[200px] flex-1 md:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8B6A4F]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search item (e.g. Maida)"
            className="w-full rounded-lg border border-[#E8D5C0] bg-white py-2 pl-9 pr-3 text-sm text-[#2D1400] placeholder:text-[#8B6A4F]/60"
          />
        </div>
      </div>

      {/* view tabs */}
      <div className="mt-5 inline-flex rounded-xl border border-[#E8D5C0] bg-white p-1">
        {views.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              curView === v.id ? "bg-[#F5A623] text-white" : "text-[#8B6A4F] hover:text-[#2D1400]"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {loadError && rows.length > 0 && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load all expenses: {loadError}
        </div>
      )}

      {rows.length === 0 && (
        <div className="mt-8 rounded-2xl border border-[#E8D5C0] bg-white p-10 text-center text-sm text-[#8B6A4F]">
          {isLoading
            ? "Loading expenses..."
            : loadError || "No expenses found for these filters. Try another period or category."}
        </div>
      )}

      {/* DAY-WISE */}
      {curView === "day" && rows.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex justify-end">
            <button
              onClick={() =>
                setOpen((current) => ({
                  ...current,
                  ...Object.fromEntries(days.map((d) => ["d" + d.day, !allDaysOpen])),
                }))
              }
              className="text-sm font-medium text-[#8B6A4F] hover:text-[#2D1400]"
            >
              {allDaysOpen ? "Collapse all days" : "Expand all days"}
            </button>
          </div>
          <div className="space-y-3">
            {days.map((d) => {
              const isOpen = open["d" + d.day] ?? true;
              return (
                <div key={d.day} className="overflow-hidden rounded-2xl border border-[#E8D5C0] bg-white">
                  <button
                    onClick={() => toggle("d" + d.day, true)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <div>
                      <p className="font-semibold text-[#2D1400]">{prettyDay(d.day)}</p>
                      <p className="text-xs text-[#8B6A4F]">{d.list.length} expenses</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-[#2D1400]">{inr(d.total)}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-[#8B6A4F] transition ${isOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <ul className="divide-y divide-[#F3E7D8] border-t border-[#F3E7D8]">
                      {d.list.map((r) => {
                        const times = itemStats[r.key]?.times || 1;
                        return (
                          <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[#2D1400]">
                                {r.title}
                                {times > 1 && (
                                  <span className="ml-2 rounded-full bg-[#FFF3D6] px-2 py-0.5 text-xs font-normal text-[#B97800]">
                                    bought {times}× in period
                                  </span>
                                )}
                                {r.status === "Pending" && (
                                  <span className="ml-2 rounded-full bg-[#FFF3D6] px-2 py-0.5 text-xs font-normal text-[#B97800]">
                                    pending
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-[#8B6A4F]">
                                {[
                                  r.quantity > 0 && `${r.quantity} ${r.unit}`,
                                  r.pricePerUnit > 0 && `@ ${inr(r.pricePerUnit)}/${r.unit}`,
                                  r.vendor,
                                  !activeCat && r.category,
                                  r.branch,
                                  r.payment,
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-[#2D1400]">{inr(r.amount)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* REPEATED ITEMS */}
      {curView === "items" && rows.length > 0 && (
        <div className="mt-4">
          {repeatedList.length === 0 ? (
            <div className="rounded-2xl border border-[#E8D5C0] bg-white p-8 text-center text-sm text-[#8B6A4F]">
              No repeated items found for these filters.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#E8D5C0] bg-white">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-[#F3E7D8] text-left text-[#8B6A4F]">
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium">Times bought</th>
                    <th className="px-4 py-3 font-medium">Total qty</th>
                    <th className="px-4 py-3 font-medium">Total spent</th>
                    <th className="px-4 py-3 font-medium">Avg / time</th>
                    <th className="px-4 py-3 font-medium">Last bought</th>
                  </tr>
                </thead>
                <tbody>
                  {repeatedList.map((s) => (
                    <tr key={s.name} className="border-b border-[#F8EFE3] last:border-0">
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-[#2D1400]">{s.name}</p>
                        {!activeCat && (
                          <p className="text-xs text-[#8B6A4F]">{[...s.categories].join(", ")}</p>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            s.times > 1 ? "bg-[#F5A623] text-white" : "bg-[#F3E7D8] text-[#8B6A4F]"
                          }`}
                        >
                          {s.times}×
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[#2D1400]">{fmtQty(s.qty)}</td>
                      <td className="px-4 py-2.5 font-semibold text-[#2D1400]">{inr(s.total)}</td>
                      <td className="px-4 py-2.5 text-[#2D1400]">{inr(s.total / s.times)}</td>
                      <td className="px-4 py-2.5 text-[#8B6A4F]">{shortDay(s.last)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CATEGORY-WISE (only when not opened from one category) */}
      {curView === "category" && !activeCat && rows.length > 0 && (
        <div className="mt-4 space-y-3">
          {categoryGroups.map((g) => {
            const isOpen = open["c" + g.name] ?? false;
            const pct = total ? ((g.total / total) * 100).toFixed(1) : 0;
            return (
              <div key={g.name} className="overflow-hidden rounded-2xl border border-[#E8D5C0] bg-white">
                <button onClick={() => toggle("c" + g.name)} className="w-full px-4 py-3 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#2D1400]">{g.name}</p>
                      <p className="text-xs text-[#8B6A4F]">
                        {g.count} expenses · {g.items.length} items · {pct}% of spend
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-[#2D1400]">{inr(g.total)}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-[#8B6A4F] transition ${isOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-[#F3E7D8]">
                    <div className="h-1.5 rounded-full bg-[#F5A623]" style={{ width: `${pct}%` }} />
                  </div>
                </button>

                {isOpen && (
                  <ul className="divide-y divide-[#F3E7D8] border-t border-[#F3E7D8]">
                    {g.items.map((it) => (
                      <li key={it.name} className="flex items-center justify-between px-4 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-[#2D1400]">{it.name}</p>
                          <p className="text-xs text-[#8B6A4F]">
                            bought {it.times}× · {fmtQty(it.qty)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-[#2D1400]">{inr(it.total)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}