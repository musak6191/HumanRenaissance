"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const emptyForm = { title: "", prompt: "", budget: "", timeline: "1–2 months" };
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function CommissionForm() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setMessage({ type: "", text: "" });
  }

  async function submitCommission(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${apiUrl}/api/commissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "We could not publish your commission.");
      setForm(emptyForm);
      setMessage({ type: "success", text: "Your commission is now live on the market." });
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="border-t border-ink pt-6" onSubmit={submitCommission}>
      <label className="form-label">Give it a name
        <input className="form-input" required name="title" value={form.title} onChange={updateForm} placeholder="e.g. A portrait of my summer" />
      </label>
      <label className="form-label">Your prompt
        <textarea className="form-input min-h-[130px]" required minLength={20} name="prompt" value={form.prompt} onChange={updateForm} placeholder="Describe the feeling, colours, story or strange little details you want to bring to life…" rows="5" />
        <span className="text-[10px] text-[#8b8880]">The more you share, the more an artist can imagine.</span>
      </label>
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
        <label className="form-label">Budget (€)
          <input className="form-input" required min="1" type="number" name="budget" value={form.budget} onChange={updateForm} placeholder="850" />
        </label>
        <label className="form-label">Ideal timeline
          <select className="form-input" name="timeline" value={form.timeline} onChange={updateForm}>
            <option>1–2 months</option><option>2–3 months</option><option>3–4 months</option><option>Flexible</option>
          </select>
        </label>
      </div>
      {message.text && <p className={`mb-5 text-xs ${message.type === "error" ? "text-[#c73e29]" : "text-[#55704b]"}`}>{message.text}</p>}
      <button className="button-dark w-full disabled:cursor-wait disabled:opacity-60" disabled={isSubmitting}>{isSubmitting ? "Publishing…" : "Publish to the market ↗"}</button>
      <p className="mt-3 text-[10px] text-[#8b8880]">By publishing, your prompt will be visible to artists browsing the market.</p>
    </form>
  );
}
