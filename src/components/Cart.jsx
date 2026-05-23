import { useState } from "react";
import { AlertCircle, Plus, Minus } from "lucide-react";
import { C, EMOJI } from "../data/menu";
import { isDlv, hasPCB, buildMsg } from "../config";
import { WA, DELIVERY_FEE } from "../config";
import { AddressBox, CartSummary } from "../section/order/CheckoutComponents"

function Cart({ cart, add }) {
  const [addr, setAddr] = useState("");
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const hasDlv = cart.some(i => isDlv(i, cart));
  const iceWarn = cart.some(i => i.cat === "ice") && !hasPCB(cart);

  const order = () => {
    if (!cart.length) return;
    window.open(`https://wa.me/${WA}?text=${buildMsg(cart, addr)}`, "_blank");
  };

  return (
    <div className="min-h-screen py-6 px-4" style={{ background: C.bg }}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-5" style={{ color: C.mid, fontFamily: C.f1 }}>Your Cart</h2>

        {cart.length === 0 ? (
          <div className="text-center py-16" style={{ color: C.muted, fontFamily: C.f2 }}>
            <div className="text-6xl mb-3">🛒</div>
            <div className="text-lg font-semibold mb-2">Your cart is empty</div>
            <div className="text-sm">Go to the menu and add some items!</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {iceWarn && (
              <div className="flex gap-2 rounded-lg p-3" style={{ background: "#FFF3E0", border: `1px solid ${C.gold}` }}>
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: C.gold }} />
                <p className="text-xs" style={{ color: "#5D3A00", fontFamily: C.f2 }}>
                  Ice cream delivers only when you also order a Pizza, Bake or Cake. Add one, or pick up ice cream from the store.
                </p>
              </div>
            )}

            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg p-3.5 bg-white border" style={{ borderColor: C.border }}>
                <div className="text-2xl flex-shrink-0">{EMOJI[item.cat]}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: C.mid, fontFamily: C.f2 }}>{item.name}</div>
                  <div className="text-xs mt-1" style={{ color: isDlv(item, cart) ? "#16A34A" : C.muted, fontFamily: C.f2 }}>
                    {isDlv(item, cart) ? "✅ Will be delivered" : "🏪 Store pickup only"}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => add(item, -1)} className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: "#F0E0D0" }}>
                    <Minus size={12} style={{ color: C.red }} />
                  </button>
                  <span className="font-bold text-sm w-4 text-center" style={{ color: C.mid, fontFamily: C.f2 }}>{item.qty}</span>
                  <button onClick={() => add(item, 1)} className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: C.red }}>
                    <Plus size={12} color="white" />
                  </button>
                </div>
                <div className="font-bold text-sm text-right w-12" style={{ color: C.red, fontFamily: C.f2 }}>₹{item.price * item.qty}</div>
              </div>
            ))}


            <AddressBox
              value={addr}
              onChange={setAddr}
            />

            <CartSummary
              subtotal={sub}
              deliveryFee={DELIVERY_FEE}
              total={sub + DELIVERY_FEE}
            />


            <button
              onClick={order}
              className="w-full py-3 rounded-lg font-bold text-sm text-white"
              style={{ background: C.green, fontFamily: C.f2 }}
            >
              📱 Order via WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;