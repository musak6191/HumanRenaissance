"use client";

export default function CreateCommission({
  form,
  submitting,
  error,
  onFieldChange,
  onFusionToggle,
  onSubmit,
  navigation,
}) {
  return (
    <main className="prompt-page">
      {navigation}
      <header className="prompt-header" aria-label="Human Renaissance">
        H
      </header>

      <form className="prompt-form" onSubmit={onSubmit}>
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
          onChange={onFieldChange}
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
            inputMode="decimal"
            value={form.gage}
            onChange={onFieldChange}
            required
            aria-label="Gage"
          />
        </label>

        <label className="fusion-toggle">
          <input
            type="checkbox"
            name="fusion"
            checked={form.fusion}
            onChange={onFusionToggle}
          />
          <span className="toggle-indicator" aria-hidden="true" />
          <span className="fusion-copy">
            <strong>Fusion - commission</strong>
            <span>
              Fusioncommission lets you accept more than one applicant. The entered gage is split equally between them.
            </span>
          </span>
        </label>

        <button
          className="next-button"
          type="submit"
          aria-label="Continue"
          disabled={submitting}
        >
          <span aria-hidden="true" />
        </button>
        {error && (
          <p className="prompt-status" role="alert">
            {error}
          </p>
        )}
      </form>
    </main>
  );
}
