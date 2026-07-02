// admin/Sales.jsx
// ─────────────────────────────────────────────────────────────
// Sales Dashboard — Daily, Weekly, Monthly sales + Payment Reports
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import {
  TrendingUp, TrendingDown, IndianRupee, ShoppingBag,
  Calendar, Download, ChevronLeft, ChevronRight,
  BarChart2, ArrowUpRight, ArrowDownRight, Filter,
  CheckCircle, Clock, XCircle, Truck, Eye,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────
const fmt  = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const pct  = (a, b) => b === 0 ? 0 : Math.round(((a - b) / b) * 100);
const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Mock data ──────────────────────────────────────────────────
const TODAY_ORDERS = [
  { id:"#1055", customer:"Priya S.",   items:"Margherita Pizza × 2",       total:418,  status:"Delivered",  time:"9:10 AM",  cat:"pizza" },
  { id:"#1054", customer:"Rahul M.",   items:"Double Pizza Combo",          total:399,  status:"Delivered",  time:"9:45 AM",  cat:"combo" },
  { id:"#1053", customer:"Anita K.",   items:"Paneer Tikka + Ice Cream × 2",total:399,  status:"Preparing",  time:"10:15 AM", cat:"pizza" },
  { id:"#1052", customer:"Suresh P.",  items:"Butterscotch Cake 1kg",       total:370,  status:"Confirmed",  time:"10:40 AM", cat:"cake"  },
  { id:"#1051", customer:"Meena R.",   items:"Veg Bake × 3",                total:267,  status:"Delivered",  time:"11:00 AM", cat:"bake"  },
  { id:"#1050", customer:"Deepa N.",   items:"Bread + Butter Biscuits",     total:70,   status:"Delivered",  time:"11:30 AM", cat:"bread" },
  { id:"#1049", customer:"Kiran T.",   items:"Photo Cake 1lb",              total:499,  status:"Pending",    time:"12:05 PM", cat:"cake"  },
  { id:"#1048", customer:"Arun V.",    items:"Veg Supreme Pizza",           total:249,  status:"Delivered",  time:"12:30 PM", cat:"pizza" },
];

const DAILY_REVENUE  = [3200,4100,2800,5200,4800,6100,5400];
const WEEKLY_REVENUE = [18400,22100,19800,24500,21000,26800,23400];
const MONTHLY_REVENUE= [72000,84000,91000,78000,95000,88000,102000,97000,110000,98000,115000,124000];

const CATEGORY_SALES = [
  { cat:"Pizza",    revenue:48200, orders:142, pct:38, color:"bg-orange-500"  },
  { cat:"Cakes",    revenue:32100, orders:87,  pct:25, color:"bg-pink-500"    },
  { cat:"Combos",   revenue:24800, orders:62,  pct:19, color:"bg-purple-500"  },
  { cat:"Bakes",    revenue:12400, orders:98,  pct:10, color:"bg-amber-500"   },
  { cat:"Ice Cream",revenue:6200,  orders:74,  pct:5,  color:"bg-blue-400"    },
  { cat:"Others",   revenue:3800,  orders:41,  pct:3,  color:"bg-stone-400"   },
];

const PAYMENT_METHODS = [
  { method:"Cash on Delivery", orders:384, revenue:118400, pct:93 },
  { method:"UPI / QR",         orders:29,  revenue:8600,   pct:7  },
];

const STATUS_META = {
  Delivered: { bg:"bg-emerald-50", text:"text-emerald-600", border:"border-emerald-200", icon:CheckCircle },
  Preparing: { bg:"bg-amber-50",   text:"text-amber-600",   border:"border-amber-200",   icon:Clock       },
  Confirmed: { bg:"bg-blue-50",    text:"text-blue-600",    border:"border-blue-200",     icon:Truck       },
  Pending:   { bg:"bg-yellow-50",  text:"text-yellow-600",  border:"border-yellow-200",   icon:Clock       },
  Cancelled: { bg:"bg-red-50",     text:"text-red-500",     border:"border-red-200",      icon:XCircle     },
};

// ── Sub-components ────────────────────────────────────────────

function StatCard({ icon, label, value, sub, trend, trendVal }) {
  const up = trend === "up";
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${icon.bg}`}>{icon.e}</div>
        {trendVal !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
            {up ? <ArrowUpRight size={11}/> : <ArrowDownRight size={11}/>}
            {Math.abs(trendVal)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-stone-800 leading-none mb-1">{value}</p>
      <p className="text-sm font-semibold text-stone-500">{label}</p>
      {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, sub, children }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
      <div>
        <p className="text-base font-bold text-stone-800">{title}</p>
        {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Bar chart ─────────────────────────────────────────────────
function BarChart({ data, labels, color = "bg-orange-500", height = 120 }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="relative w-full">
            <div
              className={`${color} rounded-t-lg w-full transition-all duration-500 group-hover:opacity-80`}
              style={{ height: Math.max(4, (v / max) * (height - 24)) }}
            />
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-stone-800 text-white text-xs font-bold px-1.5 py-0.5 rounded whitespace-nowrap transition-opacity z-10">
              ₹{v.toLocaleString()}
            </div>
          </div>
          <span className="text-xs text-stone-400">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ── Tab pill ──────────────────────────────────────────────────
function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 bg-stone-100 rounded-2xl p-1.5 w-fit">
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${active === t.key ? "bg-white text-orange-600 font-bold shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTIONS
// ─────────────────────────────────────────────────────────────

// ── DAILY ────────────────────────────────────────────────────
function DailySales() {
  const today = new Date();
  const [offset, setOffset] = useState(0);
  const d = new Date(today); d.setDate(d.getDate() - offset);
  const label = offset === 0 ? "Today" : offset === 1 ? "Yesterday" : d.toLocaleDateString("en-IN",{day:"numeric",month:"short"});

  const todayRev  = TODAY_ORDERS.filter(o=>o.status==="Delivered").reduce((s,o)=>s+o.total,0);
  const todayOrds = TODAY_ORDERS.length;
  const delivered = TODAY_ORDERS.filter(o=>o.status==="Delivered").length;

  return (
    <div className="space-y-5">
      {/* Date nav */}
      <div className="flex items-center gap-3">
        <button onClick={() => setOffset(o=>o+1)} className="w-8 h-8 rounded-xl border border-stone-200 bg-white flex items-center justify-center hover:border-orange-300 transition-all">
          <ChevronLeft size={15} className="text-stone-500" />
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl">
          <Calendar size={13} className="text-orange-500" />
          <span className="text-sm font-bold text-stone-700">{label}</span>
        </div>
        <button onClick={() => setOffset(o=>Math.max(0,o-1))} disabled={offset===0} className="w-8 h-8 rounded-xl border border-stone-200 bg-white flex items-center justify-center hover:border-orange-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronRight size={15} className="text-stone-500" />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={{ e:"💰", bg:"bg-orange-50" }} label="Revenue"     value={fmt(todayRev)}  sub="Delivered orders only" trend="up"   trendVal={12} />
        <StatCard icon={{ e:"🛒", bg:"bg-blue-50"   }} label="Orders"      value={todayOrds}       sub="All statuses"          trend="up"   trendVal={8}  />
        <StatCard icon={{ e:"✅", bg:"bg-emerald-50"}} label="Delivered"   value={delivered}        sub={`${Math.round(delivered/todayOrds*100)}% completion`} trend="up" trendVal={5} />
        <StatCard icon={{ e:"💵", bg:"bg-amber-50"  }} label="Avg Order"   value={fmt(Math.round(todayRev/delivered||0))} sub="Per delivered order" />
      </div>

      {/* Hourly trend */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <SectionHeader title="Revenue by Hour" sub={label} />
        <BarChart data={[0,0,420,680,920,540,1100,890,760,1240,980,1360,720,580,890,1040,820,630,490,340,210,120,0,0]} labels={Array.from({length:24},(_,i)=>i%4===0?`${i}h`:"")} height={140} />
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <p className="text-sm font-bold text-stone-800">All Orders — {label}</p>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors">
            <Download size={12}/> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-stone-50">
                {["Order","Customer","Items","Total","Status","Time"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-stone-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TODAY_ORDERS.map((o,i) => {
                const s = STATUS_META[o.status] || STATUS_META.Pending;
                return (
                  <tr key={o.id} className={`border-t border-stone-100 ${i%2?"bg-stone-50/50":"bg-white"}`}>
                    <td className="px-4 py-3 text-xs font-bold text-orange-600">{o.id}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-stone-700 whitespace-nowrap">{o.customer}</td>
                    <td className="px-4 py-3 text-xs text-stone-500 max-w-40 truncate">{o.items}</td>
                    <td className="px-4 py-3 text-sm font-black text-stone-700 whitespace-nowrap">{fmt(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                        <s.icon size={10}/> {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-400 whitespace-nowrap">{o.time}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-stone-200 bg-orange-50">
                <td colSpan={3} className="px-4 py-3 text-xs font-bold text-stone-600">Total (Delivered)</td>
                <td className="px-4 py-3 text-sm font-black text-orange-600">{fmt(todayRev)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── WEEKLY ────────────────────────────────────────────────────
function WeeklySales() {
  const weekRev   = DAILY_REVENUE.reduce((s,v)=>s+v,0);
  const prevWeek  = 28400;
  const trend     = pct(weekRev, prevWeek);
  const todayIdx  = new Date().getDay();
  const weekLabels= days.map((_,i)=>days[(todayIdx - 6 + i + 7) % 7]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={{e:"💰",bg:"bg-orange-50"}} label="This Week"   value={fmt(weekRev)}  sub="vs last week" trend={trend>=0?"up":"down"} trendVal={trend} />
        <StatCard icon={{e:"🛒",bg:"bg-blue-50"  }} label="Orders"      value={52}             sub="Total orders" trend="up" trendVal={6}  />
        <StatCard icon={{e:"📦",bg:"bg-purple-50"}} label="Best Day"    value="Saturday"        sub={fmt(Math.max(...DAILY_REVENUE))} />
        <StatCard icon={{e:"📉",bg:"bg-amber-50" }} label="Slowest Day" value="Sunday"          sub={fmt(Math.min(...DAILY_REVENUE))} />
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <SectionHeader title="Daily Revenue — This Week" sub="Last 7 days">
          <button className="flex items-center gap-1.5 text-xs font-semibold text-orange-600">
            <Download size={12}/> Export
          </button>
        </SectionHeader>
        <BarChart data={DAILY_REVENUE} labels={weekLabels} height={160} />
      </div>

      {/* Day breakdown table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <p className="text-sm font-bold text-stone-800">Day-wise Breakdown</p>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-stone-50">
              {["Day","Revenue","Orders","Avg Order","vs Yesterday"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-stone-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAILY_REVENUE.map((rev, i) => {
              const day    = weekLabels[i];
              const orders = [7,9,6,12,10,14,11][i];
              const prev   = i > 0 ? DAILY_REVENUE[i-1] : null;
              const diff   = prev !== null ? pct(rev, prev) : null;
              const up     = diff !== null && diff >= 0;
              return (
                <tr key={day} className={`border-t border-stone-100 ${i===todayIdx?"bg-orange-50/40":i%2?"bg-stone-50/50":""}`}>
                  <td className="px-4 py-3 text-sm font-bold text-stone-700">
                    {day} {i===todayIdx && <span className="text-xs text-orange-500 font-semibold ml-1">(Today)</span>}
                  </td>
                  <td className="px-4 py-3 text-sm font-black text-stone-800">{fmt(rev)}</td>
                  <td className="px-4 py-3 text-sm text-stone-600">{orders}</td>
                  <td className="px-4 py-3 text-sm text-stone-600">{fmt(Math.round(rev/orders))}</td>
                  <td className="px-4 py-3">
                    {diff !== null ? (
                      <span className={`flex items-center gap-1 text-xs font-bold w-fit ${up?"text-emerald-600":"text-red-500"}`}>
                        {up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} {Math.abs(diff)}%
                      </span>
                    ) : <span className="text-xs text-stone-300">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-stone-200 bg-orange-50">
              <td className="px-4 py-3 text-xs font-bold text-stone-700">Week Total</td>
              <td className="px-4 py-3 text-sm font-black text-orange-600">{fmt(weekRev)}</td>
              <td className="px-4 py-3 text-sm font-bold text-stone-700">69</td>
              <td className="px-4 py-3 text-sm font-bold text-stone-700">{fmt(Math.round(weekRev/69))}</td>
              <td className="px-4 py-3">
                <span className={`flex items-center gap-1 text-xs font-bold w-fit ${trend>=0?"text-emerald-600":"text-red-500"}`}>
                  {trend>=0?<ArrowUpRight size={12}/>:<ArrowDownRight size={12}/>} {Math.abs(trend)}% vs last week
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Category breakdown */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <SectionHeader title="Sales by Category — This Week" />
        <div className="space-y-3">
          {CATEGORY_SALES.map(c => (
            <div key={c.cat}>
              <div className="flex justify-between text-xs font-semibold text-stone-600 mb-1.5">
                <span>{c.cat}</span>
                <span className="text-stone-500">{fmt(Math.round(c.revenue*0.25))} · {Math.round(c.orders*0.25)} orders</span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${c.color} transition-all duration-700`} style={{width:`${c.pct}%`}} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MONTHLY ───────────────────────────────────────────────────
function MonthlySales() {
  const [year, setYear] = useState(new Date().getFullYear());
  const totalYear = MONTHLY_REVENUE.reduce((s,v)=>s+v,0);
  const bestMonth = months[MONTHLY_REVENUE.indexOf(Math.max(...MONTHLY_REVENUE))];
  const avgMonth  = Math.round(totalYear / 12);

  return (
    <div className="space-y-5">
      {/* Year selector */}
      <div className="flex items-center gap-3">
        <button onClick={() => setYear(y=>y-1)} className="w-8 h-8 rounded-xl border border-stone-200 bg-white flex items-center justify-center hover:border-orange-300 transition-all">
          <ChevronLeft size={15} className="text-stone-500"/>
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl">
          <Calendar size={13} className="text-orange-500"/>
          <span className="text-sm font-bold text-stone-700">{year}</span>
        </div>
        <button onClick={() => setYear(y=>Math.min(new Date().getFullYear(),y+1))} className="w-8 h-8 rounded-xl border border-stone-200 bg-white flex items-center justify-center hover:border-orange-300 transition-all disabled:opacity-40">
          <ChevronRight size={15} className="text-stone-500"/>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={{e:"💰",bg:"bg-orange-50"}} label="Yearly Revenue"  value={fmt(totalYear)} sub={`${year}`} trend="up" trendVal={18} />
        <StatCard icon={{e:"📈",bg:"bg-emerald-50"}} label="Best Month"     value={bestMonth}       sub={fmt(Math.max(...MONTHLY_REVENUE))} trend="up" trendVal={21} />
        <StatCard icon={{e:"📊",bg:"bg-blue-50"  }} label="Monthly Avg"    value={fmt(avgMonth)}   sub="Per month avg" />
        <StatCard icon={{e:"🛒",bg:"bg-purple-50"}} label="Total Orders"   value="823"             sub={`${year}`} trend="up" trendVal={14} />
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <SectionHeader title="Monthly Revenue" sub={`Full year ${year}`}>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-orange-600">
            <Download size={12}/> Export
          </button>
        </SectionHeader>
        <BarChart data={MONTHLY_REVENUE} labels={months} color="bg-orange-400" height={180} />
      </div>

      {/* Month by month table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <p className="text-sm font-bold text-stone-800">Month-wise Summary — {year}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-stone-50">
                {["Month","Revenue","Orders","Avg Order","Growth"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-stone-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MONTHLY_REVENUE.map((rev, i) => {
                const prev  = i > 0 ? MONTHLY_REVENUE[i-1] : null;
                const diff  = prev !== null ? pct(rev, prev) : null;
                const orders= [48,56,63,51,67,59,74,68,82,71,89,97][i];
                return (
                  <tr key={months[i]} className={`border-t border-stone-100 ${i%2?"bg-stone-50/50":""}`}>
                    <td className="px-4 py-3 text-sm font-bold text-stone-700">{months[i]} '{String(year).slice(2)}</td>
                    <td className="px-4 py-3 text-sm font-black text-stone-800">{fmt(rev)}</td>
                    <td className="px-4 py-3 text-sm text-stone-600">{orders}</td>
                    <td className="px-4 py-3 text-sm text-stone-600">{fmt(Math.round(rev/orders))}</td>
                    <td className="px-4 py-3">
                      {diff !== null ? (
                        <span className={`flex items-center gap-1 text-xs font-bold w-fit ${diff>=0?"text-emerald-600":"text-red-500"}`}>
                          {diff>=0?<ArrowUpRight size={12}/>:<ArrowDownRight size={12}/>} {Math.abs(diff)}%
                        </span>
                      ) : <span className="text-xs text-stone-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-stone-200 bg-orange-50">
                <td className="px-4 py-3 text-xs font-bold text-stone-700">Year Total</td>
                <td className="px-4 py-3 text-sm font-black text-orange-600">{fmt(totalYear)}</td>
                <td className="px-4 py-3 text-sm font-bold text-stone-700">823</td>
                <td className="px-4 py-3 text-sm font-bold text-stone-700">{fmt(Math.round(totalYear/823))}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── PAYMENT REPORTS ───────────────────────────────────────────
function PaymentReports() {
  const totalRev = 127000;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PAYMENT_METHODS.map(p => (
          <div key={p.method} className="bg-white rounded-2xl border border-stone-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-stone-800">{p.method}</p>
                <p className="text-xs text-stone-400 mt-0.5">{p.orders} orders</p>
              </div>
              <span className="text-2xl">{p.method.includes("Cash")?"💵":"📱"}</span>
            </div>
            <p className="text-3xl font-black text-orange-600 mb-3">{fmt(p.revenue)}</p>
            <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-orange-500 rounded-full transition-all duration-700" style={{width:`${p.pct}%`}}/>
            </div>
            <p className="text-xs text-stone-400">{p.pct}% of total revenue</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <SectionHeader title="Revenue by Category — All Time">
          <button className="flex items-center gap-1.5 text-xs font-semibold text-orange-600">
            <Download size={12}/> Export PDF
          </button>
        </SectionHeader>
        <div className="space-y-4">
          {CATEGORY_SALES.map(c => (
            <div key={c.cat} className="flex items-center gap-4">
              <div className="w-24 flex-shrink-0">
                <p className="text-xs font-bold text-stone-600">{c.cat}</p>
                <p className="text-xs text-stone-400">{c.orders} orders</p>
              </div>
              <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                <div className={`h-full ${c.color} rounded-full transition-all duration-700`} style={{width:`${c.pct}%`}}/>
              </div>
              <div className="w-20 text-right flex-shrink-0">
                <p className="text-sm font-black text-stone-800">{fmt(c.revenue)}</p>
                <p className="text-xs text-stone-400">{c.pct}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary report card */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-6 text-white">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">Financial Summary — Current Year</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { l:"Gross Revenue",  v:fmt(totalRev) },
            { l:"Total Orders",   v:"823"         },
            { l:"Avg Order Value",v:fmt(Math.round(totalRev/823)) },
            { l:"Delivery Fees",  v:fmt(823*20)   },
          ].map(s => (
            <div key={s.l}>
              <p className="text-xs text-stone-400 mb-1">{s.l}</p>
              <p className="text-lg font-black text-white">{s.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function Sales() {
  const [tab, setTab] = useState("daily");

  const tabs = [
    { key:"daily",   label:"Daily Sales"   },
    { key:"weekly",  label:"Weekly Sales"  },
    { key:"monthly", label:"Monthly Sales" },
    { key:"payment", label:"Payment Reports"},
  ];

  const todayRev  = TODAY_ORDERS.filter(o=>o.status==="Delivered").reduce((s,o)=>s+o.total,0);
  const weekRev   = DAILY_REVENUE.reduce((s,v)=>s+v,0);
  const monthRev  = MONTHLY_REVENUE[new Date().getMonth()];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        button { cursor: pointer; border: none; background: none; padding: 0; }
      `}</style>

      <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Header */}
        <div className="bg-white border-b border-stone-200 px-5 py-4">
          <div className="max-w-5xl mx-auto flex items-start justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-stone-800" style={{ fontFamily:"'Playfair Display',serif" }}>Sales</h2>
              <p className="text-xs text-stone-400 mt-0.5">Today {fmt(todayRev)} · Week {fmt(weekRev)} · Month {fmt(monthRev)}</p>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:border-orange-300 hover:text-orange-600 transition-all bg-white">
              <Download size={13}/> Export All
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          {/* Tabs */}
          <Tabs tabs={tabs} active={tab} onChange={setTab} />

          {tab === "daily"   && <DailySales />}
          {tab === "weekly"  && <WeeklySales />}
          {tab === "monthly" && <MonthlySales />}
          {tab === "payment" && <PaymentReports />}
        </div>
      </div>
    </>
  );
}