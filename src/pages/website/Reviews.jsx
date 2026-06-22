// import { useState, useEffect } from "react";
// import { Star, MessageCircle, ThumbsUp } from "lucide-react";
// import useReviewStore from "../../store/reviewStore";
// import { C } from "../../data/menu";

// const Reviews = () => {
//   const { reviews, loading, error, fetchApprovedReviews, averageRating } = useReviewStore();
//   const [showForm, setShowForm] = useState(false);
//   const [formData, setFormData] = useState({ name: "", phone: "", rating: 5, text: "" });
//   const [submitLoading, setSubmitLoading] = useState(false);

//   useEffect(() => {
//     fetchApprovedReviews();
//   }, [fetchApprovedReviews]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitLoading(true);
//     const result = await useReviewStore.getState().submitReview(formData);
//     setSubmitLoading(false);
//     if (result.success) {
//       setFormData({ name: "", phone: "", rating: 5, text: "" });
//       setShowForm(false);
//       // Refresh reviews
//       fetchApprovedReviews();
//     }
//   };

//   const renderStars = (rating) => {
//     return Array.from({ length: 5 }, (_, i) => (
//       <Star
//         key={i}
//         size={16}
//         fill={i < rating ? C.gold : "transparent"}
//         color={i < rating ? C.gold : C.border}
//       />
//     ));
//   };

//   if (loading) {
//     return (
//       <div style={{ background: C.bg, minHeight: "100vh", padding: "24px 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
//         <div style={{ fontFamily: C.f2, color: C.mid }}>Loading reviews...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={{ background: C.bg, minHeight: "100vh", padding: "24px 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
//         <div style={{ color: C.red, fontFamily: C.f2, textAlign: "center" }}>
//           Error loading reviews: {error}
//           <br />
//           <button
//             onClick={() => fetchApprovedReviews()}
//             style={{
//               marginTop: 16,
//               padding: "8px 16px",
//               background: C.red,
//               color: "white",
//               border: "none",
//               borderRadius: 6,
//               fontFamily: C.f2,
//               cursor: "pointer"
//             }}
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ background: C.bg, minHeight: "100vh", padding: "24px 16px" }}>
//       <div style={{ maxWidth: 960, margin: "0 auto" }}>
//         <div style={{ textAlign: "center", marginBottom: 32 }}>
//           <h2 style={{ fontFamily: C.f1, color: C.mid, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
//             Customer Reviews
//           </h2>
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
//             <div style={{ display: "flex", gap: 2 }}>
//               {renderStars(Math.round(averageRating()))}
//             </div>
//             <span style={{ fontFamily: C.f2, color: C.mid, fontSize: 16, fontWeight: 600 }}>
//               {averageRating()} ({reviews.length} reviews)
//             </span>
//           </div>
//         </div>

//         {/* Review Form Toggle */}
//         <div style={{ textAlign: "center", marginBottom: 24 }}>
//           <button
//             onClick={() => setShowForm(!showForm)}
//             style={{
//               padding: "10px 20px",
//               background: C.red,
//               color: "white",
//               border: "none",
//               borderRadius: 8,
//               fontFamily: C.f2,
//               fontSize: 14,
//               fontWeight: 600,
//               cursor: "pointer",
//               display: "flex",
//               alignItems: "center",
//               gap: 8,
//               margin: "0 auto"
//             }}
//           >
//             <MessageCircle size={16} />
//             {showForm ? "Cancel Review" : "Write a Review"}
//           </button>
//         </div>

