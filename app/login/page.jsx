"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiBaseUrl, authFetch } from "../lib/authFetch";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await authFetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        redirectOnUnauthorized: false,
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to log in.");
      }

      router.replace("/");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to log in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      className="prompt-page px-5 text-[#4a4a4a]"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at center, transparent 65%, rgb(74 74 74 / 20%) 100%), radial-gradient(rgb(74 74 74 / 15%) .65px, transparent .65px), radial-gradient(rgb(255 255 255 / 70%) .7px, transparent .7px)",
        backgroundPosition: "center, 0 0, 3px 4px",
        backgroundSize: "100% 100%, 7px 7px, 11px 11px",
      }}
    >
      <header className="prompt-header" aria-label="Human Renaissance">H</header>
      <form
        className="mx-auto flex w-full max-w-[500px] flex-col pt-[176px] sm:pt-[178px]"
        onSubmit={handleSubmit}
      >
        <h1 className="m-0 text-center font-serif text-[46px] font-normal leading-none tracking-[-0.05em]">
          Please enter your{" "}
          <span
            className="relative z-0 inline-block"
            style={{
              backgroundImage:
                "linear-gradient(transparent 52%, rgb(255 136 0 / 58%) 52%, rgb(255 136 0 / 58%) 88%, transparent 88%)",
            }}
          >
            login
          </span>
        </h1>
        <div className="mx-auto mt-[57px] flex w-full max-w-[430px] flex-col gap-[28px] font-sans text-base tracking-[-0.02em]">
          <label className="flex items-end">
            <span className="w-[90px] shrink-0 text-right">Email:</span>
          <input
            id="email"
            name="email"
            type="email"
            aria-label="Email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="ml-3 h-6 min-w-0 flex-1 border-0 border-b border-[#4a4a4a] bg-transparent px-1 py-0 leading-5 outline-none focus:border-[#ff8800] focus:ring-0"
            required
          />
          </label>
          <label className="flex items-end">
            <span className="w-[90px] shrink-0 text-right">Password:</span>
          <input
            id="password"
            name="password"
            type="password"
            aria-label="Password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            className="ml-3 h-6 min-w-0 flex-1 border-0 border-b border-[#4a4a4a] bg-transparent px-1 py-0 leading-5 outline-none focus:border-[#ff8800] focus:ring-0"
            required
          />
          </label>
        </div>
        {error && <p className="mt-5 text-center text-[#b42318]" role="alert">{error}</p>}
        <button
          type="submit"
          aria-label={submitting ? "Logging in" : "Submit login"}
          disabled={submitting}
          className="mx-auto mt-[124px] flex h-10 w-16 items-center justify-center border-0 bg-transparent p-0 text-[#ff8800] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#ff8800] focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-65"
        >
          <svg aria-hidden="true" width="64" height="32" viewBox="0 0 64 32" fill="none">
            <circle cx="8" cy="16" r="8" fill="currentColor" />
            <path d="M8 16H61M61 16L49 4M61 16L49 28" stroke="currentColor" strokeWidth="3" />
          </svg>
        </button>
        <p className="mt-[17px] text-center font-serif text-[18px] tracking-[-0.05em]">
          First time?{" "}
          <Link
            href="/register"
            className="text-[#4a4a4a] underline decoration-[#ff8800] decoration-2 underline-offset-2"
          >
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}
