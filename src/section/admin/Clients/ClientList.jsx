import { useEffect, useMemo, useState } from "react";
import { Download, Search, Users, IndianRupee, FileClock, Wallet, LayoutList, LayoutGrid, Phone, Clock, Pencil, Trash2, Truck } from "lucide-react";
import { useClientStore } from "../../../store/clientStore";
import { CATEGORIES, TERMS, STATUS, inr, initials } from "./clientConstants";

const PAGE_SIZE = 6;
const control =
  "rounded-lg border border-[#E8D5C0] bg-white px-3 py-2.5 text-sm text-[#2D1400] focus:border-[#F5A623] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30";

function Stat({ icon: Icon, label, value, note, warn }) {
  return (
    <div className="rounded-2xl border border-[#E8D5C0] bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[#8B6A4F] sm:text-sm">{label}</p>
        <span className="rounded-lg bg-[#F5A623]/15 p-2 text-[#2D1400]"><Icon size={15} /></span>
      </div>
      <p className="mt-2 text-xl font-bold text-[#2D1400] sm:text-2xl">{value}</p>
      <p className={`mt-0.5 text-xs ${warn ? "text-red-600" : "text-[#8B6A4F]"}`}>{note}</p>
    </div>
  );
}

const Badge = ({ status }) => {
  const s = STATUS[status] ?? STATUS.active;
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>{s.label}</span>;
};

const Avatar = ({ name }) => (
  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5A623]/25 text-xs font-bold text-[#2D1400]">
    {initials(name)}
  </span>
);

function Actions({ c, onEdit, onDelete }) {
  return (
    <div className="flex gap-1">
      <button onClick={() => onEdit(c)} aria-label={`Edit ${c.businessName}`} className="rounded-lg p-2 text-[#8B6A4F] hover:bg-[#E8D5C0]/60 hover:text-[#2D1400]"><Pencil size={15} /></button>
      <button onClick={() => onDelete(c)} aria-label={`Delete ${c.businessName}`} className="rounded-lg p-2 text-[#8B6A4F] hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
    </div>
  );
}

