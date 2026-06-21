// admin/ManageOrders.jsx
import { useState, useEffect } from "react";
import {
  Search, MessageCircle, ChevronDown,
  Clock, CheckCircle, Truck, XCircle, Package,
} from "lucide-react";
import useOrderStore from "../../store/orderStore";

const STATUSES = ["Pending","Confirmed","Preparing","Delivered","Cancelled"];

const STATUS_META = {
  Pending:   { bg:"bg-yellow-50",  text:"text-yellow-800",  border:"border-yellow-200", left:"border-l-yellow-400", icon:Clock,        next:["Confirmed","Cancelled"] },
  Confirmed: { bg:"bg-blue-50",    text:"text-blue-800",    border:"border-blue-200",   left:"border-l-blue-400",   icon:CheckCircle,  next:["Preparing","Cancelled"] },
  Preparing: { bg:"bg-orange-50",  text:"text-orange-800",  border:"border-orange-200", left:"border-l-orange-400", icon:Package,      next:["Delivered","Cancelled"] },
  Delivered: { bg:"bg-green-50",   text:"text-green-800",   border:"border-green-200",  left:"border-l-green-400",  icon:Truck,        next:[] },
  Cancelled: { bg:"bg-red-50",     text:"text-red-800",     border:"border-red-200",    left:"border-l-red-400",    icon:XCircle,      next:[] },
};

// ── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${m.bg} ${m.text}`}>
      <Icon size={11} />
      {status}
    </span>
  );
}