//         {/* Review Form */}
//         {showForm && (
//           <div style={{
//             background: "white",
//             border: `1px solid ${C.border}`,
//             borderRadius: 12,
//             padding: 24,
//             marginBottom: 24
//           }}>
//             <h3 style={{ fontFamily: C.f1, color: C.mid, fontSize: 20, marginBottom: 16 }}>
//               Share Your Experience
//             </h3>
//             <form onSubmit={handleSubmit}>
//               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
//                 <div>
//                   <label style={{ display: "block", fontFamily: C.f2, fontSize: 14, fontWeight: 600, color: C.mid, marginBottom: 6 }}>
//                     Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     required
//                     style={{
//                       width: "100%",
//                       padding: "10px 12px",
//                       border: `1px solid ${C.border}`,
//                       borderRadius: 6,
//                       fontFamily: C.f2,
//                       fontSize: 14
//                     }}
//                   />
//                 </div>
//                 <div>
//                   <label style={{ display: "block", fontFamily: C.f2, fontSize: 14, fontWeight: 600, color: C.mid, marginBottom: 6 }}>
//                     Phone (optional)
//                   </label>
//                   <input
//                     type="tel"
//                     value={formData.phone}
//                     onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                     style={{
//                       width: "100%",
//                       padding: "10px 12px",
//                       border: `1px solid ${C.border}`,
//                       borderRadius: 6,
//                       fontFamily: C.f2,
//                       fontSize: 14
//                     }}
//                   />
//                 </div>
//               </div>
//               <div style={{ marginBottom: 16 }}>
//                 <label style={{ display: "block", fontFamily: C.f2, fontSize: 14, fontWeight: 600, color: C.mid, marginBottom: 6 }}>
//                   Rating *
//                 </label>
//                 <div style={{ display: "flex", gap: 4 }}>
//                   {[1, 2, 3, 4, 5].map((star) => (
//                     <button
//                       key={star}
//                       type="button"
//                       onClick={() => setFormData({ ...formData, rating: star })}
//                       style={{
//                         background: "none",
//                         border: "none",
//                         cursor: "pointer",
//                         padding: 2
//                       }}
//                     >
//                       <Star
//                         size={24}
//                         fill={star <= formData.rating ? C.gold : "transparent"}
//                         color={star <= formData.rating ? C.gold : C.border}
//                       />
//                     </button>
//                   ))}
//                 </div>
//               </div>
//               <div style={{ marginBottom: 20 }}>
//                 <label style={{ display: "block", fontFamily: C.f2, fontSize: 14, fontWeight: 600, color: C.mid, marginBottom: 6 }}>
//                   Your Review *
//                 </label>
//                 <textarea
//                   value={formData.text}
//                   onChange={(e) => setFormData({ ...formData, text: e.target.value })}
//                   required
//                   rows={4}
//                   style={{
//                     width: "100%",
//                     padding: "10px 12px",
//                     border: `1px solid ${C.border}`,
//                     borderRadius: 6,
//                     fontFamily: C.f2,
//                     fontSize: 14,
//                     resize: "vertical"
//                   }}
//                 />
//               </div>
//               <button
//                 type="submit"
//                 disabled={submitLoading}
//                 style={{
//                   padding: "12px 24px",
//                   background: C.red,
//                   color: "white",
//                   border: "none",
//                   borderRadius: 8,
//                   fontFamily: C.f2,
//                   fontSize: 14,
//                   fontWeight: 600,
//                   cursor: submitLoading ? "not-allowed" : "pointer",
//                   opacity: submitLoading ? 0.7 : 1
//                 }}
//               >
//                 {submitLoading ? "Submitting..." : "Submit Review"}
//               </button>
//             </form>
//           </div>
//         )}

//         {/* Reviews List */}
//         <div style={{ display: "grid", gap: 16 }}>
//           {reviews.map((review) => (
//             <div
//               key={review._id}
//               style={{
//                 background: "white",
//                 border: `1px solid ${C.border}`,
//                 borderRadius: 12,
//                 padding: 20
//               }}
//             >
//               <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
//                 <div style={{
//                   width: 48,
//                   height: 48,
//                   borderRadius: "50%",
//                   background: C.red,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   color: "white",
//                   fontFamily: C.f2,
//                   fontSize: 18,
//                   fontWeight: 700
//                 }}>
//                   {review.name.charAt(0).toUpperCase()}
//                 </div>
//                 <div style={{ flex: 1 }}>
//                   <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
//                     <h4 style={{ fontFamily: C.f2, fontSize: 16, fontWeight: 600, color: C.mid, margin: 0 }}>
//                       {review.name}
//                     </h4>
//                     <div style={{ display: "flex", gap: 2 }}>
//                       {renderStars(review.rating)}
//                     </div>
//                     <span style={{ fontFamily: C.f2, fontSize: 12, color: C.muted }}>
//                       {new Date(review.createdAt).toLocaleDateString()}
//                     </span>
//                   </div>
//                   <p style={{ fontFamily: C.f2, fontSize: 14, color: C.mid, lineHeight: 1.5, margin: 0 }}>
//                     {review.text}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ))}
//           {reviews.length === 0 && (
//             <div style={{ textAlign: "center", padding: "60px 0", fontFamily: C.f2, color: C.muted, fontSize: 16 }}>
//               No reviews yet. Be the first to share your experience!
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Reviews;

import { useEffect, useState, useRef } from "react";
import { Star, MessageCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  Controller,
} from "react-hook-form";

import { C } from "../../data/menu";
import useReviewStore from "../../store/reviewStore";
import reviewSchema from "../../validation/reviewValidation";


