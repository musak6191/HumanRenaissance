import CommissionForm from "../components/commission-form";

export const dynamic = "force-dynamic";

const apiUrl = process.env.API_URL || "http://localhost:3000";

async function getCommissions() {
  const response = await fetch(`${apiUrl}/api/commissions`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Unable to load the commission market.");
  }

  return response.json();
}

function formatBudget(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function CommissionCard({ commission, index }) {
  const cardStyles = [
    "bg-coral text-cream",
    "bg-sand",
    "bg-sage text-cream",
  ];

  return (
    <article className={`relative min-h-[320px] p-6 ${cardStyles[index % cardStyles.length]}`}>
      <div className="flex justify-between font-mono text-[11px] opacity-80">
        <span>0{index + 1}</span>
        <span className="text-lg">↗</span>
      </div>
      <h3 className="mt-12 max-w-[230px] text-[26px] font-medium leading-[1.02] tracking-[-.04em]">
        {commission.title}
      </h3>
      <p className="mt-4 max-w-[290px] font-display text-base leading-[1.35]">
        {commission.prompt}
      </p>
      <div className="absolute bottom-6 left-6 flex gap-4 font-mono text-[10px] uppercase">
        <span>{formatBudget(commission.budget)}</span>
        <span>{commission.timeline}</span>
      </div>
    </article>
  );
}

export default async function HomePage() {
  const commissions = await getCommissions();

  return (
    <div className="overflow-hidden">
      <header className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-7 sm:px-[34px]">
        <a className="flex items-center gap-2.5 text-xs font-bold uppercase leading-[.95] tracking-[-.02em]" href="#top">
          <span className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-coral font-mono text-[11px] text-cream">HR</span>
          <span>Human<br />Renaissance</span>
        </a>
        <nav className="flex gap-7 text-xs">
          <a className="hidden sm:block" href="#market">Explore the market</a>
          <a className="border-b border-ink pb-1" href="#create">Post a commission <span className="ml-1.5 text-lg text-coral">↗</span></a>
        </nav>
      </header>

      <main id="top">
        <section className="mx-auto grid max-w-[1240px] grid-cols-1 px-6 pb-[85px] pt-6 sm:grid-cols-[1.05fr_.95fr] sm:px-[34px] sm:pb-[150px] sm:pt-[25px]">
          <div className="self-center pb-10 pt-11 sm:pt-0">
            <p className="eyebrow">A marketplace for meaningful art</p>
            <h1 className="heading">Give your idea<br /><em>a human touch.</em></h1>
            <p className="my-9 max-w-[350px] text-base leading-[1.45]">
              Turn the picture in your head into a prompt an artist can feel.
              Share your commission with a community making beautiful things.
            </p>
            <a className="button-dark" href="#create">Write a commission <span>↓</span></a>
          </div>
          <div className="relative h-[450px] w-full justify-self-end overflow-hidden bg-[#e8dfd0] sm:h-[590px] sm:max-w-[535px]" aria-label="Abstract artwork">
            <div className="absolute right-[-30px] top-[92px] h-[285px] w-[285px] rounded-full bg-coral" />
            <div className="absolute bottom-[-20px] left-[18%] h-[450px] w-[280px] rounded-t-[170px] border-[33px] border-b-0 border-sage" />
            <div className="absolute bottom-0 left-[33%] h-[280px] w-[95px] rotate-[5deg] rounded-[50%_50%_12px_12px] bg-ink before:absolute before:-top-14 before:left-1 before:h-[88px] before:w-[88px] before:rounded-full before:bg-ink" />
            <span className="absolute left-8 top-[105px] rotate-[25deg] text-[55px] text-cream">✽</span>
            <span className="absolute bottom-9 right-9 text-[55px] text-coral">✦</span>
            <span className="absolute bottom-6 right-7 text-right font-display text-[21px] italic leading-[.9] text-cream">Ideas<br />into art</span>
          </div>
        </section>

        <section className="bg-mist px-6 py-[75px] sm:px-[max(34px,calc((100vw-1172px)/2))] sm:py-[105px]" id="market">
          <div className="mb-16 flex flex-col justify-between gap-7 sm:mb-[82px] sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">The open market</p>
              <h2 className="section-heading">Prompts looking<br /><em>for their artist.</em></h2>
            </div>
            <p className="mb-1 mr-5 text-[13px] leading-[1.45]">Every commission starts as a thought.<br />Maybe yours is next.</p>
          </div>
          <div className="flex flex-col items-start justify-between gap-4 border-b border-ink/25 pb-3 font-mono text-[10px] uppercase text-[#605d55] sm:flex-row sm:items-center">
            <span>{commissions.length} open commissions</span>
            <span>Browse all commissions ↗</span>
          </div>
          <div className="mt-[17px] grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {commissions.map((commission, index) => (
              <CommissionCard commission={commission} index={index} key={commission.id} />
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-[1120px] grid-cols-1 gap-16 px-6 py-[90px] sm:grid-cols-[.8fr_1.2fr] sm:gap-[100px] sm:px-[34px] sm:py-[150px]" id="create">
          <div>
            <p className="eyebrow">Your turn</p>
            <h2 className="section-heading">What would you<br /><em>love to see?</em></h2>
            <p className="mt-8 max-w-[280px] text-sm leading-[1.5]">Don’t worry about having the right words. Start with a feeling, a memory, or a little bit of magic.</p>
            <div className="mt-16 ml-[100px] w-[100px] rotate-[-12deg] rounded-full border border-coral px-5 py-6 font-display text-[17px] italic leading-[.95] text-coral">Make<br />something<br />human</div>
          </div>
          <CommissionForm />
        </section>
      </main>

      <footer className="flex flex-wrap justify-between gap-4 border-t border-[#d8d4cb] px-6 py-5 font-mono text-[10px] uppercase sm:px-[34px]">
        <span>Human Renaissance © 2026</span>
        <span>Made for people who make things.</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </div>
  );
}
