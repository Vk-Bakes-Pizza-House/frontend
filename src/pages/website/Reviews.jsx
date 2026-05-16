import { useState, useEffect } from "react";
import { Star, MessageCircle, ThumbsUp } from "lucide-react";
import useReviewStore from "../../store/reviewStore";
import { C } from "../../data/menu";

const Reviews = () => {
  const { reviews, loading, error, fetchApprovedReviews, averageRating } = useReviewStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", rating: 5, text: "" });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchApprovedReviews();
  }, [fetchApprovedReviews]);

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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < rating ? C.gold : "transparent"}
        color={i < rating ? C.gold : C.border}
      />
    ));
  };

  if (loading) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", padding: "24px 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: C.f2, color: C.mid }}>Loading reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", padding: "24px 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: C.red, fontFamily: C.f2, textAlign: "center" }}>
          Error loading reviews: {error}
          <br />
          <button
            onClick={() => fetchApprovedReviews()}
            style={{
              marginTop: 16,
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
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "24px 16px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontFamily: C.f1, color: C.mid, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            Customer Reviews
          </h2>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {renderStars(Math.round(averageRating()))}
            </div>
            <span style={{ fontFamily: C.f2, color: C.mid, fontSize: 16, fontWeight: 600 }}>
              {averageRating()} ({reviews.length} reviews)
            </span>
          </div>
        </div>

        {/* Review Form Toggle */}
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

        {/* Review Form */}
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

        {/* Reviews List */}
        <div style={{ display: "grid", gap: 16 }}>
          {reviews.map((review) => (
            <div
              key={review._id}
              style={{
                background: "white",
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 20
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: C.red,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontFamily: C.f2,
                  fontSize: 18,
                  fontWeight: 700
                }}>
                  {review.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <h4 style={{ fontFamily: C.f2, fontSize: 16, fontWeight: 600, color: C.mid, margin: 0 }}>
                      {review.name}
                    </h4>
                    <div style={{ display: "flex", gap: 2 }}>
                      {renderStars(review.rating)}
                    </div>
                    <span style={{ fontFamily: C.f2, fontSize: 12, color: C.muted }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontFamily: C.f2, fontSize: 14, color: C.mid, lineHeight: 1.5, margin: 0 }}>
                    {review.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", fontFamily: C.f2, color: C.muted, fontSize: 16 }}>
              No reviews yet. Be the first to share your experience!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;