const ReviewsSection = ({
  autoOpen = false,
}) => {

  const sectionRef =
    useRef(null);

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  useEffect(() => {

    if (autoOpen) {

      setShowForm(true);

      setTimeout(() => {

        sectionRef.current
          ?.scrollIntoView({
            behavior:
              "smooth",
            block: "start",
          });

      }, 100);

    }

  }, [autoOpen]);
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

  // const [showForm, setShowForm] =
  //   useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      reviewSchema
    ),
    defaultValues: {
      name: "",
      phone: "",
      rating: 5,
      text: "",
    },
  });

  const onSubmit = async (data) => {
    const result =
      await submitReview(data);

    if (result?.success) {
      reset();
      setShowForm(false);
      fetchApprovedReviews();
    }
  };
  // ─────────────────────────────
  // FETCH REVIEWS
  // ─────────────────────────────
  const displayReview = reviews.slice(0, 3)
  useEffect(() => {
    fetchApprovedReviews();
  }, [fetchApprovedReviews]);


  return (

    <section ref={sectionRef}
      className="bg-[#3D1A00] py-14 px-4">

      {/* <div className="max-w-4xl mx-auto"> */}

      {/* HEADER */}

      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-8">

          <p className="text-[#D4A574] tracking-[3px] text-[10px] font-semibold uppercase">
            Customer Feedback
          </p>

          <h2 className="text-2xl md:text-3xl font-bold text-white mt-2">
            Reviews & Ratings
          </h2>

        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="
        flex items-center gap-2
        px-4 py-2
        rounded-lg
        bg-[#D44B1A]
        hover:bg-[#c43f12]
        text-white
        text-sm
        font-semibold
        transition
      "
          >
            <MessageCircle size={16} />
            {showForm ? "Cancel Review" : "Write a Review"}
          </button>
        </div>
        {/* REVIEW FORM */}
        {showForm && (
          <div
            className="
      bg-white
      border border-[#E8D5C0]
      rounded-xl
      p-4 md:p-5
      mb-6
      shadow-sm
    "
          >

            <h3 className="text-lg font-bold text-[#2D1400] mb-4">
              Share Your Experience
            </h3>

            <form onSubmit={handleSubmit(onSubmit)}>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                <div>
                  <label className="block text-xs font-semibold text-[#2D1400] mb-1">
                    Name *
                  </label>

                  <input
                    type="text"
                    {...register("name")}
                    className="
              w-full
              rounded-lg
              border border-[#E8D5C0]
              p-2.5
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-[#D44B1A]
            "
                  />

                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D1400] mb-1">
                    Phone (optional)
                  </label>

                  <input
                    type="tel"
                    {...register("phone")}
                    className="
              w-full
              rounded-lg
              border border-[#E8D5C0]
              p-2.5
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-[#D44B1A]
            "
                  />

                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

              </div>

              <div className="mb-4">

                <label className="block text-xs font-semibold text-[#2D1400] mb-2">
                  Rating *
                </label>

                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                        >
                          <Star
                            size={20}
                            fill={
                              star <= field.value
                                ? C.gold
                                : "transparent"
                            }
                            color={
                              star <= field.value
                                ? C.gold
                                : "#D6D3D1"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  )}
                />

              </div>

              <div className="mb-5">

                <label className="block text-xs font-semibold text-[#2D1400] mb-1">
                  Your Review *
                </label>

                <textarea
                  rows={3}
                  {...register("text")}
                  className="
            w-full
            rounded-lg
            border border-[#E8D5C0]
            p-2.5
            text-sm
            resize-none
            focus:outline-none
            focus:ring-2
            focus:ring-[#D44B1A]
          "
                />

                {errors.text && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.text.message}
                  </p>
                )}

              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="
          px-5 py-2.5
          rounded-lg
          bg-[#D44B1A]
          hover:bg-[#c43f12]
          text-white
          text-sm
          font-semibold
          transition
          disabled:opacity-70
        "
              >
                {submitLoading
                  ? "Submitting..."
                  : "Submit Review"}
              </button>

            </form>
          </div>
        )}

        {/* REVIEWS */}

        {loading ? (

          <div className="text-center text-white">
            Loading reviews...
          </div>

        ) : displayReview.length === 0 ? (

          <div className="text-center text-white/70">
            No reviews yet.
          </div>

        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

            {displayReview.map((r) => (
              <div
                key={r._id}
                className="
    bg-white
    rounded-xl
    p-4
    border border-[#E8D5C0]
    shadow-sm
  "
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

                <p className="text-sm text-stone-700 leading-6 mb-3">
                  "{r.text}"
                </p>
                {/* <span style={{ fontFamily: C.f2, fontSize: 12, color: C.muted }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </span> */}
                {/* NAME */}

                <div className="text-sm font-semibold text-[#D44B1A]">
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