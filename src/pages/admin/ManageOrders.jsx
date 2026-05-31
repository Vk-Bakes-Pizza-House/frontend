// admin/ManageOrders.jsx
// ─────────────────────────────────────────────────────────────
// View incoming orders, update status, reply on WhatsApp.
// Fetches from backend using orderStore.
// Status flow: Pending → Confirmed → Preparing → Delivered
//                                              → Cancelled
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import {
  Search, MessageCircle, ChevronDown,
  Clock, CheckCircle, Truck, XCircle, Package,
} from "lucide-react";
import { C } from "./Dashboard";
import useOrderStore from "../../store/orderStore";


const INIT_ORDERS = [
  {
    id: "#1042",
    customer: "Priya S.",
    phone: "9123456780",
    address: "Flat 3B, Sunrise Apartments",
    items: [
      { name:"Veg Cheese Bake",  qty:3, price:89 },
    ],
    type: "delivery",
    status: "Confirmed",
    note: "",
    time: "45 min ago",
    ts: Date.now() - 45*60000,
  },
  {
    id: "#1039",
    customer: "Suresh P.",
    phone: "9012345678",
    address: "",
    items: [
      { name:"Custom Cake 1kg Chocolate", qty:1, price:450 },
    ],
    type: "pickup",
    status: "Delivered",
    note: "Message: Happy Birthday Raj!",
    time: "1 hr ago",
    ts: Date.now() - 60*60000,
  },
  {
    id: "#1038",
    customer: "Meena R.",
    phone: "9345678901",
    address: "7, MG Road, Opp. Temple",
    items: [
      { name:"Butterscotch Cake", qty:1, price:320 },
      { name:"Vanilla Ice Cream", qty:2, price:50  },
    ],
    type: "delivery",
    status: "Cancelled",
    note: "Customer cancelled",
    time: "2 hr ago",
    ts: Date.now() - 120*60000,
  },
];

const STATUSES = ["Pending","Confirmed","Preparing","Delivered","Cancelled"];

const STATUS_META = {
  Pending:   { bg:"#FEF9C3", color:"#854D0E", icon:Clock,         next:["Confirmed","Cancelled"] },
  Confirmed: { bg:"#DBEAFE", color:"#1E40AF", icon:CheckCircle,   next:["Preparing","Cancelled"] },
  Preparing: { bg:"#FFF3D6", color:"#B45309", icon:Package,       next:["Delivered","Cancelled"] },
  Delivered: { bg:"#DCFCE7", color:"#166534", icon:Truck,         next:[] },
  Cancelled: { bg:"#FEE2E2", color:"#991B1B", icon:XCircle,       next:[] },
};

const WA = "919999999999"; // ← Replace with your WhatsApp number

// ── Status badge ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span style={{ ...m, display:"flex", alignItems:"center", gap:4,
      padding:"4px 10px", borderRadius:20, fontSize:11, fontFamily:C.f2, fontWeight:600,
      width:"fit-content" }}>
      <Icon size={11} />
      {status}
    </span>
  );
}

