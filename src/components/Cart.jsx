import { useState, useEffect } from "react";
import { AlertCircle, Plus, Minus, Trash2, X, Loader2 } from "lucide-react"; // X icon add kiya modal close karne ke liyeimport { C, EMOJI } from "../data/menu";
import { isDlv, hasPCB, buildMsg } from "../config";
import { getWhatsApp, getDeliveryFees, getFreeDeliveryAbove } from "../config";
import { AddressBox, CartSummary } from "../components/Order"
import { Link } from "react-router-dom";
import useCartStore from "../store/cartStore";
import useCartOrderSubmit from "../hooks/useCartOrderSubmit";
import { toast } from "sonner";
import { C} from "../data/menu"


function Cart() {
  const { items: cart, addItem: add, logOrder } = useCartStore();
  const [name, setName] = useState("");
  const [whatsappnumber, setWhatsappNumber] = useState("");
  const [addr, setAddr] = useState("");

  // Popup modal ko open/close karne ki state
  const [isOpen, setIsOpen] = useState(false);

  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const hasDlv = cart.some(i => isDlv(i, cart));
  const deliveryFee = hasDlv && sub < getFreeDeliveryAbove() ? getDeliveryFees() : 0;
  const remaining = Math.max(0, getFreeDeliveryAbove() - sub);


  const { handleConfirmOrder } = useCartOrderSubmit({
    cart,
    subtotal: sub,
    deliveryFee,
    total: sub + deliveryFee,
    onDone: () => setIsOpen(false)
  });

  // 1. Jab main WhatsApp button par click hoga
  const handleWhatsAppClick = () => {
    if (!cart.length) return;
    setIsOpen(true); // Popup open karo
  };

  

  const removeItem = (itemId) => {
    cart.filter(i => (i._id || i.id) === itemId).forEach(i => add(i, -i.qty));
  }

  return (
    <div className="min-h-screen py-6 px-4" style={{ background: C.bg }}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-5" style={{ color: C.mid, fontFamily: C.f1 }}>Your Cart</h2>

        {cart.length === 0 ? (
          <div className="text-center py-16" style={{ color: C.muted, fontFamily: C.f2 }}>
            <div className="text-6xl mb-3">🛒</div>
            <div className="text-lg font-semibold mb-2">Your cart is empty</div>
            <div className="text-sm">Go to the menu and add some items!</div>
            <Link to={"/menu"}>
              <button
                className="w-1/4 mt-3 py-3 rounded-xl text-sm font-bold text-white bg-[#d8582a] border border-[#D44B1A] hover:bg-[#D44B1A] transition-colors duration-200"
                style={{ boxShadow: "0 8px 20px rgba(212, 75, 26, 0.15)" }}
              >
                Add Item
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {cart.map(item => (
              <div key={item._id || item.id} className="flex items-center gap-3 rounded-lg p-3.5 bg-white border" style={{ borderColor: C.border }}>
                <div className="text-2xl flex-shrink-0">{item.image ? <img src={item.image} alt={item.name} className="w-10 h-10 object-cover" /> : "🍕" }</div>
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
                <button
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-red-100 bg-red-50 font-sans text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                  style={{ boxShadow: "0 8px 20px rgba(212, 75, 26, 0.15)" }}
                  onClick={() => removeItem(item._id || item.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <CartSummary
              subtotal={sub}
              deliveryFee={deliveryFee}
              remaining={remaining}
              total={sub + deliveryFee}
            />

            {/* Main Action Button */}
            <button
              onClick={handleWhatsAppClick}
              className="w-full py-3 rounded-lg font-bold text-sm text-white transition-all active:scale-95"
              style={{ background: C.green, fontFamily: C.f2 }}
            >
              📱 Order via WhatsApp
            </button>
          </div>
        )}
      </div>

      {/* --- POPUP MODAL FOR ADDRESS DETAILS --- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative border animate-scale-up" style={{ borderColor: C.border }}>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-700"
            >
              <X size={20} />
            </button>

            {/* Modal Title */}
            <h3 className="text-xl font-bold mb-4 pr-6" style={{ color: C.mid, fontFamily: C.f1 }}>
              Enter Delivery Address
            </h3>

            {/* Address Form Component */}
            <div className="mb-6 max-h-[60vh] overflow-y-auto pr-1">
              <AddressBox
                value={addr}
                name={name}
                phone={whatsappnumber}
                onChange={setAddr}
                setName={setName}
                setPhone={setWhatsappNumber}
                setIsOpen={setIsOpen}
                onConfirm={handleConfirmOrder}
              />
            </div>

            {/* Action Buttons inside Popup */}
           
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;