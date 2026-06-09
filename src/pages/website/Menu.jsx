import { useState, useEffect } from "react";
import { AlertCircle, Search } from "lucide-react";
import ItemCard from "../../components/ItemCard";
import useMenuStore from "../../store/menuStore";

const CATEGORIES = [
  { k: "all",     l: "All Items", e: "🍽️" },
  { k: "pizza",   l: "Pizza",     e: "🍕" },
  { k: "cake",    l: "Cakes",     e: "🎂" },
  { k: "bread",   l: "Bread",     e: "🍞" },
  { k: "toast",   l: "Toast",     e: "🥖" },
  { k: "biscuit", l: "Biscuits",  e: "🍪" },
  { k: "ice",     l: "Ice Cream", e: "🍦" },
];

// Category display order + labels
const CAT_GROUPS = [
  { k: "pizza",   l: "🍕 Pizzas"    },
  { k: "cake",    l: "🎂 Cakes"     },
  { k: "ice",     l: "🍦 Ice Cream" },
  { k: "bread",   l: "🍞 Bread"     },
  { k: "toast",   l: "🥖 Toast"     },
  { k: "biscuit", l: "🍪 Biscuits"  },
  { k: "bake",    l: "🥐 Bakes"     },
];

function Menu() {
  const [cat, setCat]               = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { items, loading, error, fetchMenu } = useMenuStore();

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  // Filter by category + search
  const filteredItems = items
    .filter(i => cat === "all" || i.category === cat)
    .filter(i => {
      if (!searchQuery.trim()) return true;
      const text = `${i.name || ""} ${i.description || ""} ${i.tag || ""}`.toLowerCase();
      return text.includes(searchQuery.toLowerCase());
    });

  // Group by category
  const grouped = CAT_GROUPS.reduce((acc, c) => {
    const list = filteredItems.filter(i => i.category === c.k);
    if (list.length > 0) acc.push({ ...c, list });
    return acc;
  }, []);

  if (loading) return (
    <div className="bg-[#FFF8F0] min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-[#8B6A4F] font-medium">Loading menu...</div>
    </div>
  );

  if (error) return (
    <div className="bg-[#FFF8F0] min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 font-medium mb-4">Error: {error}</p>
        <button onClick={() => fetchMenu()} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-[#FFF8F0] min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <h2 className="text-3xl font-black text-[#2D1400] mb-6 tracking-tight">Our Menu</h2>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar snap-x">
          {CATEGORIES.map(c => (
            <button
              key={c.k}
              onClick={() => setCat(c.k)}
              className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                cat === c.k
                  ? "bg-[#D44B1A] text-white border-transparent shadow-md"
                  : "bg-white text-[#8B6A4F] border-[#E8D5C0] hover:border-[#D44B1A]"
              }`}
            >
              {c.e} {c.l}
            </button>
          ))}
        </div>

        {/* Policy Banner */}
        <div className="bg-[#FFF3E0] border border-[#E8D5C0] rounded-xl p-4 mb-6 flex gap-3 items-start">
          <AlertCircle size={16} className="text-[#D44B1A] shrink-0 mt-0.5" />
          <p className="text-xs text-[#5D3A00] leading-relaxed">
            <span className="font-bold text-[#D44B1A]">Delivery (₹20):</span> Pizza & Cakes only.
            Ice Cream delivers only with main items. Bread & Toast are
            <span className="font-bold ml-1">store pickup only.</span> Cash on delivery.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6A4F]" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search pizza, cake, ice cream..."
            className="w-full rounded-2xl border border-[#E8D5C0] bg-white py-3 pl-11 pr-4 text-sm text-[#2D1400] placeholder:text-[#B59A79] outline-none focus:border-[#D44B1A] focus:ring-2 focus:ring-[#D44B1A]/15"
          />
          {searchQuery.trim() && (
            <p className="mt-2 text-xs text-[#8B6A4F]">
              {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""} found
            </p>
          )}
        </div>

        {/* Grouped Category Sections */}
        {grouped.length > 0 ? (
          grouped.map(group => (
            <div key={group.k} className="mb-10">
              {/* Section Header */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-[#2D1400]">{group.l}</h3>
                <p className="text-xs text-[#8B6A4F] mt-0.5">
                  {group.list.length} item{group.list.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Items Grid */}
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.list.map(i => (
                  <ItemCard key={i._id || i.id} item={i} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-[#8B6A4F] font-medium italic">
              No items found.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Menu;