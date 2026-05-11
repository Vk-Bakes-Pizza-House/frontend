import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { C, EMOJI } from "../data/menu";
import { isDlv, hasPCB, buildMsg } from "../config";
import { WA, DELIVERY_FEE } from "../config";


function Cart({ cart, add }) {
  const [addr, setAddr] = useState("");
  const sub     = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const hasDlv  = cart.some(i => isDlv(i, cart));
  const iceWarn = cart.some(i => i.cat === "ice") && !hasPCB(cart);

  const order = () => {
    if (!cart.length) return;
    window.open(`https://wa.me/${WA}?text=${buildMsg(cart, addr)}`, "_blank");
  };

  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"24px 16px" }}>
      <div style={{ maxWidth:560, margin:"0 auto" }}>
        <h2 style={{ fontFamily:C.f1, color:C.mid, fontSize:28, fontWeight:700, marginBottom:20 }}>Your Cart</h2>
        {cart.length === 0 ? (
          <div style={{ textAlign:"center", padding:"64px 0", color:C.muted, fontFamily:C.f2 }}>
            <div style={{ fontSize:56, marginBottom:12 }}>🛒</div>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:6 }}>Your cart is empty</div>
            <div style={{ fontSize:13 }}>Go to the menu and add some items!</div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {iceWarn && (
              <div style={{ background:"#FFF3E0", border:`1px solid ${C.gold}`, borderRadius:8, padding:"10px 13px", display:"flex", gap:8 }}>
                <AlertCircle size={15} color={C.gold} style={{ flexShrink:0, marginTop:1 }} />
                <p style={{ fontFamily:C.f2, fontSize:12, color:"#5D3A00" }}>
                  Ice cream delivers only when you also order a Pizza, Bake or Cake. Add one, or pick up ice cream from the store.
                </p>
              </div>
            )}

            {cart.map(item => (
              <div key={item.id} style={{ background:"white", borderRadius:10, padding:"13px 15px", border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontSize:26, flexShrink:0 }}>{EMOJI[item.cat]}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:C.f2, fontWeight:600, color:C.mid, fontSize:14 }}>{item.name}</div>
                  <div style={{ fontFamily:C.f2, fontSize:11, color:isDlv(item,cart)?"#16A34A":C.muted, marginTop:2 }}>
                    {isDlv(item, cart) ? "✅ Will be delivered" : "🏪 Store pickup only"}
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <button onClick={() => add(item,-1)} style={{ width:26, height:26, borderRadius:5, background:"#F0E0D0", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Minus size={12} color={C.red} />
                  </button>
                  <span style={{ fontFamily:C.f2, fontWeight:700, color:C.mid, minWidth:18, textAlign:"center" }}>{item.qty}</span>
                  <button onClick={() => add(item,1)} style={{ width:26, height:26, borderRadius:5, background:C.red, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Plus size={12} color="white" />
                  </button>
                </div>
                <div style={{ fontFamily:C.f2, fontWeight:700, color:C.red, fontSize:14, minWidth:48, textAlign:"right" }}>₹{item.price * item.qty}</div>
              </div>
            ))}

            {hasDlv && (
              <div>
                <div style={{ fontFamily:C.f2, fontWeight:600, color:C.mid, fontSize:13, marginBottom:6 }}>📍 Delivery Address</div>
                <textarea value={addr} onChange={e => setAddr(e.target.value)} placeholder="Enter your full delivery address..." rows={2}
                  style={{ width:"100%", padding:"10px 13px", border:`1px solid ${C.border}`, borderRadius:8, fontFamily:C.f2, fontSize:13, resize:"none", outline:"none", boxSizing:"border-box" }} />
              </div>
            )}

            <div style={{ background:"white", borderRadius:10, padding:"15px", border:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontFamily:C.f2, color:C.muted, fontSize:13 }}>Subtotal</span>
                <span style={{ fontFamily:C.f2, fontWeight:600, color:C.mid, fontSize:13 }}>₹{sub}</span>
              </div>
              {hasDlv && (
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontFamily:C.f2, color:C.muted, fontSize:13 }}>Delivery charge</span>
                  <span style={{ fontFamily:C.f2, fontWeight:600, color:C.mid, fontSize:13 }}>₹{DELIVERY_FEE}</span>
                </div>
              )}
              <div style={{ borderTop:`1px solid ${C.border}`, marginTop:8, paddingTop:8, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontFamily:C.f2, fontWeight:700, color:C.mid, fontSize:15 }}>Total</span>
                <span style={{ fontFamily:C.f2, fontWeight:700, color:C.red, fontSize:15 }}>₹{sub + (hasDlv ? DELIVERY_FEE : 0)}</span>
              </div>
              <div style={{ fontFamily:C.f2, fontSize:11, color:C.muted, marginTop:4 }}>💵 Cash on Delivery</div>
            </div>

            <button onClick={order}
              style={{ background:C.green, color:"white", padding:"15px", borderRadius:10, fontFamily:C.f2, fontWeight:700, fontSize:15, width:"100%" }}>
              📱 Order via WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


export default Cart;