// ── Order card ───────────────────────────────────────────────
function OrderCard({ order, onStatus }) {
  const [open, setOpen] = useState(false);
  const sub   = order.items.reduce((s, i) => s + i.qty * i.price, 0);
  const hasDlv = order.type === "delivery";
  const total  = sub + (hasDlv ? 20 : 0);
  const meta   = STATUS_META[order.status];

  const waReply = (msg) =>
    window.open(`https://wa.me/${order.phone.replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`, "_blank");

  const confirmMsg = `✅ Hi ${order.customer.split(" ")[0]}! Your order ${order.id} is confirmed at VK Bakes. ${hasDlv ? "We'll deliver in ~25-30 mins." : "It'll be ready for pickup soon!"} Thank you! 🍕`;
  const readyMsg   = `📦 Your order ${order.id} is being prepared at VK Bakes! ${hasDlv ? "Our delivery partner is on the way 🛵" : "Ready for pickup in a few minutes!"} `;
  const doneMsg    = `🎉 Your order ${order.id} has been delivered! Hope you enjoy it. Feel free to share your feedback 😊 — VK Bakes`;

  return (
    <div style={{
      background:   "white",
      border:       `1px solid ${C.border}`,
      borderRadius: 12,
      overflow:     "hidden",
      borderLeft:   `4px solid ${meta.color}`,
    }}>
      {/* Summary row */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", flexWrap:"wrap" }}
      >
        <div style={{ flex:"0 0 60px" }}>
          <div style={{ fontFamily:C.f2, fontWeight:700, color:C.red, fontSize:13 }}>{order.id}</div>
          <div style={{ fontFamily:C.f2, color:C.muted, fontSize:11, marginTop:1 }}>{order.time}</div>
        </div>
        <div style={{ flex:1, minWidth:120 }}>
          <div style={{ fontFamily:C.f2, fontWeight:600, color:C.mid, fontSize:13 }}>{order.customer}</div>
          <div style={{ fontFamily:C.f2, color:C.muted, fontSize:11 }}>
            {order.items.map(i => `${i.qty}×${i.name}`).join(", ")}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <span style={{ fontFamily:C.f2, fontWeight:700, color:C.mid, fontSize:14 }}>₹{total}</span>
          <StatusBadge status={order.status} />
          <ChevronDown size={16} color={C.muted}
            style={{ transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }} />
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{ borderTop:`1px solid ${C.border}`, padding:"16px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
            {/* Items */}
            <div>
              <div style={{ fontFamily:C.f2, fontWeight:700, color:C.mid, fontSize:12, letterSpacing:1, marginBottom:8 }}>ITEMS</div>
              {order.items.map((item, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", fontFamily:C.f2, fontSize:13, marginBottom:4 }}>
                  <span style={{ color:C.muted }}>{item.qty}× {item.name}</span>
                  <span style={{ fontWeight:600, color:C.mid }}>₹{item.qty*item.price}</span>
                </div>
              ))}
              <div style={{ borderTop:`1px dashed ${C.border}`, marginTop:8, paddingTop:8 }}>
                {hasDlv && (
                  <div style={{ display:"flex", justifyContent:"space-between", fontFamily:C.f2, fontSize:12, color:C.muted, marginBottom:3 }}>
                    <span>Delivery charge</span><span>₹20</span>
                  </div>
                )}
                <div style={{ display:"flex", justifyContent:"space-between", fontFamily:C.f2, fontWeight:700, color:C.mid, fontSize:14 }}>
                  <span>Total</span><span>₹{total}</span>
                </div>
                <div style={{ fontFamily:C.f2, fontSize:11, color:C.muted, marginTop:3 }}>💵 Cash on Delivery</div>
              </div>
            </div>
            {/* Info */}
            <div>
              <div style={{ fontFamily:C.f2, fontWeight:700, color:C.mid, fontSize:12, letterSpacing:1, marginBottom:8 }}>DETAILS</div>
              <div style={{ fontFamily:C.f2, fontSize:13, color:C.muted, lineHeight:1.8 }}>
                <div>📱 {order.phone}</div>
                {hasDlv && order.address && <div>📍 {order.address}</div>}
                <div>{hasDlv ? "🚚 Home Delivery" : "🏪 Store Pickup"}</div>
                {order.note && <div style={{ color:C.red, fontStyle:"italic" }}>💬 {order.note}</div>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {/* Status update buttons */}
            {meta.next.map(s => (
              <button key={s} onClick={() => onStatus(order.id, s)} style={{
                padding:"8px 14px", borderRadius:8,
                background:s==="Cancelled"?"#FFF5F5":"#F0FDF4",
                border:`1px solid ${s==="Cancelled"?"#FEE2E2":"#DCFCE7"}`,
                fontFamily:C.f2, fontSize:12, fontWeight:600,
                color:s==="Cancelled"?"#991B1B":"#166534",
              }}>
                Mark as {s}
              </button>
            ))}
            {/* WhatsApp reply buttons */}
            {order.status === "Pending" && (
              <button onClick={() => waReply(confirmMsg)} style={{
                padding:"8px 14px", borderRadius:8, background:"#DCFCE7",
                border:"1px solid #BBF7D0", fontFamily:C.f2, fontSize:12, fontWeight:600, color:"#166534",
                display:"flex", alignItems:"center", gap:5,
              }}>
                <MessageCircle size={13} /> WhatsApp Confirm
              </button>
            )}
            {order.status === "Confirmed" && (
              <button onClick={() => waReply(readyMsg)} style={{
                padding:"8px 14px", borderRadius:8, background:"#EFF6FF",
                border:"1px solid #BFDBFE", fontFamily:C.f2, fontSize:12, fontWeight:600, color:"#1E40AF",
                display:"flex", alignItems:"center", gap:5,
              }}>
                <MessageCircle size={13} /> WhatsApp Update
              </button>
            )}
            {order.status === "Preparing" && (
              <button onClick={() => waReply(doneMsg)} style={{
                padding:"8px 14px", borderRadius:8, background:"#FFF7ED",
                border:"1px solid #FED7AA", fontFamily:C.f2, fontSize:12, fontWeight:600, color:"#C2410C",
                display:"flex", alignItems:"center", gap:5,
              }}>
                <MessageCircle size={13} /> WhatsApp Delivered
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function ManageOrders() {
  const {
    orders,
    loading,
    error,
    filters,
    pagination,
    fetchOrders,
    updateStatus,
    setFilter,
    goToPage,
    clearError
  } = useOrderStore();

  const [q, setQ] = useState("");

  // Fetch orders when filters change
  useEffect(() => {
    fetchOrders();
  }, [filters.status]);
  const handleStatusUpdate = async (id, status) => {
    await updateStatus(id, status);
    // Refresh the list to get updated data
    fetchOrders();
  };

  const handleSearch = (searchQuery) => {
    setQ(searchQuery);
    // For now, we'll filter client-side. In production, you might want server-side search
  };

  const visible = orders.filter(o =>
    (filters.status === "all" || o.status === filters.status) &&
    (!q || o.customer?.name?.toLowerCase().includes(q.toLowerCase()) || o._id.includes(q))
  );

  const counts = ["Pending", "Confirmed", "Preparing", "Delivered", "Cancelled"].reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ color: C.red, fontFamily: C.f2, marginBottom: 16 }}>
          Error loading orders: {error}
        </div>
        <button
          onClick={() => { clearError(); fetchOrders(); }}
          style={{
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
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:C.f1, color:C.mid, fontSize:24, fontWeight:700 }}>Manage Orders</h2>
        <p style={{ fontFamily:C.f2, color:C.muted, fontSize:13, marginTop:3 }}>
          {pagination.total} total · {counts.Pending || 0} pending
          {loading && " (Loading...)"}
        </p>
      </div>

      {/* Status tabs */}
      <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4, marginBottom:16, flexWrap:"wrap" }}>
        {["all", "Pending", "Confirmed", "Preparing", "Delivered", "Cancelled"].map(s => {
          const cnt = s === "all" ? orders.length : counts[s] || 0;
          const meta = s !== "all" ? STATUS_META[s] : null;
          return (
            <button key={s} onClick={() => setFilter("status", s)} style={{
              padding:"7px 14px", borderRadius:20, flexShrink:0,
              fontFamily:C.f2, fontSize:12, fontWeight:600,
              background: filters.status === s ? (meta?.color || C.mid) : "white",
              color:      filters.status === s ? "white" : C.mid,
              border:     filters.status === s ? "none" : `1px solid ${C.border}`,
            }}>
              {s.charAt(0).toUpperCase()+s.slice(1)} ({cnt})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ display:"flex", alignItems:"center", gap:8, background:"white",
        border:`1px solid ${C.border}`, borderRadius:8, padding:"0 12px", marginBottom:14 }}>
        <Search size={14} color={C.muted} />
        <input value={q} onChange={e => handleSearch(e.target.value)} placeholder="Search by customer name or order ID…"
          style={{ border:"none", outline:"none", fontFamily:C.f2, fontSize:13, color:C.mid, padding:"10px 0", flex:1 }} />
      </div>

      {/* Order cards */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {visible.map(o => (
          <OrderCard key={o._id} order={{
            ...o,
            id: o._id,
            customer: o.customer?.name || "Unknown",
            phone: o.customer?.phone || "",
            address: o.customer?.address || "",
            items: o.items || [],
            type: o.orderType,
            time: new Date(o.createdAt).toLocaleString(),
            ts: new Date(o.createdAt).getTime()
          }} onStatus={handleStatusUpdate} />
        ))}
        {visible.length === 0 && !loading && (
          <div style={{ padding:"60px 0", textAlign:"center", fontFamily:C.f2, color:C.muted, fontSize:14 }}>
            No orders found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          <button
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            style={{
              padding: "8px 12px",
              background: pagination.page <= 1 ? C.border : C.red,
              color: "white",
              border: "none",
              borderRadius: 6,
              fontFamily: C.f2,
              cursor: pagination.page <= 1 ? "not-allowed" : "pointer"
            }}
          >
            Previous
          </button>
          <span style={{ padding: "8px 12px", fontFamily: C.f2, color: C.mid }}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            style={{
              padding: "8px 12px",
              background: pagination.page >= pagination.pages ? C.border : C.red,
              color: "white",
              border: "none",
              borderRadius: 6,
              fontFamily: C.f2,
              cursor: pagination.page >= pagination.pages ? "not-allowed" : "pointer"
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}