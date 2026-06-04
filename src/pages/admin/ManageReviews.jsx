// admin/ManageReviews.jsx
// ─────────────────────────────────────────────────────────────
// Moderate customer reviews — approve, reject, or delete.
// Only approved reviews show on the public website.
// Uses reviewStore for backend integration.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { Star, Check, X, Trash2, Search, MessageSquare, AlertTriangle } from "lucide-react";
import useReviewStore from "../../store/reviewStore";

// ── Stars display ────────────────────────────────────────────
function Stars({ n }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          className={i <= n ? "text-[#F5A623] fill-[#F5A623]" : "text-stone-300"}
        />
      ))}
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────
const STATUS_STYLE = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending", border: "border-yellow-500" },
  approved: { bg: "bg-green-100", text: "text-green-800", label: "Approved", border: "border-green-600" },
  rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected", border: "border-red-600" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

// ── Review card ──────────────────────────────────────────────
function ReviewCard({ review, onApprove, onReject, setDeleteTarget }) {
  const isPending = review.status === "pending";
  const isApproved = review.status === "approved";
  const s = STATUS_STYLE[review.status];

  return (
    <div className={`bg-white border border-stone-200 rounded-xl p-4.5 border-l-4 ${s.border} shadow-sm`}>
      {/* Top row */}
      <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
              {review.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-stone-800 text-sm">{review.name}</div>
              <div className="text-stone-500 text-[11px] font-medium">{review.phone} · {review.time}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Stars n={review.rating} />
          <StatusBadge status={review.status} />
        </div>
      </div>

      {/* Item tag */}
      {review.item !== "—" && (
        <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-stone-200 rounded-md px-2 py-0.5 text-[11px] text-stone-500 font-medium mb-2.5">
          <MessageSquare size={10} />
          Ordered: {review.item}
        </div>
      )}

      {/* Review text */}
      <p className="text-stone-700 text-sm font-normal leading-relaxed mb-3.5 italic">
        "{review.text}"
      </p>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        {isPending && (
          <>
            <button
              onClick={() => onApprove(review.id)}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-100 hover:bg-green-200 border border-green-200 rounded-lg text-xs font-semibold text-green-800 transition-colors"
            >
              <Check size={13} /> Approve — Show on Website
            </button>
            <button
              onClick={() => onReject(review.id)}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-100 hover:bg-red-200 border border-red-200 rounded-lg text-xs font-semibold text-red-800 transition-colors"
            >
              <X size={13} /> Reject — Don't Show
            </button>
          </>
        )}
        {isApproved && (
          <button
            onClick={() => onReject(review.id)}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-semibold text-stone-600 transition-colors"
          >
            <X size={13} /> Unpublish
          </button>
        )}
        {review.status === "rejected" && (
          <button
            onClick={() => onApprove(review.id)}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-semibold text-green-800 transition-colors"
          >
            <Check size={13} /> Re-approve
          </button>
        )}
        <button
          onClick={() => setDeleteTarget(review.id)} // Opens delete confirmation modal          className="flex items-center gap-1.5 px-3 py-2 hover:bg-red-50 border border-stone-200 hover:border-red-200 rounded-lg text-xs font-semibold text-stone-500 hover:text-red-600 transition-colors ml-auto"
        >
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
  const [deleteTarget, setDeleteTarget] = useState(null); // Modal state for delete trigger

  useEffect(() => {
    fetchAllReviews();
  }, [fetchAllReviews]);

  const handleApprove = async (id) => {
    await approveReview(id);
    fetchAllReviews();
  };

  const handleReject = async (id) => {
    await rejectReview(id);
    fetchAllReviews();
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteReview(deleteTarget);
      setDeleteTarget(null); // Modal close karega
      setDeleteTarget(null); // Close modal    }
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
        <div className="p-10 text-center">
          <div className="text-red-600 font-semibold mb-4">
            Error loading reviews: {error}
          </div>
          <button
            onClick={() => { clearError(); fetchAllReviews(); }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="relative">
        {/* Header */}
        <div className="flex justify-between items-start flex-wrap gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-black text-stone-800 tracking-tight">Manage Reviews</h2>
            <p className="text-stone-500 text-xs mt-1 font-medium">
              {pendingCount} pending approval · {counts.approved} live on website
              {loading && <span className="text-orange-500 animate-pulse"> (Loading...)</span>}
            </p>
          </div>
          {/* Avg rating pill */}
          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 py-2.5 shadow-sm">
            <Stars n={Math.round(Number(avgRating))} />
            <span className="font-bold text-stone-800 text-base leading-none ml-1">{avgRating}</span>
            <span className="text-stone-400 text-xs font-semibold">avg. rating</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-3.5 flex-wrap">
          {FILTERS.map(f => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${isActive
                    ? "bg-stone-800 text-white border-stone-800 shadow-sm"
                    : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                  }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
              </button>
            );
          })}
        </div>

        {/* Pending alert */}
        {pendingCount > 0 && filter !== "approved" && filter !== "rejected" && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3.5 mb-3.5 text-xs md:text-sm font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>
              <strong>{pendingCount} review{pendingCount > 1 ? "s" : ""}</strong> waiting for your approval before showing on the website.
            </span>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex items-center gap-2.5 bg-white border border-stone-200 rounded-lg px-3 mb-3.5 shadow-sm focus-within:border-stone-400 transition-colors">
          <Search size={14} className="text-stone-400" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by name or review content…"
            className="border-none outline-none text-stone-800 text-sm py-2.5 flex-1 bg-transparent"
          />
        </div>

        {/* Review cards layout */}
        <div className="flex flex-col gap-3">
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
              setDeleteTarget={setDeleteTarget}
            />
          ))}
          {visible.length === 0 && !loading && (
            <div className="py-14 text-center text-stone-400 font-medium text-sm">
              No reviews found.
            </div>
          )}
        </div>

        {/* ── CUSTOM TAILWIND CONFIRMATION MODAL ────────────────── */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">          <div className="bg-white max-w-sm w-full rounded-2xl p-5 border border-stone-200 shadow-2xl transform scale-100 transition-transform duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2 bg-red-50 rounded-xl">
                <AlertTriangle size={22} />
              </div>
              <h3 className="text-base font-black tracking-tight text-stone-900">Permanently Delete?</h3>
            </div>

            <p className="text-xs md:text-sm text-stone-500 leading-relaxed mb-5">
              Kya aap sach mein is review ko permanently delete karna chahte hain? Yeh action revert nahi kiya ja sakta.
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                No, Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
          </div>
        )}
      </div>
    );
  }
}