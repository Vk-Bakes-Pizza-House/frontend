import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

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

  const [form, setForm] = useState({
    name: "",
    rating: 5,
    text: "",
  });

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

    const payload = {
      name: form.name,
      rating: Number(form.rating),
      text: form.text,
    };

    const promise =
      submitReview(payload);

    toast.promise(promise, {

      loading:
        "Submitting review...",

      success: (res) => {

        if (res.success) {

          setForm({
            name: "",
            rating: 5,
            text: "",
          });

          return "Review submitted successfully!";
        }

        throw new Error(
          res.message
        );
      },

      error: (err) =>
        err.message ||
        "Failed to submit review",
    });
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

        {/* REVIEW FORM */}

        <div className="bg-white rounded-3xl p-6 md:p-8 mb-12 shadow-xl">

          <h3 className="text-2xl font-bold text-[#3D1A00] mb-6">
            Give Your Review ⭐
          </h3>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* NAME */}

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            />

            {/* REVIEW */}

            <textarea
              name="text"
              value={form.text}
              onChange={handleChange}
              placeholder="Write your review..."
              rows={4}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 resize-none"
            />

            {/* RATING */}

            <div className="flex items-center gap-4">

              <label className="font-semibold text-gray-700">
                Rating:
              </label>

              <select
                name="rating"
                value={form.rating}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-3 py-2"
              >
                <option value="5">
                  ⭐⭐⭐⭐⭐
                </option>

                <option value="4">
                  ⭐⭐⭐⭐
                </option>

                <option value="3">
                  ⭐⭐⭐
                </option>

                <option value="2">
                  ⭐⭐
                </option>

                <option value="1">
                  ⭐
                </option>
              </select>
            </div>

            {/* BUTTON */}

            <button
              type="submit"
              disabled={submitLoading}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              {submitLoading
                ? "Submitting..."
                : "Submit Review"}
            </button>
          </form>
        </div>

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