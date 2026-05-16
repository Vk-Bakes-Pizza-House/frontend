import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { C, EMOJI } from "../../data/menu";
import ItemCard from "../../components/ItemCard";
import useMenuStore from "../../store/menuStore";
import useCartStore from "../../store/cartStore";

function Menu() {
  const { items, loading, error, fetchMenu, setCategory, activeCategory } = useMenuStore();
  const { addItem } = useCartStore();
  const [cat, setCat] = useState("all");

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleCategoryChange = (category) => {
    setCat(category);
    setCategory(category);
    fetchMenu({ category: category === "all" ? null : category });
  };

  const filteredItems = cat === "all" ? items : items.filter(i => i.category === cat);

  if (loading) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", padding: "24px 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: C.f2, color: C.mid }}>Loading menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", padding: "24px 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: C.red, fontFamily: C.f2, textAlign: "center" }}>
          Error loading menu: {error}
          <br />
          <button
            onClick={() => fetchMenu()}
            style={{
              marginTop: 16,
              padding: "8px 16px",
              background: C.red,
              color: "white",
              border: "none",
              borderRadius: 6,
              fontFamily: C.f2,
              cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "24px 16px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h2 style={{ fontFamily: C.f1, color: C.mid, fontSize: 28, fontWeight: 700, marginBottom: 18 }}>Our Menu</h2>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 16 }}>
          {[
            { k: "all", l: "All Items", e: "🍽️" },
            { k: "pizza", l: "Pizza", e: "🍕" },
            { k: "bake", l: "Bakes", e: "🥐" },
            { k: "cake", l: "Cakes", e: "🎂" },
            { k: "bread", l: "Bread", e: "🍞" },
            { k: "toast", l: "Toast", e: "🥖" },
            { k: "biscuit", l: "Biscuits", e: "🍪" },
            { k: "ice", l: "Ice Cream", e: "🍦" },
          ].map(c => (
            <button key={c.k} onClick={() => handleCategoryChange(c.k)}
              style={{ padding: "7px 15px", borderRadius: 20, fontFamily: C.f2, fontWeight: 500, fontSize: 12, whiteSpace: "nowrap", flexShrink: 0,
                background: cat === c.k ? C.red : "white", color: cat === c.k ? "white" : C.mid,
                border: cat === c.k ? "none" : `1px solid ${C.border}` }}>
              {c.e} {c.l}
            </button>
          ))}
        </div>
        <div style={{ background: "#FFF3E0", border: `1px solid ${C.gold}`, borderRadius: 8, padding: "10px 14px", marginBottom: 18, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <AlertCircle size={15} color={C.gold} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontFamily: C.f2, fontSize: 12, color: "#5D3A00" }}>
            <strong>Delivery (₹20):</strong> Pizza, Bakes & Cakes only. Ice Cream delivers only when ordered with Pizza/Bake/Cake. Bread, Toast & Biscuits are <strong>store pickup only</strong>. Cash on delivery.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(178px,1fr))", gap: 14 }}>
          {filteredItems.map(i => <ItemCard key={i._id} item={i} add={addItem} />)}
        </div>
        {filteredItems.length === 0 && (
          <div style={{ padding: "60px 0", textAlign: "center", fontFamily: C.f2, color: C.muted, fontSize: 14 }}>
            No items found in this category.
          </div>
        )}
      </div>
    </div>
  );
}

export default Menu;