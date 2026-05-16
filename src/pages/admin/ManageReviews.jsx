// admin/ManageReviews.jsx
// ─────────────────────────────────────────────────────────────
// Moderate customer reviews — approve, reject, or delete.
// Only approved reviews show on the public website.
// Uses reviewStore for backend integration.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { Star, Check, X, Trash2, Search, MessageSquare } from "lucide-react";
import { C } from "./Dashboard";
import useReviewStore from "../../store/reviewStore";

// ── Stars display ────────────────────────────────────────────
function Stars({ n }) {
  return (
    <div style={{ display:"flex", gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={13} fill={i<=n?C.gold:"none"} color={i<=n?C.gold:"#D0C0B0"} />
      ))}
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────
const STATUS_STYLE = {
  pending:  { bg:"#FEF9C3", color:"#854D0E", label:"Pending"  },
  approved: { bg:"#DCFCE7", color:"#166534", label:"Approved" },
  rejected: { bg:"#FEE2E2", color:"#991B1B", label:"Rejected" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status];
  return (
    <span style={{ background:s.bg, color:s.color, padding:"3px 10px", borderRadius:20,
      fontSize:11, fontFamily:C.f2, fontWeight:600 }}>
      {s.label}
    </span>
  );
}

// ── Review card ──────────────────────────────────────────────
function ReviewCard({ review, onApprove, onReject, onDelete }) {
  const isPending  = review.status === "pending";
  const isApproved = review.status === "approved";

  return (
    <div style={{
      background:   "white",
      border:       `1px solid ${C.border}`,
      borderRadius: 12,
      padding:      "18px",
      borderLeft:   `4px solid ${STATUS_STYLE[review.status].color}`,
    }}>
      {/* Top row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8, marginBottom:12 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:36, height:36, borderRadius:"50%", background:C.red,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:C.f2, fontWeight:700, color:"white", fontSize:14, flexShrink:0,
            }}>
              {review.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily:C.f2, fontWeight:700, color:C.mid, fontSize:14 }}>{review.name}</div>
              <div style={{ fontFamily:C.f2, color:C.muted, fontSize:11 }}>{review.phone} · {review.time}</div>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Stars n={review.rating} />
          <StatusBadge status={review.status} />
        </div>
      </div>

      {/* Item tag */}
      {review.item !== "—" && (
        <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"#FFF0E0",
          border:`1px solid ${C.border}`, borderRadius:6, padding:"3px 9px",
          fontFamily:C.f2, fontSize:11, color:C.muted, marginBottom:10 }}>
          <MessageSquare size={10} />
          Ordered: {review.item}
        </div>
      )}

      {/* Review text */}
      <p style={{ fontFamily:C.f2, color:"#3D2B1A", fontSize:13, lineHeight:1.65, marginBottom:14 }}>
        "{review.text}"
      </p>

      {/* Action buttons */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {isPending && (
          <>
            <button onClick={() => onApprove(review.id)} style={{
              display:"flex", alignItems:"center", gap:5,
              padding:"8px 14px", background:"#DCFCE7", border:"1px solid #BBF7D0",
              borderRadius:8, fontFamily:C.f2, fontSize:12, fontWeight:600, color:"#166534",
            }}>
              <Check size={13} /> Approve — Show on Website
            </button>
            <button onClick={() => onReject(review.id)} style={{
              display:"flex", alignItems:"center", gap:5,
              padding:"8px 14px", background:"#FEE2E2", border:"1px solid #FECACA",
              borderRadius:8, fontFamily:C.f2, fontSize:12, fontWeight:600, color:"#991B1B",
            }}>
              <X size={13} /> Reject — Don't Show
            </button>
          </>
        )}
        {isApproved && (
          <button onClick={() => onReject(review.id)} style={{
            display:"flex", alignItems:"center", gap:5,
            padding:"8px 14px", background:"#FFF5F5", border:`1px solid ${C.border}`,
            borderRadius:8, fontFamily:C.f2, fontSize:12, fontWeight:600, color:C.muted,
          }}>
            <X size={13} /> Unpublish
          </button>
        )}
        {review.status === "rejected" && (
          <button onClick={() => onApprove(review.id)} style={{
            display:"flex", alignItems:"center", gap:5,
            padding:"8px 14px", background:"#F0FDF4", border:"1px solid #DCFCE7",
            borderRadius:8, fontFamily:C.f2, fontSize:12, fontWeight:600, color:"#166534",
          }}>
            <Check size={13} /> Re-approve
          </button>
        )}
        <button onClick={() => {
          if (window.confirm("Permanently delete this review?")) onDelete(review.id);
        }} style={{
          display:"flex", alignItems:"center", gap:5,
          padding:"8px 14px", border:`1px solid ${C.border}`,
          borderRadius:8, fontFamily:C.f2, fontSize:12, fontWeight:600, color:C.muted,
        }}>
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function ManageReviews() {
  const {
    allReviews,
    pendingCount,
    loading,
    error,
    fetchAllReviews,
    approveReview,
    rejectReview,
    deleteReview,
    clearError
  } = useReviewStore();

  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchAllReviews();
  }, [fetchAllReviews]);

  const handleApprove = async (id) => {
    await approveReview(id);
    fetchAllReviews(); // Refresh to get updated counts
  };

  const handleReject = async (id) => {
    await rejectReview(id);
    fetchAllReviews(); // Refresh to get updated counts
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this review?")) {
      await deleteReview(id);
      fetchAllReviews(); // Refresh to get updated counts
    }
  };

  const counts = {
    all: allReviews.length,
    pending: allReviews.filter(r => r.status === "pending").length,
    approved: allReviews.filter(r => r.status === "approved").length,
    rejected: allReviews.filter(r => r.status === "rejected").length,
  };

  const avgRating = allReviews.length
    ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
    : "—";

  const visible = allReviews.filter(r =>
    (filter === "all" || r.status === filter) &&
    (r.name.toLowerCase().includes(q.toLowerCase()) ||
     r.text.toLowerCase().includes(q.toLowerCase()))
  );

  const FILTERS = ["all", "pending", "approved", "rejected"];

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ color: C.red, fontFamily: C.f2, marginBottom: 16 }}>
          Error loading reviews: {error}
        </div>
        <button
          onClick={() => { clearError(); fetchAllReviews(); }}
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: C.f1, color: C.mid, fontSize: 24, fontWeight: 700 }}>Manage Reviews</h2>
          <p style={{ fontFamily: C.f2, color: C.muted, fontSize: 13, marginTop: 3 }}>
            {pendingCount} pending approval · {counts.approved} live on website
            {loading && " (Loading...)"}
          </p>
        </div>
        {/* Avg rating pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white",
          border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 16px" }}>
          <Stars n={Math.round(Number(avgRating))} />
          <span style={{ fontFamily: C.f2, fontWeight: 700, color: C.mid, fontSize: 16 }}>{avgRating}</span>
          <span style={{ fontFamily: C.f2, color: C.muted, fontSize: 12 }}>avg. rating</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {FILTERS.map(f => {
          const s = f !== "all" ? STATUS_STYLE[f] : null;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 14px", borderRadius: 20,
              fontFamily: C.f2, fontSize: 12, fontWeight: 600,
              background: filter === f ? (s?.color || C.mid) : "white",
              color: filter === f ? "white" : C.mid,
              border: filter === f ? "none" : `1px solid ${C.border}`,
            }}>
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
            </button>
          );
        })}
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && filter !== "approved" && filter !== "rejected" && (
        <div style={{ background: "#FEF9C3", border: "1px solid #FDE68A", borderRadius: 8,
          padding: "10px 14px", marginBottom: 14, fontFamily: C.f2, fontSize: 13, color: "#854D0E" }}>
          ⚠️ <strong>{pendingCount} review{pendingCount > 1 ? "s" : ""}</strong> waiting for your approval before showing on the website.
        </div>
      )}

      {/* Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white",
        border: `1px solid ${C.border}`, borderRadius: 8, padding: "0 12px", marginBottom: 14 }}>
        <Search size={14} color={C.muted} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or review content…"
          style={{ border: "none", outline: "none", fontFamily: C.f2, fontSize: 13, color: C.mid, padding: "10px 0", flex: 1 }} />
      </div>

      {/* Review cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visible.map(r => (
          <ReviewCard
            key={r._id}
            review={{
              ...r,
              id: r._id,
              time: new Date(r.createdAt).toLocaleDateString(),
              item: r.itemOrdered || "—"
            }}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
          />
        ))}
        {visible.length === 0 && !loading && (
          <div style={{ padding: "60px 0", textAlign: "center", fontFamily: C.f2, color: C.muted, fontSize: 14 }}>
            No reviews found.
          </div>
        )}
      </div>
    </div>
  );
}