import { useState } from "react";
import { Users, UserPlus } from "lucide-react";
import ClientList from "./ClientList";
import AddClient from "./AddClient";

// Tabbed shell — same pattern as ManageExpenses
export default function ManageClients() {
  const [tab, setTab] = useState("list");
  const [editing, setEditing] = useState(null);

  const tabs = [
    { id: "list", label: "All Clients", icon: Users },
    { id: "add", label: editing ? "Edit Client" : "Add Client", icon: UserPlus },
  ];

  const goList = () => { setEditing(null); setTab("list"); };
  const goAdd = () => { setEditing(null); setTab("add"); };
  const goEdit = (c) => { setEditing(c); setTab("add"); };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-[#8B6A4F]">Client Management</p>
          <h1 className="text-2xl font-bold text-[#2D1400] sm:text-3xl">Wholesale Clients</h1>
          <p className="mt-1 text-sm text-[#8B6A4F]">Cafes, restaurants and shops you supply in bulk — schedules, credit terms and balances.</p>
        </div>

        <div role="tablist" className="inline-flex w-full rounded-xl border border-[#E8D5C0] bg-white p-1 sm:w-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => (id === "list" ? goList() : editing ? setTab("add") : goAdd())}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none ${
                tab === id ? "bg-[#2D1400] text-[#FFF8F0]" : "text-[#8B6A4F] hover:text-[#2D1400]"
              }`}
            >
              <Icon size={15} className={tab === id ? "text-[#F5A623]" : ""} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "list" ? (
        <ClientList onAdd={goAdd} onEdit={goEdit} />
      ) : (
        <AddClient editing={editing} onDone={goList} onCancel={goList} />
      )}
    </div>
  );
}