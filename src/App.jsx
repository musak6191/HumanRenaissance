import { useEffect, useMemo, useState } from "react";

const emptyForm = { title: "", prompt: "", budget: "", timeline: "1–2 months" };

function formatBudget(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function App() {
  const [commissions, setCommissions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/commissions")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load the market.");
        return response.json();
      })
      .then(setCommissions)
      .catch(() => setError("The market is taking a moment to wake up. Please refresh and try again."))
      .finally(() => setIsLoading(false));
  }, []);

  const visibleCommissions = useMemo(() => {
    if (filter === "all") return commissions;
    const maximum = filter === "under-750" ? 750 : 1500;
    return commissions.filter((commission) =>
      filter === "under-750" ? commission.budget < maximum : commission.budget >= 750 && commission.budget <= maximum,
    );
  }, [commissions, filter]);

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError("");
  }

  async function submitCommission(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setCommissions((current) => [data, ...current]);
      setForm(emptyForm);
      setNotice("Your commission is now live on the market.");
      document.getElementById("market")?.scrollIntoView({ behavior: "smooth" });
    } catch (submitError) {
      setError(submitError.message || "We could not publish your commission. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Human Renaissance home">
          <span className="brand-mark">HR</span>
          <span>Human<br />Renaissance</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#market">Explore the market</a>
          <a className="nav-cta" href="#create">Post a commission <span>↗</span></a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">A marketplace for meaningful art</p>
            <h1>Give your idea<br /><em>a human touch.</em></h1>
            <p className="hero-intro">
              Turn the picture in your head into a prompt an artist can feel.
              Share your commission with a community making beautiful things.
            </p>
            <a className="button button-dark" href="#create">Write a commission <span>↓</span></a>
          </div>
          <div className="hero-art" aria-label="Abstract artwork">
            <div className="sun"></div>
            <div className="arch"></div>
            <div className="figure"></div>
            <div className="flower flower-one">✽</div>
            <div className="flower flower-two">✦</div>
            <span className="art-label">Ideas<br />into art</span>
          </div>
        </section>

        <section className="market-section" id="market">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The open market</p>
              <h2>Prompts looking<br /><em>for their artist.</em></h2>
            </div>
            <p className="section-note">Every commission starts as a thought.<br />Maybe yours is next.</p>
          </div>
          <div className="market-toolbar">
            <span>{commissions.length} open commissions</span>
            <div className="filters" aria-label="Filter commissions">
              <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
              <button className={filter === "under-750" ? "active" : ""} onClick={() => setFilter("under-750")}>Under €750</button>
              <button className={filter === "750-1500" ? "active" : ""} onClick={() => setFilter("750-1500")}>€750–€1,500</button>
            </div>
          </div>
          {isLoading ? <div className="empty-state">Opening the market…</div> : (
            <div className="commission-grid">
              {visibleCommissions.map((commission, index) => (
                <article className={`commission-card card-${index % 3}`} key={commission.id}>
                  <div className="card-top"><span className="card-number">0{index + 1}</span><span className="card-arrow">↗</span></div>
                  <h3>{commission.title}</h3>
                  <p className="prompt">{commission.prompt}</p>
                  <div className="card-meta"><span>{formatBudget(commission.budget)}</span><span>{commission.timeline}</span></div>
                </article>
              ))}
              {!visibleCommissions.length && <div className="empty-state">No commissions match this filter yet.</div>}
            </div>
          )}
        </section>

        <section className="create-section" id="create">
          <div className="create-aside">
            <p className="eyebrow">Your turn</p>
            <h2>What would you<br /><em>love to see?</em></h2>
            <p>Don’t worry about having the right words. Start with a feeling, a memory, or a little bit of magic.</p>
            <div className="aside-stamp">Make<br />something<br />human</div>
          </div>
          <form className="commission-form" onSubmit={submitCommission}>
            <label>Give it a name<input required name="title" value={form.title} onChange={updateForm} placeholder="e.g. A portrait of my summer" /></label>
            <label>Your prompt<textarea required minLength="20" name="prompt" value={form.prompt} onChange={updateForm} placeholder="Describe the feeling, colours, story or strange little details you want to bring to life…" rows="5" /><span className="field-hint">The more you share, the more an artist can imagine.</span></label>
            <div className="form-row">
              <label>Budget (€)<input required min="1" type="number" name="budget" value={form.budget} onChange={updateForm} placeholder="850" /></label>
              <label>Ideal timeline<select name="timeline" value={form.timeline} onChange={updateForm}><option>1–2 months</option><option>2–3 months</option><option>3–4 months</option><option>Flexible</option></select></label>
            </div>
            {error && <p className="form-message error">{error}</p>}
            {notice && <p className="form-message success">{notice}</p>}
            <button className="button button-dark submit-button" disabled={isSubmitting}>{isSubmitting ? "Publishing…" : "Publish to the market ↗"}</button>
            <p className="fine-print">By publishing, your prompt will be visible to artists browsing the market.</p>
          </form>
        </section>
      </main>

      <footer><span>Human Renaissance © 2026</span><span>Made for people who make things.</span><a href="#top">Back to top ↑</a></footer>
    </div>
  );
}

export default App;
