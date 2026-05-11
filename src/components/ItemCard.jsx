import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { C, ITEMS, CATS } from "../data/menu";
import { isDlv } from "../config";
import { EMOJI } from "../data/menu";  

function ItemCard({ item, cart, add }) {
  const qty = cart.find(c => c.id === item.id)?.qty || 0;
  const deliverable = isDlv(item, cart);
  const dlvLabel = item.dlv === true ? "🚚 Delivers"
                 : item.dlv === "cond" ? "🍕+🎂 only"
                 : "🏪 Pickup only";
  const dlvColor = item.dlv === true ? { bg:"#DCFCE7", color:"#166534" }
                 : item.dlv === "cond" ? { bg:"#FEF9C3", color:"#854D0E" }
                 : { bg:"#F3F4F6", color:"#6B7280" };
  return (
    <div style={{ background:C.card, borderRadius:12, overflow:"hidden", border:`1px solid ${C.border}`, display:"flex", flexDirection:"column" }}>
      <div style={{ height:90, background:"linear-gradient(135deg,#FFF0E0,#FFE8CC)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:34, position:"relative" }}>
        {EMOJI[item.cat]}
        {item.tag && (
          <span style={{ position:"absolute", top:7, left:7, background:C.red, color:"white", fontSize:10, padding:"2px 7px", borderRadius:10, fontFamily:C.f2, fontWeight:700 }}>
            {item.tag}
          </span>
        )}
        <span style={{ position:"absolute", top:7, right:7, background:dlvColor.bg, color:dlvColor.color, fontSize:10, padding:"2px 7px", borderRadius:10, fontFamily:C.f2, fontWeight:600 }}>
          {dlvLabel}
        </span>
      </div>
      <div style={{ padding:"12px 14px", flex:1, display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{ fontFamily:C.f2, fontWeight:600, color:C.mid, fontSize:14 }}>{item.name}</div>
        <div style={{ fontFamily:C.f2, color:C.muted, fontSize:12, flex:1 }}>{item.desc}</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontFamily:C.f2, fontWeight:700, color:C.red, fontSize:17 }}>₹{item.price}</span>
          {qty === 0 ? (
            <button onClick={() => add(item)}
              style={{ background:C.red, color:"white", padding:"6px 14px", borderRadius:6, fontFamily:C.f2, fontWeight:600, fontSize:12 }}>
              Add
            </button>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <button onClick={() => add(item, -1)} style={{ width:26, height:26, borderRadius:5, background:"#F0E0D0", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Minus size={12} color={C.red} />
              </button>
              <span style={{ fontFamily:C.f2, fontWeight:700, color:C.mid, minWidth:18, textAlign:"center" }}>{qty}</span>
              <button onClick={() => add(item, 1)} style={{ width:26, height:26, borderRadius:5, background:C.red, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Plus size={12} color="white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




export default ItemCard;