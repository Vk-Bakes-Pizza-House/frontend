import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, CheckCircle, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useSalesStore, useMenuStore } from "../../../store";

const SALE_TYPES = ["WhatsApp", "Counter", "Instagram", "Other"];
const BRANCHES = ["VK Bakes", "Morning Star Cafe"];
const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Bank Transfer"];
const PAYMENT_STATUSES = ["Paid", "Pending", "Partial"];

const getLocalDateInputValue = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Pizza & Cake = retail items: fixed menu rate only, no client / discount.
const categoryName = (c) => ((c && typeof c === "object" ? c.name : c) ?? "").toString();
const isPizzaCategory = (c) => /\bpizzas?\b/i.test(categoryName(c));
const isCakeCategory = (c) => /\bcakes?\b/i.test(categoryName(c));

let rowSeq = 0;
const newClientRow = () => ({ id: ++rowSeq, clientName: "", qty: 1, discount: "" });

const inr = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const lineTotal = (i) => i.price * i.quantity + (i.extraCheese || 0) + (i.deliveryFee || 0);

const cardCls = "bg-white p-5 rounded-2xl border border-[#E8D5C0] space-y-4";
const labelCls = "block text-xs font-bold text-[#2D1400] uppercase tracking-wider mb-2";
const miniLabelCls = "block text-[10px] font-bold text-[#8B6A4F] uppercase mb-1";
const inputCls =
  "w-full px-3 py-2 rounded-xl border border-[#E8D5C0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40";
const chipCls = (active) =>
  `px-3 py-2 text-xs font-bold rounded-xl border ${active ? "bg-[#2D1400] text-white border-[#2D1400]" : "border-[#E8D5C0] text-[#8B6A4F]"
  }`;

