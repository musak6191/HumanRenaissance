"use client";

export default function OverviewCommission({ form, onCreate, navigation }) {
  return (
    <main className="prompt-page commissions-page">
      {navigation}
      <header className="prompt-header" aria-label="Human Renaissance">
        H
      </header>
      <h1 className="commissions-title">Commissions</h1>

      <section className="commission-panel" aria-labelledby="active-commissions-title">
        <h2 id="active-commissions-title">
          <span>Active</span> commissions
        </h2>
        <div className="commission-list">
          <article className="commission-item">
            <p>{"{Prompt}"}</p>
          </article>
        </div>
      </section>

      <section className="commission-panel" aria-labelledby="displayed-commissions-title">
        <h2 id="displayed-commissions-title">
          <span>Displayed</span> commissions
        </h2>
        <div className="commission-list">
          <article className="commission-item">
            <p>{form.prompt || "{Prompt}"}</p>
            <span>{form.prompt ? "0 new · 0 total applicants" : "{Amount of applicants}"}</span>
          </article>
        </div>
      </section>

      <button
        className="new-commission-button"
        type="button"
        aria-label="Create a new commission"
        onClick={onCreate}
      >
        <span aria-hidden="true" />
      </button>
    </main>
  );
}