// ── Order Card ───────────────────────────────────────────────
function OrderCard({ order, onStatus,deleteOrder }) {
  const [open, setOpen] = useState(false);
  const sub    = order.items.reduce((s, i) => s + i.qty * i.price, 0);
  const hasDlv = order.type === "delivery";
  const total  = sub + (hasDlv ? 20 : 0);
  const meta   = STATUS_META[order.status];
const item =  order.items.map(i => `${i.qty}× ${i.name}`).join(", ")

  const waReply = (msg) =>
    window.open(`https://wa.me/${order.phone.replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`, "_blank");

const msg = {
      Confirmed:  `🍕 VK Bakes\n\nHii! Your order (${item}) has been confirmed.\nWe'll deliver in ~25-30 mins.\nThank you ❤️`,
      Preparing:  `👨‍🍳 VK Bakes\n\nYour order (${item}) is now being prepared.\nReady soon!`,
      Delivered:  `🚚 VK Bakes\n\nYour order (${item}) has been delivered.\nHope you enjoy it! 😊\nThank you ❤️ — VK Bakes`,
      Cancelled:  `❌ VK Bakes\n\nYour order (${item}) has been cancelled.\nPlease contact us for support.`,
    };



  return (
    <div className={`bg-white border border-stone-200 rounded-xl overflow-hidden border-l-4 ${meta.left}`}>
      
      {/* Summary Row */}
      <div
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer flex-wrap"
      >
        {/* Order ID + Time */}
        <div className="w-16 flex-shrink-0">
          <div className="text-[#D44B1A] font-bold text-sm">{order.id.toString().slice(-6).toUpperCase()}</div>
          <div className="text-stone-400 text-[11px] mt-0.5">{order.time}</div>
        </div>

        {/* Customer + Items */}
        <div className="flex-1 min-w-0">
          <div className="text-stone-800 font-semibold text-sm">{order.customer}</div>
          <div className="text-stone-400 text-[11px] truncate">
            {order.items.map(i => `${i.qty}× ${i.name}`).join(", ")}
          </div>
        </div>

        {/* Total + Status + Arrow */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-stone-700 text-sm">₹{total}</span>
          <StatusBadge status={order.status} />
          <ChevronDown
            size={16}
            className={`text-stone-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Expanded Detail */}
      {open && (
        <div className="border-t border-stone-100 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            
            {/* Items */}
            <div>
              <div className="text-[11px] font-bold text-stone-500 tracking-widest uppercase mb-2">Items</div>
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm mb-1">
                  <span className="text-stone-500">{item.qty}× {item.name}</span>
                  <span className="font-semibold text-stone-700">₹{item.qty * item.price}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-stone-200 mt-2 pt-2">
                {hasDlv && (
                  <div className="flex justify-between text-xs text-stone-400 mb-1">
                    <span>Delivery charge</span><span>₹20</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-stone-800 text-sm">
                  <span>Total</span><span>₹{total}</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-1">💵 Cash on Delivery</div>
              </div>
            </div>

            {/* Details */}
            <div>
              <div className="text-[11px] font-bold text-stone-500 tracking-widest uppercase mb-2">Details</div>
              <div className="text-sm text-stone-500 space-y-1.5">
                <div>📱 {order.phone}</div>
                {hasDlv && order.address && <div>📍 {order.address}</div>}
                <div>{hasDlv ? "🚚 Home Delivery" : "🏪 Store Pickup"}</div>
                {order.note && (
                  <div className="text-[#D44B1A] italic">💬 {order.note}</div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            
            {/* Status Update Buttons */}
            {meta.next.map(s => (
              <button
                key={s}
                onClick={() => onStatus(order.id, s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  s === "Cancelled"
                    ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                    : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                }`}
              >
                Mark as {s}
              </button>
            ))}

            {/* WhatsApp Buttons */}
            {order.status === "Pending" && (
              <button
                onClick={() => waReply(msg.Confirmed)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors"
              >
                <MessageCircle size={12} /> WhatsApp Confirm
              </button>
            )}
            {order.status === "Confirmed" && (
              <button
                onClick={() => waReply(msg.Preparing)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <MessageCircle size={12} /> WhatsApp Update
              </button>
            )}
            {order.status === "Preparing" && (
              <button
                onClick={() => waReply(msg.Delivered)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 transition-colors"
              >
                <MessageCircle size={12} /> WhatsApp Delivered

              </button>
            )}
            {order.status == "Cancelled" && (
            <button
              onClick={deleteOrder.bind(null, order.id)}
              title={order.status !== "Cancelled" ? "Are you sure you want to cancel this order?" : "Are you sure you want to delete this order?"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors"
            >
                <MessageCircle size={12} /> Delete Order
            
            </button>
           )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function ManageOrders() {
  const {
    orders, loading, error, filters,
    pagination, fetchOrders, updateStatus,
    setFilter, goToPage, clearError,deleteOrder,
  } = useOrderStore();

  const [q, setQ] = useState("");

  useEffect(() => { fetchOrders(); }, [filters.status]);

  const handleStatusUpdate = async (id, status) => {
    await updateStatus(id, status);
    fetchOrders();
  };

  const visible = orders.filter(o =>
    (filters.status === "all" || o.status === filters.status) &&
    (!q || o.customer?.name?.toLowerCase().includes(q.toLowerCase()) || o._id?.includes(q))
  );

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="text-[#D44B1A] text-sm">Error loading orders: {error}</div>
      <button
        onClick={() => { clearError(); fetchOrders(); }}
        className="px-4 py-2 bg-[#D44B1A] text-white rounded-lg text-sm font-semibold"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-stone-800">Manage Orders</h2>
        <p className="text-stone-400 text-sm mt-1">
          {pagination.total} total · {counts.Pending || 0} pending
          {loading && " · Loading..."}
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {["all", ...STATUSES].map(s => {
          const cnt  = s === "all" ? orders.length : counts[s] || 0;
          const active = filters.status === s;
          const meta = s !== "all" ? STATUS_META[s] : null;
          return (
            <button
              key={s}
              onClick={() => setFilter("status", s)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex-shrink-0 ${
                active
                  ? `${meta?.bg || "bg-stone-800"} ${meta?.text || "text-white"} border ${meta?.border || "border-stone-700"}`
                  : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} ({cnt})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 mb-4">
        <Search size={14} className="text-stone-400" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by customer name or order ID…"
          className="flex-1 py-2.5 text-sm text-stone-700 outline-none bg-transparent"
        />
      </div>

      {/* Order Cards */}
      <div className="flex flex-col gap-3">
        {visible.map(o => (
          <OrderCard
            key={o._id}
            order={{
              ...o,
              id: o._id,
              customer: o.customer?.name || "Unknown",
              phone: o.customer?.number || "",
              address: o.customer?.address || "",
              items: o.items || [],
              type: o.orderType,
              time: new Date(o.createdAt).toLocaleString("en-IN"),
              ts: new Date(o.createdAt).getTime(),
            }}
            onStatus={handleStatusUpdate}
            deleteOrder={deleteOrder}
          />
        ))}
        {visible.length === 0 && !loading && (
          <div className="py-16 text-center text-stone-400 text-sm">
            No orders found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#D44B1A] text-white disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-stone-500">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#D44B1A] text-white disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}