function ClientCard({ c, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border border-[#E8D5C0] bg-white p-4">
      <div className="flex items-start gap-3">
        <Avatar name={c.businessName} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[#2D1400]">{c.businessName}</p>
          <p className="text-xs text-[#8B6A4F]">{c.category} · {c.area}</p>
        </div>
        <Badge status={c.status} />
      </div>
      <div className="mt-3 space-y-1 text-sm">
        <p className="flex items-center gap-1.5 text-[#2D1400]"><Phone size={13} className="text-[#8B6A4F]" />{c.contactName} · {c.phone}</p>
        <p className="flex items-center gap-1.5 text-[#8B6A4F]"><Clock size={13} className="text-[#F5A623]" />{(c.days || []).join(", ")} · {c.deliveryTime}</p>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-[#E8D5C0] pt-3">
        <div>
          <p className="text-xs text-[#8B6A4F]">{c.creditTerms}</p>
          <p className="font-bold text-[#2D1400]">{inr(c.balanceDue)} <span className="text-xs font-normal text-[#8B6A4F]">due</span></p>
        </div>
        <Actions c={c} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}

export default function ClientList({ onAdd, onEdit }) {
  const { clients, loading, fetchClients, deleteClient } = useClientStore();
  const [view, setView] = useState("table");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [terms, setTerms] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => { fetchClients(); }, [fetchClients]);
  useEffect(() => { setPage(1); }, [q, cat, terms, status]);

  const filtered = useMemo(() => clients.filter((c) =>
    (!q || `${c.businessName} ${c.contactName} ${c.phone}`.toLowerCase().includes(q.toLowerCase())) &&
    (!cat || c.category === cat) && (!terms || c.creditTerms === terms) && (!status || c.status === status)
  ), [clients, q, cat, terms, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    // Keep the selected page valid when results are removed.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage((currentPage) => Math.min(currentPage, pages));
  }, [pages]);

  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => ({
    active: clients.filter((c) => c.status === "active").length,
    ytd: clients.reduce((s, c) => s + (c.ytd || 0), 0),
    due: clients.reduce((s, c) => s + (c.balanceDue || 0), 0),
    review: clients.filter((c) => c.status === "review").length,
    credit: clients.filter((c) => c.creditTerms?.startsWith("Net")).length,
  }), [clients]);

  const upcoming = useMemo(() =>
    clients.filter((c) => c.status === "active").sort((a, b) => (a.deliveryTime || "").localeCompare(b.deliveryTime || "")).slice(0, 4),
  [clients]);

  const onDelete = (c) => { if (window.confirm(`Remove ${c.businessName}?`)) deleteClient(c._id); };

  const exportCsv = () => {
    const head = ["Business", "Category", "Contact", "Phone", "Terms", "Balance due", "YTD", "Status"];
    const serializeCsvValue = (value) => {
      const text = String(value ?? "");
      const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safeText.replace(/"/g, '""')}"`;
    };
    const lines = filtered.map((c) => [c.businessName, c.category, c.contactName, c.phone, c.creditTerms, c.balanceDue, c.ytd, c.status].map(serializeCsvValue).join(","));
    const url = URL.createObjectURL(new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" }));
    Object.assign(document.createElement("a"), { href: url, download: "wholesale-clients.csv" }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat icon={Users} label="Active clients" value={stats.active} note={`${clients.length} total`} />
        <Stat icon={IndianRupee} label="Billed this year" value={inr(stats.ytd)} note="Year to date" />
        <Stat icon={FileClock} label="Outstanding" value={inr(stats.due)} note={`${stats.review} in credit review`} warn={stats.review > 0} />
        <Stat icon={Wallet} label="On credit" value={stats.credit} note="Net 15 / 30 / 45" />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#E8D5C0] bg-white p-3 sm:gap-3">
        <div className="relative min-w-[180px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6A4F]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, contact or phone" className={`${control} w-full pl-9`} />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className={control} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={terms} onChange={(e) => setTerms(e.target.value)} className={control} aria-label="Payment terms">
          <option value="">All terms</option>
          {TERMS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={control} aria-label="Status">
          <option value="">All statuses</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <div className="hidden rounded-lg border border-[#E8D5C0] p-0.5 md:flex">
          {[["table", LayoutList], ["grid", LayoutGrid]].map(([v, Icon]) => (
            <button key={v} aria-label={`${v} view`} onClick={() => setView(v)} className={`rounded-md p-2 ${view === v ? "bg-[#2D1400] text-[#F5A623]" : "text-[#8B6A4F]"}`}><Icon size={16} /></button>
          ))}
        </div>
        <button onClick={exportCsv} className="flex items-center gap-2 rounded-lg border border-[#E8D5C0] px-3 py-2.5 text-sm font-semibold text-[#2D1400] hover:border-[#F5A623]">
          <Download size={15} /> <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E8D5C0] bg-white">
        {loading ? (
          <p className="p-10 text-center text-sm text-[#8B6A4F]">Loading clients…</p>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold text-[#2D1400]">{clients.length ? "No clients match these filters" : "No wholesale clients yet"}</p>
            <p className="mt-1 text-sm text-[#8B6A4F]">{clients.length ? "Try clearing a filter." : "Add your first cafe or restaurant to start tracking."}</p>
            {!clients.length && <button onClick={onAdd} className="mt-4 rounded-lg bg-[#2D1400] px-4 py-2.5 text-sm font-semibold text-[#FFF8F0]">Add client</button>}
          </div>
        ) : (
          <>
            <div className={`grid gap-3 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3 ${view === "table" ? "md:hidden" : ""}`}>
              {rows.map((c) => <ClientCard key={c._id} c={c} onEdit={onEdit} onDelete={onDelete} />)}
            </div>

            {view === "table" && (
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="bg-[#E8D5C0]/40 text-xs font-semibold text-[#8B6A4F]">
                    <tr>{["Client", "Contact", "Order schedule", "Credit terms", "Balance / YTD", "Status", ""].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8D5C0]">
                    {rows.map((c) => (
                      <tr key={c._id} className="align-top hover:bg-[#FFF8F0]">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={c.businessName} />
                            <div><p className="font-semibold text-[#2D1400]">{c.businessName}</p><p className="text-xs text-[#8B6A4F]">{c.category} · {c.area}</p></div>
                          </div>
                        </td>
                        <td className="px-4 py-4"><p className="font-medium text-[#2D1400]">{c.contactName}</p><p className="text-xs text-[#8B6A4F]">{c.phone}</p></td>
                        <td className="px-4 py-4"><p className="font-medium text-[#2D1400]">{(c.days || []).join(" / ")} · {c.deliveryTime}</p><p className="max-w-[220px] text-xs text-[#8B6A4F]">{c.items}</p></td>
                        <td className="px-4 py-4"><p className="font-semibold text-[#2D1400]">{c.creditTerms}</p><p className="text-xs text-[#8B6A4F]">{c.creditLimit ? `${inr(c.creditLimit)} limit` : "No credit"}</p></td>
                        <td className="px-4 py-4"><p className="font-bold text-[#2D1400]">{inr(c.balanceDue)}</p><p className="text-xs text-[#8B6A4F]">YTD {inr(c.ytd)}</p></td>
                        <td className="px-4 py-4"><Badge status={c.status} /></td>
                        <td className="px-4 py-3"><Actions c={c} onEdit={onEdit} onDelete={onDelete} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        <div className="flex flex-col items-center justify-between gap-2 border-t border-[#E8D5C0] bg-[#FFF8F0] px-4 py-3 text-sm text-[#8B6A4F] sm:flex-row">
          <span>Showing {rows.length} of {filtered.length} clients</span>
          <div className="flex items-center gap-1">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg px-3 py-1.5 disabled:opacity-40">Prev</button>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`h-8 w-8 rounded-lg font-semibold ${page === i + 1 ? "bg-[#2D1400] text-[#F5A623]" : "text-[#2D1400] hover:bg-[#E8D5C0]/60"}`}>{i + 1}</button>
            ))}
            <button disabled={page === pages} onClick={() => setPage(page + 1)} className="rounded-lg px-3 py-1.5 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="rounded-2xl border border-[#E8D5C0] bg-white p-5">
          <h2 className="flex items-center gap-2 font-bold text-[#2D1400]"><Truck size={17} className="text-[#F5A623]" /> Upcoming bulk deliveries</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {upcoming.map((c) => (
              <div key={c._id} className="flex items-center gap-3 rounded-xl bg-[#FFF8F0] p-3">
                <span className="rounded-lg border border-[#E8D5C0] bg-white px-2.5 py-1.5 text-sm font-bold text-[#2D1400]">{c.deliveryTime}</span>
                <div className="min-w-0"><p className="truncate text-sm font-semibold text-[#2D1400]">{c.businessName}</p><p className="truncate text-xs text-[#8B6A4F]">{c.items}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}