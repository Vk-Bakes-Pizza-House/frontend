import { useState } from "react";
import { PlusCircle, History, LayoutGrid, BarChart3 } from "lucide-react";
import AddExpense from "./AddExpense";
import ExpenseHistory from "./ExpenseHistory";
import ExpenseCategories from "./ExpenseCategories";
import ExpenseAnalytics from "./ExpenseAnalytics";

const TABS = [
  { key: "add", label: "Add Expense", icon: PlusCircle, Component: AddExpense },
  { key: "history", label: "Expense History", icon: History, Component: ExpenseHistory },
  { key: "categories", label: "Categories", icon: LayoutGrid, Component: ExpenseCategories },
  { key: "analytics", label: "Analytics", icon: BarChart3, Component: ExpenseAnalytics },
];

export default function ManageExpenses() {
  const [active, setActive] = useState("history");
  const ActiveComponent = TABS.find((t) => t.key === active)?.Component;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Expenses</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track spending across VK Bakes and Morning Star Cafe.
        </p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Expense sections">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = key === active;
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "border-amber-600 text-amber-700"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {ActiveComponent && (
        <ActiveComponent onDone={() => setActive("history")} />
      )}
    </div>
  );
}