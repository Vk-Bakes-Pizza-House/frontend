import { useEffect, useState } from "react";
import { Star,MessageCircle, ThumbsUp  } from "lucide-react";
import { toast } from "sonner";
import { C } from "../data/menu";

import useReviewStore from "../store/reviewStore";

const ReviewsSection = () => {

  // ─────────────────────────────
  // STORE
  // ─────────────────────────────

  const {
    reviews,
    loading,
    submitLoading,

    fetchApprovedReviews,
    submitReview,
  } = useReviewStore();

  // ─────────────────────────────
  // FORM STATE
  // ─────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", rating: 5, text: "" });

  // ─────────────────────────────
  // FETCH REVIEWS
  // ─────────────────────────────

  useEffect(() => {

    fetchApprovedReviews();

  }, []);

  // ─────────────────────────────
  // HANDLE INPUT
  // ─────────────────────────────

  const handleChange = (e) => {

    setForm((prev) => ({
      ...prev,

      [e.target.name]:
        e.target.value,
    }));
  };

  // ─────────────────────────────
  // SUBMIT REVIEW
  // ─────────────────────────────

 const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    const result = await useReviewStore.getState().submitReview(formData);
    setSubmitLoading(false);
    if (result.success) {
      setFormData({ name: "", phone: "", rating: 5, text: "" });
      setShowForm(false);
      // Refresh reviews
      fetchApprovedReviews();
    }
  };

  return (

    <section className="bg-[#3D1A00] py-14 px-4">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="text-center mb-12">

          <p className="text-[#D4A574] tracking-[4px] text-xs font-semibold uppercase">
            Customer Feedback
          </p>

          <h2 className="text-4xl font-bold text-white mt-3">
            Reviews & Ratings
          </h2>
        </div>

 <div style={{ textAlign: "center", marginBottom: 24 }}>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "10px 20px",
              background: C.red,
              color: "white",
              border: "none",
              borderRadius: 8,
              fontFamily: C.f2,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              margin: "0 auto"
            }}
          >
            <MessageCircle size={16} />
            {showForm ? "Cancel Review" : "Write a Review"}
          </button>
        </div>
        {/* REVIEW FORM */}
  {showForm && (
          <div style={{
            background: "white",
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 24,
            marginBottom: 24
          }}>
            <h3 style={{ fontFamily: C.f1, color: C.mid, fontSize: 20, marginBottom: 16 }}>
              Share Your Experience
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontFamily: C.f2, fontSize: 14, fontWeight: 600, color: C.mid, marginBottom: 6 }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      fontFamily: C.f2,
                      fontSize: 14
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: C.f2, fontSize: 14, fontWeight: 600, color: C.mid, marginBottom: 6 }}>
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      fontFamily: C.f2,
                      fontSize: 14
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: C.f2, fontSize: 14, fontWeight: 600, color: C.mid, marginBottom: 6 }}>
                  Rating *
                </label>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 2
                      }}
                    >
                      <Star
                        size={24}
                        fill={star <= formData.rating ? C.gold : "transparent"}
                        color={star <= formData.rating ? C.gold : C.border}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontFamily: C.f2, fontSize: 14, fontWeight: 600, color: C.mid, marginBottom: 6 }}>
                  Your Review *
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  required
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    fontFamily: C.f2,
                    fontSize: 14,
                    resize: "vertical"
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={submitLoading}
                style={{
                  padding: "12px 24px",
                  background: C.red,
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontFamily: C.f2,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: submitLoading ? "not-allowed" : "pointer",
                  opacity: submitLoading ? 0.7 : 1
                }}
              >
                {submitLoading ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        )}

        {/* REVIEWS */}

        {loading ? (

          <div className="text-center text-white">
            Loading reviews...
          </div>

        ) : reviews.length === 0 ? (

          <div className="text-center text-white/70">
            No reviews yet.
          </div>

        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {reviews.map((r) => (

              <div
                key={r._id}
                className="bg-white rounded-2xl p-5 shadow-md"
              >

                {/* STARS */}

                <div className="flex gap-1 mb-3">

                  {[...Array(5)].map(
                    (_, index) => (

                      <Star
                        key={index}
                        size={16}
                        className={
                          index < r.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    )
                  )}
                </div>

                {/* REVIEW */}

                <p className="text-gray-700 leading-relaxed mb-4">
                  "{r.text}"
                </p>
 <span style={{ fontFamily: C.f2, fontSize: 12, color: C.muted }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                {/* NAME */}

                <div className="font-semibold text-red-500">
                  {r.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;