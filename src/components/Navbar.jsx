import { ShoppingCart, Plus, Minus, MapPin, Clock, Phone, Star, AlertCircle } from "lucide-react";
import { C } from "../data/menu";
function Navbar({ page, go, cartQty }) {
  const links = [["home","Home"], ["menu","Menu"], ["cake","Custom Cake"], ["contact","Contact"],["admin", "Admin"]];
  return (
    <nav style={{ background:C.dark, borderBottom:`2px solid ${C.red}`, position:"sticky", top:0, zIndex:40 }}>
      <div style={{ maxWidth:1000, margin:"0 auto", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={() => go("home")} style={{ textAlign:"left" }}>
          <div style={{ fontFamily:C.f1, color:C.gold, fontSize:20, fontWeight:700, lineHeight:1 }}>VK Bakes</div>
          <div style={{ fontFamily:C.f2, color:C.red,  fontSize:10, letterSpacing:3 }}>& PIZZA HOUSE</div>
        </button>
        <div style={{ display:"flex", gap:24, alignItems:"center" }}>
          <div style={{ display:"flex", gap:20 }}>
            {links.map(([k, l]) => (
              <button key={k} onClick={() => go(k)}
                style={{ fontFamily:C.f2, color:page===k ? C.gold:"#FFF8F0", fontWeight:page===k?600:400, fontSize:14,
                  borderBottom:page===k?`2px solid ${C.gold}`:"2px solid transparent", paddingBottom:2 }}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={() => go("cart")} style={{ background:C.red, borderRadius:"50%", width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", flexShrink:0 }}>
            <ShoppingCart size={18} color="white" />
            {cartQty > 0 && (
              <span style={{ position:"absolute", top:-4, right:-4, background:C.gold, color:C.dark, borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:C.f2, fontWeight:700, fontSize:11 }}>
                {cartQty}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;