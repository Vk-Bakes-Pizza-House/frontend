import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AlertCircle, Search } from "lucide-react";
import ItemCard from "../../components/ItemCard";
import useMenuStore from "../../store/menuStore";
import useCartStore from "../../store/cartStore";

function Menu() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [cat, setCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { items, loading, error, fetchMenu, setCategory } = useMenuStore();
  const { addItem, items: cart } = useCartStore();

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleCategoryChange = (category) => {
    setCat(category);
    setCategory(category);
    fetchMenu({ category: category === "all" ? null : category });
  };

  // 1. Unified Search Filter applied globally
  const filteredItems = items
    .filter((i) => cat === "all" || i.category === cat)
    .filter((i) => {
      if (!searchQuery.trim()) return true;
      const text = `${i.name || ""} ${i.description || i.desc || ""} ${i.tag || ""} ${i.size || ""}`.toLowerCase();
      return text.includes(searchQuery.toLowerCase());
    });

  // 2. Strict mapping for designated Pizza Sizes
  const pizzaSizes = ["Regular", "Medium", "Large"];
  
  const groupedBySize = pizzaSizes.reduce((groups, size) => {
    groups[size] = filteredItems.filter(
      (item) => item.size?.trim().toLowerCase() === size.toLowerCase()
    );
    return groups;
  }, {});

  // 3. Absolute exclusion logic: Other items completely omits structural pizza variants
  const otherItems = filteredItems.filter((item) => {
    const itemSize = item.size?.trim().toLowerCase() || "";
    return !pizzaSizes.map(s => s.toLowerCase()).includes(itemSize);
  });

  // Loading State
  if (loading) {
    return (
      <div className="bg-[#FFF8F0] min-h-screen flex items-center justify-center p-6">
        <div className="animate-pulse text-[#8B6A4F] font-medium">Loading menu...</div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-[#FFF8F0] min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">Error loading menu: {error}</p>
          <button
            onClick={() => fetchMenu()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold shadow-sm active:scale-95 transition-transform"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF8F0] min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <h2 className="text-3xl font-black text-[#2D1400] mb-6 tracking-tight">Our Menu</h2>

        {/* Category Scrollbar */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar snap-x">
          {[
            { k: "all", l: "All Items", e: "🍽️" },
            { k: "pizza", l: "Pizza", e: "🍕" },
            { k: "cake", l: "Cakes", e: "🎂" },
            { k: "bread", l: "Bread", e: "🍞" },
            { k: "toast", l: "Toast", e: "🥖" },
            { k: "cookie", l: "Cookies", e: "🍪" },
            { k: "ice", l: "IceCream", e: "🍦" },
          ].map(c => (
            <button
              key={c.k}
              onClick={() => handleCategoryChange(c.k)}
              className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                cat === c.k
                  ? "bg-[#D44B1A] text-white border-transparent shadow-md"
                  : "bg-white text-[#8B6A4F] border-[#E8D5C0] hover:border-[#D44B1A]"
              }`}
            >
              <span className="mr-1">{c.e}</span> {c.l}
            </button>
          ))}
        </div>

        {/* Policy Info Box */}
        <div className="bg-[#FFF3E0] border border-[#E8D5C0] rounded-xl p-4 mb-8 flex gap-3 items-start shadow-sm">
          <AlertCircle size={18} className="text-[#D44B1A] shrink-0 mt-0.5" />
          <p className="text-xs text-[#5D3A00] leading-relaxed">
            <span className="font-bold text-[#D44B1A]">Delivery (₹20):</span> Pizza & Cakes only.
            Ice Cream delivers only with main items. Bread & Toast are
            <span className="font-bold ml-1">store pickup only</span>. Cash on delivery.
          </p>
        </div>

        {/* Search Bar Input Container */}
        <div className="mb-8">
          <label className="relative block">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6A4F]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, size (e.g. Medium), or tags..."
              className="w-full rounded-2xl border border-[#E8D5C0] bg-white py-3 pl-12 pr-4 text-sm text-[#2D1400] placeholder:text-[#B59A79] outline-none transition hover:border-[#D44B1A] focus:border-[#D44B1A] focus:ring-2 focus:ring-[#D44B1A]/15"
            />
          </label>
          {searchQuery.trim() !== "" && (
            <p className="mt-2 text-xs text-[#8B6A4F]">
              Showing {filteredItems.length} result{filteredItems.length === 1 ? "" : "s"}
            </p>
          )}
        </div>

        {/* Categorized Pizza Render Grid */}
        {pizzaSizes.map((size) => (
          groupedBySize[size].length > 0 ? (
            <div key={size} className="mb-10">
              <div className="flex items-center justify-between mb-4 gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-[#2D1400]">{size} Pizza</h3>
                  <p className="text-sm text-[#8B6A4F] mt-1">
                    {groupedBySize[size].length} {groupedBySize[size].length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {groupedBySize[size].map((i) => (
                  <ItemCard key={i._id || i.id} item={i} cart={cart} add={addItem} />
                ))}
              </div>
            </div>
          ) : null
        ))}

        {/* Generic Items Array (Pizzas completely omitted from this grid mapping) */}
        {otherItems.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4 gap-3">
              <div>
                <h3 className="text-2xl font-bold text-[#2D1400]">Other Treats</h3>
                <p className="text-sm text-[#8B6A4F] mt-1">
                  {otherItems.length} {otherItems.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {otherItems.map((i) => (
                <ItemCard key={i._id || i.id} item={i} cart={cart} add={addItem} />
              ))}
            </div>
          </div>
        )}

        {/* Empty Search / Category State */}
        {filteredItems.length === 0 && (
          <div className="py-20 text-center">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-[#8B6A4F] font-medium italic">No items found matching your criteria.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Menu;