export default function AddSale() {
  const { items: menuItems, loading: menuLoading, fetchMenu } = useMenuStore();
  const {
    createSale,
    getOverview,
    getSalesByPeriod,
    getClientNames,
    clientNames,
    loading: saleLoading,
  } = useSalesStore();

  // Item picker
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [retailQty, setRetailQty] = useState(1);
  const [clientRows, setClientRows] = useState(() => [newClientRow()]);
  const [extraCheese, setExtraCheese] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [cartItems, setCartItems] = useState([]);

  // Sale meta
  const [saleType, setSaleType] = useState("Counter");
  const [branch, setBranch] = useState("VK Bakes");
  const [saleDate, setSaleDate] = useState(() => getLocalDateInputValue());
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [dayStats, setDayStats] = useState({ total: 0, count: 0 });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchMenu({ includeUnavailable: false });
  }, [fetchMenu]);

  useEffect(() => {
    getClientNames?.();
  }, [getClientNames]);

  // Total of the selected date's saved sales
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const records = await getSalesByPeriod?.("day", saleDate);
      if (cancelled) return;
      const list = Array.isArray(records) ? records : [];
      setDayStats({
        total: list.reduce((sum, r) => sum + Number(r.grandTotal || 0), 0),
        count: list.length,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [saleDate, refreshKey, getSalesByPeriod]);

  const selectedMenuItem = menuItems.find((m) => m._id === selectedItemId);
  const isPizza = isPizzaCategory(selectedMenuItem?.category);
  const isRetail = isPizza || isCakeCategory(selectedMenuItem?.category);

  const hasSizes = Array.isArray(selectedMenuItem?.sizes) && selectedMenuItem.sizes.length > 0;
  const normalizedSizes = (selectedMenuItem?.sizes ?? []).map((size) => ({
    value: size?.label ?? size?.size ?? size?.name ?? "",
    label: size?.label ?? size?.size ?? size?.name ?? "",
    price: Number(size?.price ?? 0),
  }));
  const selectedSizeDetails = normalizedSizes.find((size) => size.value === selectedSize);
  const fixedRate = hasSizes
    ? selectedSizeDetails?.price ?? 0
    : Number(selectedMenuItem?.price ?? 0);

  const rateLabel = !selectedMenuItem
    ? "—"
    : hasSizes && !selectedSize
      ? "Pick size"
      : `₹${fixedRate}`;

  // "Select or enter" suggestions: saved clients + names typed in this bill
  const clientSuggestions = useMemo(() => {
    const fromCart = cartItems.map((i) => i.clientName).filter(Boolean);
    return [...new Set([...(clientNames ?? []), ...fromCart])].sort((a, b) => a.localeCompare(b));
  }, [clientNames, cartItems]);

  const resetPicker = () => {
    setSelectedItemId("");
    setSelectedSize("");
    setRetailQty(1);
    setClientRows([newClientRow()]);
    setExtraCheese("");
    setDeliveryFee("");
  };

  const updateClientRow = (id, field, value) =>
    setClientRows((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const addClientRow = () => setClientRows((rows) => [...rows, newClientRow()]);
  const removeClientRow = (id) => setClientRows((rows) => rows.filter((r) => r.id !== id));

  const rowNetRate = (row) => Math.max(fixedRate - (Number(row.discount) || 0), 0);

  const addToCart = () => {
    if (!selectedMenuItem) return toast.error("Please select an item.");
    if (hasSizes && !selectedSize) return toast.error("Please select a size.");
    if (!fixedRate) return toast.error("This item has no valid price.");

    const itemName = hasSizes ? `${selectedMenuItem.name} (${selectedSize})` : selectedMenuItem.name;
    const lines = [];
    if (isRetail) {
      lines.push({
        product: selectedMenuItem._id,
        name: itemName,
        clientName: "",
        discountPerItem: 0,
        price: fixedRate,
        quantity: retailQty,
        extraCheese: isPizza ? Number(extraCheese) || 0 : 0,
        deliveryFee: isPizza ? Number(deliveryFee) || 0 : 0,
      });
    } else {
      for (const row of clientRows) {
        const disc = Number(row.discount) || 0;
        if (disc < 0 || disc > fixedRate) {
          return toast.error(`Discount per item can't be more than the fixed rate (₹${fixedRate}).`);
        }
      }
      clientRows.forEach((row) => {
        const disc = Number(row.discount) || 0;
        lines.push({
          product: selectedMenuItem._id,
          name: itemName,
          clientName: row.clientName.trim(),
          discountPerItem: disc,
          price: fixedRate - disc,
          quantity: row.qty,
        });
      });
    }

    setCartItems((prev) => [...prev, ...lines]);
    resetPicker();
  };

  const removeCartItem = (idx) => setCartItems(cartItems.filter((_, i) => i !== idx));

  const subTotal = cartItems.reduce((sum, i) => sum + lineTotal(i), 0);
  const clientSavings = cartItems.reduce((sum, i) => sum + (i.discountPerItem || 0) * i.quantity, 0);
  const grandTotal = Math.max(subTotal - Number(discount || 0) + Number(tax || 0), 0);

  const handleSaveSale = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return toast.error("Add at least one item to the sale.");

    const clients = [...new Set(cartItems.map((i) => i.clientName).filter(Boolean))];
    const customerName =
      clients.length === 0 ? "Walk-in Customer" : clients.length === 1 ? clients[0] : "Multiple Clients";

    setSaving(true);
    let result;
    try {
      result = await createSale({
        items: cartItems.map(({ product, name, clientName, discountPerItem, price, quantity, extraCheese, deliveryFee }) => ({
          product, name, clientName, discountPerItem, price, quantity,
          extraCheese: extraCheese || 0,
          deliveryFee: deliveryFee || 0,
        })),
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
        customerName,
      });
    } catch (err) {
      toast.error(err?.message || "Failed to save sale.");
      return;
    } finally {
      setSaving(false);
    }

    if (result === false || result === null) return; // save failed — keep the cart

    setCartItems([]);
    setDiscount(0);
    setTax(0);
    setNotes("");
    setRefreshKey((k) => k + 1);
    getClientNames?.();
    getOverview?.();
  };

  const isToday = saleDate === getLocalDateInputValue();
  const dayLabel = new Date(`${saleDate}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <form
      onSubmit={handleSaveSale}
      onKeyDown={(e) => {
        // Enter inside an input must not submit the whole sale by accident
        if (e.key === "Enter" && e.target.tagName === "INPUT") e.preventDefault();
      }}
      className="max-w-5xl space-y-5"
    >
      {/* ── Day total banner ── */}
      <div className="bg-[#2D1400] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#E8D5C0]">
            {isToday ? "Today's Sales" : `Sales on ${dayLabel}`}
          </p>
          <p className="text-3xl font-black text-white mt-1">{inr(dayStats.total)}</p>
          <p className="text-xs text-[#E8D5C0]/80 mt-1">
            {dayStats.count} sale{dayStats.count === 1 ? "" : "s"} recorded
          </p>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#E8D5C0] mb-1">Sale Date</label>
          <input
            type="date"
            className="px-3 py-2 rounded-xl text-sm bg-white/10 border border-white/20 text-white [color-scheme:dark]"
            value={saleDate}
            max={getLocalDateInputValue()}
            onChange={(e) => setSaleDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
        {/* ── LEFT: item entry + cart ── */}
        <div className="lg:col-span-3 space-y-5">
          <div className={cardCls}>
            <h2 className="text-sm font-bold text-[#2D1400]">1. Select Item</h2>

            <div className="flex gap-3 flex-wrap items-end">
              <div className="flex-1 min-w-[180px]">
                <label className={miniLabelCls}>Item</label>
                <select
                  className={inputCls}
                  value={selectedItemId}
                  onChange={(e) => {
                    setSelectedItemId(e.target.value);
                    setSelectedSize("");
                    setRetailQty(1);
                    setClientRows([newClientRow()]);
                    setExtraCheese("");
                    setDeliveryFee("");
                  }}
                  disabled={menuLoading}
                >
                  <option value="" disabled>{menuLoading ? "Loading items…" : "Select item"}</option>
                  {menuItems.map((item) => (
                    <option key={item._id} value={item._id}>{item.name}</option>
                  ))}
                </select>
              </div>

              {hasSizes && (
                <div>
                  <label className={miniLabelCls}>Size</label>
                  <select className={inputCls} value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                    <option value="" disabled>Size</option>
                    {normalizedSizes.map((size) => (
                      <option key={size.value} value={size.value}>{size.label} — ₹{size.price}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className={miniLabelCls}>Fixed Rate</label>
                <div className="min-w-[96px] px-3 py-2 rounded-xl bg-[#FFF8F0] border border-[#E8D5C0] text-sm font-black text-[#2D1400] text-center">
                  {rateLabel}
                </div>
              </div>
            </div>

            {!menuLoading && menuItems.length === 0 && (
              <p className="text-xs text-red-500">No available items found in menu.</p>
            )}

            {selectedMenuItem && fixedRate > 0 && (
              <div className="space-y-3 pt-3 border-t border-[#E8D5C0]/60">
                {isRetail ? (
                  <>
                    <p className="text-[11px] font-bold text-[#8B6A4F] uppercase tracking-wider">
                      Retail item — fixed rate only
                    </p>
                    <div className="flex gap-3 flex-wrap items-end">
                      <div className="w-24">
                        <label className={miniLabelCls}>Qty</label>
                        <input
                          type="number" min="1" className={`${inputCls} text-center`}
                          value={retailQty}
                          onChange={(e) => setRetailQty(parseInt(e.target.value) || 1)}
                        />
                      </div>
                      {isPizza && (
                        <>
                          <div className="w-32">
                            <label className={miniLabelCls}>Extra Cheese (₹)</label>
                            <input
                              type="number" min="0" placeholder="0" className={inputCls}
                              value={extraCheese} onChange={(e) => setExtraCheese(e.target.value)}
                            />
                          </div>
                          <div className="w-32">
                            <label className={miniLabelCls}>Delivery Fee (₹)</label>
                            <input
                              type="number" min="0" placeholder="0" className={inputCls}
                              value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)}
                            />
                          </div>
                        </>
                      )}
                      <p className="text-xs text-[#8B6A4F] pb-2">
                        Item total{" "}
                        <b className="text-[#2D1400]">
                          {inr(
                            fixedRate * retailQty +
                            (isPizza ? (Number(extraCheese) || 0) + (Number(deliveryFee) || 0) : 0)
                          )}
                        </b>
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] font-bold text-[#8B6A4F] uppercase tracking-wider">
                      2. Client &amp; discount per item
                    </p>

                    <datalist id="client-names">
                      {clientSuggestions.map((n) => <option key={n} value={n} />)}
                    </datalist>

                    <div className="space-y-2">
                      {clientRows.map((row, idx) => {
                        const net = rowNetRate(row);
                        const disc = Number(row.discount) || 0;
                        return (
                          <div key={row.id} className="rounded-xl border border-[#E8D5C0] bg-[#FFF8F0]/50 p-3 space-y-2">
                            <div className="flex gap-2 flex-wrap items-end">
                              <div className="flex-1 min-w-[170px]">
                                <label className={miniLabelCls}>Client {idx + 1} (select or enter)</label>
                                <input
                                  list="client-names"
                                  placeholder="Client name (optional)"
                                  className={inputCls}
                                  value={row.clientName}
                                  onChange={(e) => updateClientRow(row.id, "clientName", e.target.value)}
                                />
                              </div>
                              <div className="w-20">
                                <label className={miniLabelCls}>Qty</label>
                                <input
                                  type="number" min="1" className={`${inputCls} text-center`}
                                  value={row.qty}
                                  onChange={(e) => updateClientRow(row.id, "qty", parseInt(e.target.value) || 1)}
                                />
                              </div>
                              <div className="w-32">
                                <label className={miniLabelCls}>Discount / item (₹)</label>
                                <input
                                  type="number" min="0" placeholder="0" className={inputCls}
                                  value={row.discount}
                                  onChange={(e) => updateClientRow(row.id, "discount", e.target.value)}
                                />
                              </div>
                              {clientRows.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeClientRow(row.id)}
                                  className="text-red-500 hover:bg-red-50 p-2 rounded-xl mb-0.5"
                                  title="Remove client"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] text-[#8B6A4F]">
                              Rate ₹{fixedRate}
                              {disc > 0 && ` − ₹${disc} = ₹${net}`} × {row.qty} ={" "}
                              <b className="text-[#2D1400]">{inr(net * row.qty)}</b>
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={addClientRow}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#F5A623] hover:underline"
                    >
                      <UserPlus size={14} /> Add another client
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={addToCart}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#2D1400] px-4 py-2.5 rounded-xl hover:opacity-90"
                >
                  <Plus size={14} /> Add to Sale
                </button>
              </div>
            )}
          </div>

          {/* ── Cart ── */}
          <div className={cardCls}>
            <h2 className="text-sm font-bold text-[#2D1400]">
              Line Items{cartItems.length > 0 && <span className="text-[#8B6A4F] font-medium"> ({cartItems.length})</span>}
            </h2>
            {cartItems.length === 0 ? (
              <p className="text-xs text-[#8B6A4F]">No items added yet.</p>
            ) : (
              <div className="border border-[#E8D5C0] rounded-xl divide-y divide-[#E8D5C0]/60">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3 px-4 py-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-[#2D1400] truncate">{item.name}</p>
                      <p className="text-[#8B6A4F] mt-1">
                        {item.clientName && (
                          <span className="inline-block bg-[#FFF8F0] border border-[#E8D5C0] text-[#2D1400] font-bold px-1.5 py-0.5 rounded-md mr-1.5">
                            {item.clientName}
                          </span>
                        )}
                        {item.quantity} ×{" "}
                        {item.discountPerItem > 0 ? (
                          <>
                            <s>₹{item.price + item.discountPerItem}</s> ₹{item.price}
                          </>
                        ) : (
                          `₹${item.price}`
                        )}
                      </p>
                      {(item.extraCheese > 0 || item.deliveryFee > 0) && (
                        <p className="text-[11px] text-[#8B6A4F] mt-0.5">
                          {item.extraCheese > 0 && `+ Extra Cheese ₹${item.extraCheese}`}
                          {item.extraCheese > 0 && item.deliveryFee > 0 && " · "}
                          {item.deliveryFee > 0 && `+ Delivery ₹${item.deliveryFee}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-[#2D1400]">₹{lineTotal(item).toFixed(2)}</span>
                      {/* delete button waisa hi */}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-[#2D1400]">₹{(item.price * item.quantity).toFixed(2)}</span>
                      <button type="button" onClick={() => removeCartItem(idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: sale details, payment, totals ── */}
        <div className="lg:col-span-2 space-y-5 lg:sticky lg:top-4">
          <div className={cardCls}>
            <div>
              <label className={labelCls}>Order Source</label>
              <div className="flex gap-2 flex-wrap">
                {SALE_TYPES.map((t) => (
                  <button key={t} type="button" onClick={() => setSaleType(t)} className={chipCls(saleType === t)}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Branch</label>
              <select className={inputCls} value={branch} onChange={(e) => setBranch(e.target.value)}>
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div className={cardCls}>
            <div>
              <label className={labelCls}>Payment Method</label>
              <div className="flex gap-2 flex-wrap">
                {PAYMENT_METHODS.map((m) => (
                  <button key={m} type="button" onClick={() => setPaymentMethod(m)} className={chipCls(paymentMethod === m)}>{m}</button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Payment Status</label>
              <div className="flex gap-2 flex-wrap">
                {PAYMENT_STATUSES.map((s) => (
                  <button key={s} type="button" onClick={() => setPaymentStatus(s)} className={chipCls(paymentStatus === s)}>{s}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={miniLabelCls}>Overall Discount (₹)</label>
                <input type="number" min="0" className={inputCls} value={discount} onChange={(e) => setDiscount(e.target.value)} />
              </div>
              <div>
                <label className={miniLabelCls}>Tax (₹)</label>
                <input type="number" min="0" className={inputCls} value={tax} onChange={(e) => setTax(e.target.value)} />
              </div>
            </div>

            <div>
              <label className={miniLabelCls}>Notes</label>
              <textarea rows={2} className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional remarks…" />
            </div>

            <div className="border-t border-[#E8D5C0] pt-4 space-y-1">
              <div className="flex justify-between text-xs text-[#8B6A4F]">
                <span>Subtotal</span><span>{inr(subTotal)}</span>
              </div>
              {clientSavings > 0 && (
                <div className="flex justify-between text-[11px] text-[#8B6A4F]">
                  <span>(Client discounts already applied)</span><span>{inr(clientSavings)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-[#8B6A4F]">
                <span>Overall Discount</span><span>-{inr(discount)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#8B6A4F]">
                <span>Tax</span><span>+{inr(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-[#2D1400] pt-1">
                <span>Grand Total</span><span>{inr(grandTotal)}</span>
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
          </div>
        </div>
      </div>
    </form>
  );
}