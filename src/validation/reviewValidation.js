import { z } from "zod";

const reviewSchema = z.object({
  name: z
    .string()
    .min(2, "Name is required"),

phone: z
  .string()
  .regex(
    /^[6-9]\d{9}$/,
    "Enter a valid phone number"
  )
  .optional()
  .or(z.literal("")),
  
  text: z
    .string()
    .min(
      10,
      "Review must be at least 10 characters"
    ),

  rating: z
    .number()
    .min(1, "Select rating")
    .max(5),
});

export default reviewSchema;