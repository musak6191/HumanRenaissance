"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiBaseUrl, authFetch } from "../lib/authFetch";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    accountType: "commissioner",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await authFetch(`${apiBaseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        redirectOnUnauthorized: false,
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to register.");
      }

      router.replace("/login");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to register.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Register</h1>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>
        <fieldset>
          <legend>Account type</legend>
          <label>
            <input
              type="radio"
              name="accountType"
              value="commissioner"
              checked={form.accountType === "commissioner"}
              onChange={(event) => setForm({ ...form, accountType: event.target.value })}
            />
            Commissioner
          </label>
          <label>
            <input
              type="radio"
              name="accountType"
              value="artist"
              checked={form.accountType === "artist"}
              onChange={(event) => setForm({ ...form, accountType: event.target.value })}
            />
            Artist
          </label>
        </fieldset>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Registering..." : "Register"}
        </button>
        <p>
          Already registered? <Link href="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}
