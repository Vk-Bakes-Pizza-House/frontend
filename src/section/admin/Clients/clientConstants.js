export const CATEGORIES = ["Cafe & Bistro", "Restaurant", "Gourmet Grocer", "Hotel Chain", "Catering", "Pizzeria"];
export const TERMS = ["Prepaid / COD", "Net 15", "Net 30", "Net 45"];
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const STATUS = {
  active: { label: "Active", cls: "bg-green-100 text-green-800" },
  review: { label: "Credit review", cls: "bg-red-100 text-red-700" },
  prepaid: { label: "Prepaid only", cls: "bg-[#E8D5C0] text-[#8B6A4F]" },
  pending: { label: "Pending agreement", cls: "bg-[#F5A623]/20 text-[#8a5a00]" },
};

export const inr = (n = 0) => "₹" + Number(n).toLocaleString("en-IN");
export const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();