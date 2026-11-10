"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    surname: "",
    familyName: "",
    email: "",
    password: "",
    country: "",
    postalCode: "",
    city: "",
  });
  const [step, setStep] = useState(1);

  function handleSubmit(event) {
    event.preventDefault();
    if (step < 3) {
      setStep(step + 1);
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
        {step === 1 ? (
          <h1 className="m-0 text-center font-serif text-[46px] font-normal leading-none tracking-[-0.05em]">
            What&apos;s your{" "}
            <span
              className="relative z-0 inline-block"
              style={{
                backgroundImage:
                  "linear-gradient(transparent 52%, rgb(255 136 0 / 58%) 52%, rgb(255 136 0 / 58%) 88%, transparent 88%)",
              }}
            >
              name?
            </span>
          </h1>
        ) : step === 2 ? (
          <h1 className="m-0 text-center font-serif text-[46px] font-normal leading-[1.05] tracking-[-0.05em]">
            Next, please enter an{" "}
            <span
              className="relative z-0 inline-block"
              style={{
                backgroundImage:
                  "linear-gradient(transparent 52%, rgb(255 136 0 / 58%) 52%, rgb(255 136 0 / 58%) 88%, transparent 88%)",
              }}
            >
              email &amp;
            </span>
            <br />
            <span
              className="relative z-0 inline-block"
              style={{
                backgroundImage:
                  "linear-gradient(transparent 52%, rgb(255 136 0 / 58%) 52%, rgb(255 136 0 / 58%) 88%, transparent 88%)",
              }}
            >
              password
            </span>
          </h1>
        ) : (
          <h1 className="m-0 text-center font-serif text-[46px] font-normal leading-none tracking-[-0.05em]">
            So{" "}
            <span className="relative z-0 inline-block">
              {form.surname || "there"}
            </span>
            , where are you{" "}
            <span
              className="relative z-0 inline-block"
              style={{
                backgroundImage:
                  "linear-gradient(transparent 52%, rgb(255 136 0 / 58%) 52%, rgb(255 136 0 / 58%) 88%, transparent 88%)",
              }}
            >
              from?
            </span>
          </h1>
        )}
        {step === 3 && (
          <div className="mx-auto mt-[57px] flex w-full max-w-[430px] flex-col gap-[28px] font-sans text-base tracking-[-0.02em]">
            <label className="flex items-end">
              <span className="w-[130px] shrink-0 text-right">Country:</span>
              <input
                id="country"
                name="country"
                type="text"
                aria-label="Country"
                value={form.country}
                onChange={(event) => setForm({ ...form, country: event.target.value })}
                className="ml-3 h-6 min-w-0 flex-1 border-0 border-b border-[#4a4a4a] bg-transparent px-1 py-0 leading-5 outline-none focus:border-[#ff8800] focus:ring-0"
                required
              />
            </label>
            <label className="flex items-end">
              <span className="w-[130px] shrink-0 text-right">Postal ZIP-Code:</span>
              <input
                id="postal-code"
                name="postalCode"
                type="text"
                aria-label="Postal ZIP-Code"
                value={form.postalCode}
                onChange={(event) => setForm({ ...form, postalCode: event.target.value })}
                className="ml-3 h-6 min-w-0 flex-1 border-0 border-b border-[#4a4a4a] bg-transparent px-1 py-0 leading-5 outline-none focus:border-[#ff8800] focus:ring-0"
                required
              />
            </label>
            <label className="flex items-end">
              <span className="w-[130px] shrink-0 text-right">City:</span>
              <input
                id="city"
                name="city"
                type="text"
                aria-label="City"
                value={form.city}
                onChange={(event) => setForm({ ...form, city: event.target.value })}
                className="ml-3 h-6 min-w-0 flex-1 border-0 border-b border-[#4a4a4a] bg-transparent px-1 py-0 leading-5 outline-none focus:border-[#ff8800] focus:ring-0"
                required
              />
            </label>
          </div>
        )}
        {step < 3 && <div className="mx-auto mt-[57px] flex w-full max-w-[430px] flex-col gap-[28px] font-sans text-base tracking-[-0.02em]">
          {step === 1 ? (
            <>
              <label className="flex items-end">
                <span className="w-[90px] shrink-0 text-right">Surname:</span>
                <input
                  id="surname"
                  name="surname"
                  type="text"
                  aria-label="Surname"
                  value={form.surname}
                  onChange={(event) => setForm({ ...form, surname: event.target.value })}
                  className="ml-3 h-6 min-w-0 flex-1 border-0 border-b border-[#4a4a4a] bg-transparent px-1 py-0 leading-5 outline-none focus:border-[#ff8800] focus:ring-0"
                  required
                />
              </label>
              <label className="flex items-end">
                <span className="w-[90px] shrink-0 text-right">Family Name:</span>
                <input
                  id="family-name"
                  name="familyName"
                  type="text"
                  aria-label="Family Name"
                  value={form.familyName}
                  onChange={(event) => setForm({ ...form, familyName: event.target.value })}
                  className="ml-3 h-6 min-w-0 flex-1 border-0 border-b border-[#4a4a4a] bg-transparent px-1 py-0 leading-5 outline-none focus:border-[#ff8800] focus:ring-0"
                  required
                />
              </label>
            </>
          ) : (
            <>
              <label className="flex items-end">
                <span className="w-[90px] shrink-0 text-right">E-Mail:</span>
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
            </>
          )}
        </div>}
        <button
          type="submit"
          aria-label="Continue registration"
          className={`mx-auto flex h-10 w-16 items-center justify-center border-0 bg-transparent p-0 text-[#ff8800] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#ff8800] focus-visible:outline-offset-4 ${step === 1 ? "mt-[124px]" : "mt-[12px]"}`}
        >
          <svg aria-hidden="true" width="64" height="32" viewBox="0 0 64 32" fill="none">
            <circle cx="8" cy="16" r="8" fill="currentColor" />
            <path d="M8 16H61M61 16L49 4M61 16L49 28" stroke="currentColor" strokeWidth="3" />
          </svg>
        </button>
        <p className="mt-[17px] text-center font-serif text-[18px] tracking-[-0.05em]">
          Already got an account?{" "}
          <Link
            href="/login"
            className="text-[#4a4a4a] underline decoration-[#ff8800] decoration-2 underline-offset-2"
          >
            Log in
          </Link>
        </p>
        {step > 1 && (
          <button
            type="button"
            aria-label="Go to previous registration step"
            onClick={() => setStep(step - 1)}
            className="fixed bottom-6 left-1/2 z-10 flex h-6 w-9 -translate-x-1/2 items-center justify-center border-0 bg-transparent p-0 text-[#4a4a4a] opacity-60 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#4a4a4a] focus-visible:outline-offset-4"
          >
            <svg aria-hidden="true" width="36" height="18" viewBox="0 0 64 32" fill="none">
              <circle cx="56" cy="16" r="4.5" fill="currentColor" />
              <path d="M56 16H3M3 16L15 4M3 16L15 28" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </button>
        )}
      </form>
    </main>
  );
}
