import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { C, ITEMS, CATS } from "../../data/menu";
import { isDlv } from "../../config";
import ItemCard from "../../components/ItemCard";

function Menu({ cart, add }) {
  const [cat, setCat] = useState("all");
  const items = cat === "all" ? ITEMS : ITEMS.filter(i => i.cat === cat);
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"24px 16px" }}>
      <div style={{ maxWidth:960, margin:"0 auto" }}>
        <h2 style={{ fontFamily:C.f1, color:C.mid, fontSize:28, fontWeight:700, marginBottom:18 }}>Our Menu</h2>
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:12, marginBottom:16 }}>
          {CATS.map(c => (
            <button key={c.k} onClick={() => setCat(c.k)}
              style={{ padding:"7px 15px", borderRadius:20, fontFamily:C.f2, fontWeight:500, fontSize:12, whiteSpace:"nowrap", flexShrink:0,
                background:cat===c.k?C.red:"white", color:cat===c.k?"white":C.mid,
                border:cat===c.k?"none":`1px solid ${C.border}` }}>
              {c.e} {c.l}
            </button>
          ))}
        </div>
        <div style={{ background:"#FFF3E0", border:`1px solid ${C.gold}`, borderRadius:8, padding:"10px 14px", marginBottom:18, display:"flex", gap:8, alignItems:"flex-start" }}>
          <AlertCircle size={15} color={C.gold} style={{ flexShrink:0, marginTop:1 }} />
          <p style={{ fontFamily:C.f2, fontSize:12, color:"#5D3A00" }}>
            <strong>Delivery (₹20):</strong> Pizza, Bakes & Cakes only. Ice Cream delivers only when ordered with Pizza/Bake/Cake. Bread, Toast & Biscuits are <strong>store pickup only</strong>. Cash on delivery.
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(178px,1fr))", gap:14 }}>
          {items.map(i => <ItemCard key={i.id} item={i} cart={cart} add={add} />)}
        </div>
      </div>
    </div>
  );
}

export default Menu;