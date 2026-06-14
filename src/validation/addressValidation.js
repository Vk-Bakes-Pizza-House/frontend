 import {z} from "zod"

export const addressValidation = z.object({
  name: z
    .string()
    .trim()
    .min(2,  "Name must be at least 2 characters")
    .max(50, "Name is too long"),
 
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit WhatsApp number"),
 
  address: z
    .string()
    .trim()
    .min(5,  "Address must be at least 5 characters")
    .max(100, "Address is too long"),
});
 
