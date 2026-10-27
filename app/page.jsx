"use client";

import { useState } from "react";
import CreateCommission from "./market/commissioner/createCommission";
import OverviewCommission from "./market/commissioner/overviewCommission";
import CommissionerNavigation from "./market/commissioner/navigation";

const initialForm = {
  prompt: "",
  gage: "",
  fusion: false,
};
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function HomePage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [screen, setScreen] = useState("prompt");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  function toggleFusion(event) {
    setForm((current) => ({ ...current, fusion: event.target.checked }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/commission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: form.prompt,
          budget: Number(form.gage),
          commissionerId: "sample-commissioner-1",
          artistIds: [],
          started: false,
          fusionCommission: form.fusion,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to create the commission.");
      }

      setForm(initialForm);
      setScreen("commissions");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create the commission.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const navigation = (
    <CommissionerNavigation
      menuOpen={menuOpen}
      onToggle={() => setMenuOpen((current) => !current)}
      onClose={() => setMenuOpen(false)}
    />
  );

  if (screen === "commissions") {
    return (
      <OverviewCommission
        onCreate={() => setScreen("prompt")}
        navigation={navigation}
      />
    );
  }

  return (
    <CreateCommission
      form={form}
      submitting={submitting}
      error={error}
      onFieldChange={updateField}
      onFusionToggle={toggleFusion}
      onSubmit={handleSubmit}
      navigation={navigation}
    />
  );
}
