import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useClientStore } from "../../../store/clientStore";
import { CATEGORIES, TERMS, DAYS, STATUS } from "./clientConstants";

const schema = z.object({
  businessName: z.string().min(2, "Business name required"),
  category: z.string().min(1, "Pick a category"),
  area: z.string().min(2, "Area required"),
  contactName: z.string().min(2, "Contact person required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit number"),
  email: z.string().email("Invalid email").or(z.literal("")),
  days: z.array(z.string()).min(1, "Select at least one delivery day"),
  deliveryTime: z.string().min(1, "Delivery time required"),
  items: z.string().min(3, "Add the items they order"),
  creditTerms: z.string().min(1),
  creditLimit: z.coerce.number().min(0),
  status: z.string().optional(),
});

const input =
  "w-full rounded-lg border border-[#E8D5C0] bg-white px-3 py-2.5 text-sm text-[#2D1400] placeholder:text-[#8B6A4F]/60 focus:border-[#F5A623] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30";

const Field = ({ label, error, hint, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-[#8B6A4F]">{label}</span>
    {children}
    {hint && !error && <span className="mt-1 block text-xs text-[#8B6A4F]">{hint}</span>}
    {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
  </label>
);

const Section = ({ title, desc, children }) => (
  <section className="rounded-2xl border border-[#E8D5C0] bg-white p-5 sm:p-6">
    <h2 className="font-bold text-[#2D1400]">{title}</h2>
    {desc && <p className="mt-0.5 text-sm text-[#8B6A4F]">{desc}</p>}
    <div className="mt-4 space-y-4">{children}</div>
  </section>
);

export default function AddClient({ editing, onDone, onCancel }) {
  const { addClient, updateClient } = useClientStore();
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: editing
      ? {
          ...editing,
          email: editing.email || "",
          creditLimit: editing.creditLimit || 0,
          days: editing.days || [],
        }
      : { category: "", creditTerms: "Net 15", creditLimit: 0, days: [], deliveryTime: "05:00", email: "" },
  });

  const days = watch("days");
  const terms = watch("creditTerms");
  const prepaid = terms === "Prepaid / COD";
  const toggleDay = (d) => setValue("days", days.includes(d) ? days.filter((x) => x !== d) : [...days, d], { shouldValidate: true });

  const onSubmit = async (v) => {
    const payload = {
      businessName: v.businessName, category: v.category, area: v.area, contactName: v.contactName,
      phone: v.phone, email: v.email, days: v.days, deliveryTime: v.deliveryTime, items: v.items,
      creditTerms: v.creditTerms, creditLimit: prepaid ? 0 : v.creditLimit,
    };
    const ok = editing
      ? await updateClient(editing._id, { ...payload, status: v.status })
      : await addClient({ ...payload, status: prepaid ? "prepaid" : "pending" });
    if (ok) onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Section title="Business" desc="Who you are supplying.">
          <Field label="Business name" error={errors.businessName?.message}>
            <input className={input} placeholder="e.g. The Roasted Bean Cafe" {...register("businessName")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" error={errors.category?.message}>
              <select className={input} {...register("category")}>
                <option value="">Select</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Area" error={errors.area?.message}>
              <input className={input} placeholder="e.g. Hazratganj" {...register("area")} />
            </Field>
          </div>
        </Section>

        <Section title="Contact">
          <Field label="Contact person" error={errors.contactName?.message}>
            <input className={input} {...register("contactName")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" error={errors.phone?.message}>
              <input className={input} inputMode="numeric" maxLength={10} placeholder="9876543210" {...register("phone")} />
            </Field>
            <Field label="Email (optional)" error={errors.email?.message}>
              <input type="email" className={input} {...register("email")} />
            </Field>
          </div>
        </Section>

        <Section title="Order schedule" desc="When and what you deliver.">
          <Field label="Delivery days" error={errors.days?.message}>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <button type="button" key={d} onClick={() => toggleDay(d)} aria-pressed={days.includes(d)}
                  className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition ${days.includes(d) ? "border-[#2D1400] bg-[#2D1400] text-[#FFF8F0]" : "border-[#E8D5C0] bg-white text-[#8B6A4F] hover:border-[#F5A623]"}`}>
                  {d}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Delivery time" error={errors.deliveryTime?.message}>
              <input type="time" className={input} {...register("deliveryTime")} />
            </Field>
          </div>
          <Field label="Regular items" error={errors.items?.message}>
            <textarea rows={3} className={input} placeholder="e.g. 45 Sourdough, 60 Pastries" {...register("items")} />
          </Field>
        </Section>

        <Section title="Payment terms">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TERMS.map((t) => (
              <button type="button" key={t} onClick={() => setValue("creditTerms", t)} aria-pressed={terms === t}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium ${terms === t ? "border-[#F5A623] bg-[#F5A623]/15 text-[#2D1400]" : "border-[#E8D5C0] bg-white text-[#8B6A4F] hover:border-[#F5A623]"}`}>
                {t}
              </button>
            ))}
          </div>
          {!prepaid && (
            <Field label="Credit limit (₹)" error={errors.creditLimit?.message} hint="Limits above ₹1,00,000 need supervisor sign-off.">
              <input type="number" min={0} className={input} {...register("creditLimit")} />
            </Field>
          )}
          {editing && (
            <Field label="Account status">
              <select className={input} {...register("status")}>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </Field>
          )}
        </Section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6">
        <div className="rounded-2xl border border-[#E8D5C0] bg-white p-5">
          <h3 className="font-bold text-[#2D1400]">{editing ? "Editing" : "New client"}</h3>
          <p className="mt-1 text-sm text-[#8B6A4F]">
            {editing ? editing.businessName : "New clients start as “Pending agreement” until their first invoice is recorded. Prepaid clients are marked “Prepaid only”."}
          </p>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-[#E8D5C0] px-4 py-2.5 text-sm font-semibold text-[#8B6A4F] hover:bg-[#FFF8F0]">Cancel</button>
            <button disabled={isSubmitting} className="flex-1 rounded-lg bg-[#2D1400] px-4 py-2.5 text-sm font-semibold text-[#FFF8F0] hover:bg-[#2D1400]/90 disabled:opacity-60">
              {isSubmitting ? "Saving…" : editing ? "Update" : "Save client"}
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E8D5C0] bg-[#F5A623]/10 p-5 text-sm text-[#2D1400]">
          <p className="font-semibold">Credit rules</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-[#8B6A4F]">
            <li>Credit above ₹1,00,000 needs supervisor sign-off.</li>
            <li>Minimum recurring order ₹2,500 per delivery.</li>
            <li>Net-term clients overdue 14+ days switch to COD.</li>
          </ul>
        </div>
      </aside>
    </form>
  );
}