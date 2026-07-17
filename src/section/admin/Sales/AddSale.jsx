import React, { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSalesStore, useMenuStore } from "../../../store";

const SALE_TYPES = ["WhatsApp", "Counter", "Instagram", "Other"];
const BRANCHES = ["VK Bakes", "Morning Star Cafe"];
const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Bank Transfer"];
const PAYMENT_STATUSES = ["Paid", "Pending", "Partial"];

export default function AddSale() {
  const { items: menuItems, loading: menuLoading, fetchMenu } = useMenuStore();
  const { create, getOverview, loading: saleLoading } = useSalesStore();

  // Item picker
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [cartItems, setCartItems] = useState([]);

  // Conditional extras (reset on every item pick)
  const [extraCheese, setExtraCheese] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [itemDiscount, setItemDiscount] = useState("");

  // Sale meta
  const [saleType, setSaleType] = useState("Counter");
  const [branch, setBranch] = useState("VK Bakes");
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState("");

  // Wholesale customer (conditional)
  const [isWholesale, setIsWholesale] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMenu({ includeUnavailable: false });
  }, [fetchMenu]);

  const selectedMenuItem = menuItems.find((m) => m._id === selectedItemId);
  const isPizza = (selectedMenuItem?.category ?? "").toLowerCase() === "pizza";

  const hasSizes = Array.isArray(selectedMenuItem?.sizes) && selectedMenuItem.sizes.length > 0;
  const normalizedSizes = (selectedMenuItem?.sizes ?? []).map((size) => ({
    value: size?.label ?? size?.size ?? size?.name ?? "",
    label: size?.label ?? size?.size ?? size?.name ?? "",
    price: Number(size?.price ?? 0),
  }));
  const selectedSizeDetails = normalizedSizes.find((size) => size.value === selectedSize);
  const currentPrice = hasSizes
    ? selectedSizeDetails?.price ?? 0
    : Number(selectedMenuItem?.price ?? 0);

  const resetPicker = () => {
    setSelectedItemId("");
    setSelectedSize("");
    setQty(1);
    setExtraCheese("");
    setDeliveryFee("");
    setItemDiscount("");
  };

  const addToCart = () => {
    if (!selectedMenuItem) return toast.error("Please select an item.");
    if (hasSizes && !selectedSize) return toast.error("Please select a size.");
    if (!currentPrice) return toast.error("This item has no valid price.");

    const newLines = [
      {
        product: selectedMenuItem._id,
        name: hasSizes ? `${selectedMenuItem.name} (${selectedSize})` : selectedMenuItem.name,
        price: currentPrice,
        quantity: qty,
      },
    ];

    if (isPizza) {
      const cheese = Number(extraCheese) || 0;
      const delivery = Number(deliveryFee) || 0;
      if (cheese > 0) {
        newLines.push({ product: selectedMenuItem._id, name: "Extra Cheese", price: cheese, quantity: 1 });
      }
      if (delivery > 0) {
        newLines.push({ product: selectedMenuItem._id, name: "Delivery Fee", price: delivery, quantity: 1 });
      }
    } else {
      const disc = Number(itemDiscount) || 0;
      if (disc > 0) {
        newLines.push({
          product: selectedMenuItem._id,
          name: `Discount - ${selectedMenuItem.name}`,
          price: -disc,
          quantity: 1,
        });
      }
    }

    setCartItems((prev) => [...prev, ...newLines]);
    resetPicker();
  };

  const removeCartItem = (idx) => setCartItems(cartItems.filter((_, i) => i !== idx));

  const subTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const grandTotal = Math.max(subTotal - Number(discount || 0) + Number(tax || 0), 0);

  const handleSaveSale = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return toast.error("Add at least one item to the sale.");
    if (isWholesale && !customerName) return toast.error("Please enter customer name for wholesale sale.");

    setSaving(true);
    await create({
      items: cartItems,
      subTotal,
      discount: Number(discount) || 0,
      tax: Number(tax) || 0,
      grandTotal,
      paymentMethod,
      paymentStatus,
      saleType,
      branch,
      saleDate,
      notes,
      customerName: isWholesale ? customerName : "Walk-in Customer",
      customerPhone: isWholesale ? customerPhone : "",
    });
    setSaving(false);

    setCartItems([]);
    setDiscount(0);
    setTax(0);
    setNotes("");
    setIsWholesale(false);
    setCustomerName("");
    setCustomerPhone("");
    getOverview();
  };

  return (
    <form onSubmit={handleSaveSale} className="bg-white p-6 rounded-2xl border border-[#E8D5C0] max-w-3xl space-y-6">
      <h2 className="text-base font-bold text-[#2D1400]">New Sale Entry</h2>

      {/* Item Picker */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#2D1400] uppercase tracking-wider">Add Item</label>
        <div className="flex gap-3 items-center flex-wrap">
          <select
            className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-[#E8D5C0] text-sm bg-white"
            value={selectedItemId}
            onChange={(e) => {
              setSelectedItemId(e.target.value);
              setSelectedSize("");
              setExtraCheese("");
              setDeliveryFee("");
              setItemDiscount("");
            }}
            disabled={menuLoading}
          >
            <option value="" disabled>{menuLoading ? "Loading items…" : "Select item"}</option>
            {menuItems.map((item) => (
              <option key={item._id} value={item._id}>{item.name}</option>
            ))}
          </select>

          {hasSizes && (
            <select
              className="px-3 py-2 rounded-xl border border-[#E8D5C0] text-sm bg-white"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              <option value="" disabled>Size</option>
              {normalizedSizes.map((size) => (
                <option key={size.value} value={size.value}>{size.label} — ₹{size.price}</option>
              ))}
            </select>
          )}

          <input
            type="number"
            className="w-16 px-3 py-2 rounded-xl border border-[#E8D5C0] text-sm text-center"
            value={qty}
            min="1"
            onChange={(e) => setQty(parseInt(e.target.value) || 1)}
          />

          <span className="text-xs font-bold text-[#8B6A4F] w-20 text-right">
            {currentPrice ? `₹${currentPrice}` : "—"}
          </span>

          <button type="button" onClick={addToCart} className="flex items-center gap-1 text-xs font-bold text-white bg-[#2D1400] px-3 py-2 rounded-xl hover:opacity-90">
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Conditional extras based on item type */}
        {selectedMenuItem && isPizza && (
          <div className="flex gap-3 flex-wrap bg-[#FFF8F0] p-3 rounded-xl border border-[#E8D5C0]/70">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-bold text-[#8B6A4F] uppercase mb-1">Extra Cheese (₹)</label>
              <input
                type="number" min="0" placeholder="0"
                className="w-full px-3 py-1.5 rounded-lg border border-[#E8D5C0] text-sm"
                value={extraCheese}
                onChange={(e) => setExtraCheese(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-bold text-[#8B6A4F] uppercase mb-1">Delivery Fee (₹)</label>
              <input
                type="number" min="0" placeholder="0"
                className="w-full px-3 py-1.5 rounded-lg border border-[#E8D5C0] text-sm"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
              />
            </div>
          </div>
        )}

        {selectedMenuItem && !isPizza && (
          <div className="bg-[#FFF8F0] p-3 rounded-xl border border-[#E8D5C0]/70 max-w-[220px]">
            <label className="block text-[10px] font-bold text-[#8B6A4F] uppercase mb-1">Discount on this item (₹)</label>
            <input
              type="number" min="0" placeholder="0"
              className="w-full px-3 py-1.5 rounded-lg border border-[#E8D5C0] text-sm"
              value={itemDiscount}
              onChange={(e) => setItemDiscount(e.target.value)}
            />
          </div>
        )}

        {!menuLoading && menuItems.length === 0 && (
          <p className="text-xs text-red-500">No available items found in menu.</p>
        )}
      </div>

      {/* Cart */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-[#2D1400] uppercase tracking-wider">Line Items</label>
        {cartItems.length === 0 ? (
          <p className="text-xs text-[#8B6A4F]">No items added yet.</p>
        ) : (
          <div className="border border-[#E8D5C0] rounded-xl divide-y divide-[#E8D5C0]/60">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-2.5 text-xs">
                <div>
                  <span className={`font-bold ${item.price < 0 ? "text-red-600" : "text-[#2D1400]"}`}>{item.name}</span>
                  {item.quantity > 1 && <span className="text-[#8B6A4F]"> × {item.quantity}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${item.price < 0 ? "text-red-600" : "text-[#2D1400]"}`}>
                    {item.price < 0 ? "-" : ""}₹{Math.abs(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button type="button" onClick={() => removeCartItem(idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sale Type + Branch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#2D1400] uppercase tracking-wider mb-2">Order Source</label>
          <div className="flex gap-2 flex-wrap">
            {SALE_TYPES.map((t) => (
              <button key={t} type="button" onClick={() => setSaleType(t)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border ${saleType === t ? "bg-[#2D1400] text-white border-[#2D1400]" : "border-[#E8D5C0] text-[#8B6A4F]"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#2D1400] uppercase tracking-wider mb-2">Branch</label>
          <select className="w-full px-3 py-2 rounded-xl border border-[#E8D5C0] text-sm bg-white" value={branch} onChange={(e) => setBranch(e.target.value)}>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-bold text-[#2D1400] uppercase tracking-wider mb-2">Sale Date</label>
        <input
          type="date"
          className="px-3 py-2 rounded-xl border border-[#E8D5C0] text-sm"
          value={saleDate}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setSaleDate(e.target.value)}
        />
      </div>

      {/* Wholesale customer toggle */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-bold text-[#2D1400]">
          <input type="checkbox" checked={isWholesale} onChange={(e) => setIsWholesale(e.target.checked)} />
          This is a wholesale/regular customer order
        </label>
        {isWholesale && (
          <div className="flex gap-3 flex-wrap">
            <input
              type="text" placeholder="Customer name"
              className="flex-1 min-w-[160px] px-3 py-2 rounded-xl border border-[#E8D5C0] text-sm"
              value={customerName} onChange={(e) => setCustomerName(e.target.value)}
            />
            <input
              type="tel" placeholder="Phone number"
              className="flex-1 min-w-[160px] px-3 py-2 rounded-xl border border-[#E8D5C0] text-sm"
              value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#2D1400] uppercase tracking-wider mb-2">Payment Method</label>
          <div className="flex gap-2 flex-wrap">
            {PAYMENT_METHODS.map((m) => (
              <button key={m} type="button" onClick={() => setPaymentMethod(m)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border ${paymentMethod === m ? "bg-[#2D1400] text-white border-[#2D1400]" : "border-[#E8D5C0] text-[#8B6A4F]"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#2D1400] uppercase tracking-wider mb-2">Payment Status</label>
          <div className="flex gap-2 flex-wrap">
            {PAYMENT_STATUSES.map((s) => (
              <button key={s} type="button" onClick={() => setPaymentStatus(s)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border ${paymentStatus === s ? "bg-[#2D1400] text-white border-[#2D1400]" : "border-[#E8D5C0] text-[#8B6A4F]"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Order-level discount / tax / notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#2D1400] uppercase tracking-wider mb-2">Overall Discount (₹)</label>
          <input type="number" min="0" className="w-full px-3 py-2 rounded-xl border border-[#E8D5C0] text-sm" value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#2D1400] uppercase tracking-wider mb-2">Tax (₹)</label>
          <input type="number" min="0" className="w-full px-3 py-2 rounded-xl border border-[#E8D5C0] text-sm" value={tax} onChange={(e) => setTax(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-[#2D1400] uppercase tracking-wider mb-2">Notes</label>
        <textarea rows={2} className="w-full px-3 py-2 rounded-xl border border-[#E8D5C0] text-sm" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional remarks…" />
      </div>

      {/* Totals */}
      <div className="border-t border-[#E8D5C0] pt-4 flex justify-end">
        <div className="text-right space-y-1 min-w-[220px]">
          <div className="flex justify-between text-xs text-[#8B6A4F]">
            <span>Subtotal</span><span>₹{subTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-[#8B6A4F]">
            <span>Overall Discount</span><span>-₹{Number(discount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-[#8B6A4F]">
            <span>Tax</span><span>+₹{Number(tax || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-black text-[#2D1400] pt-1">
            <span>Grand Total</span><span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || saleLoading}
        className="w-full py-3 bg-[#F5A623] text-[#1A0A00] font-bold rounded-xl text-sm flex justify-center items-center gap-2 shadow-xs disabled:opacity-60"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
        {saving ? "Saving…" : "Save Sale Record"}
      </button>
    </form>
  );
}