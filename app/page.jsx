"use client";

import { useState } from "react";

const initialForm = {
  prompt: "",
  gage: "",
  fusion: false,
};

export default function HomePage() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSubmitted(false);
  }

  function toggleFusion(event) {
    setForm((current) => ({ ...current, fusion: event.target.checked }));
    setSubmitted(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="prompt-page">
      <button
        className={`menu-button${menuOpen ? " is-open" : ""}`}
        type="button"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>

      {menuOpen && (
        <div className="navigation-layer">
          <button
            className="navigation-backdrop"
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="navigation-menu" aria-label="Main navigation">
            <div className="navigation-brand">
              <span>H</span>
              <strong>Human renaissance</strong>
            </div>
            <a className="navigation-link" href="#market" onClick={() => setMenuOpen(false)}>
              Market
            </a>
          </nav>
        </div>
      )}

      <header className="prompt-header" aria-label="Human Renaissance">
        H
      </header>

      <form className="prompt-form" onSubmit={handleSubmit}>
        <div className="prompt-introduction">
          <h1>
            Write your <em>prompt.</em>
          </h1>
          <p>Please be as specific as you can</p>
        </div>

        <label className="sr-only" htmlFor="prompt">
          Your prompt
        </label>
        <textarea
          id="prompt"
          name="prompt"
          value={form.prompt}
          onChange={updateField}
          placeholder={'“I want a Studio Ghibli themed poster!”'}
          required
        />

        <label className="gage-field" htmlFor="gage">
          <span>Gage:</span>
          <input
            id="gage"
            name="gage"
            type="number"
            min="0"
            step="0.01"
            value={form.gage}
            onChange={updateField}
            required
            aria-label="Gage"
          />
        </label>

        <label className="fusion-toggle">
          <input
            type="checkbox"
            name="fusion"
            checked={form.fusion}
            onChange={toggleFusion}
          />
          <span className="toggle-indicator" aria-hidden="true" />
          <span className="fusion-copy">
            <strong>Fusion - commission</strong>
            <span>
              Fusioncommission lets you accept more than one applicant. The entered gage is split equally between them.
            </span>
          </span>
        </label>

        <button className="next-button" type="submit" aria-label="Continue">
          <span aria-hidden="true" />
        </button>
        {submitted && (
          <p className="prompt-status" role="status">
            Your prompt is ready for the next step.
          </p>
        )}
      </form>
    </main>
  );
}
