"use client";

import { useEffect, useState } from "react";
import { apiBaseUrl, authFetch } from "../../lib/authFetch";

function CommissionList({ commissions, emptyMessage, onSelect }) {
  if (commissions.length === 0) {
    return <p className="commission-item">{emptyMessage}</p>;
  }

  return commissions.map((commission) => (
    <button
      className="commission-item commission-item-button artist-market-item"
      key={commission.id}
      type="button"
      onClick={() => onSelect(commission.id)}
    >
      <p>{commission.prompt}</p>
      <span>{commission.commissioner?.familyName} {commission.commissioner?.surname}</span>
      <span>{commission.commissioner?.city}</span>
    </button>
  ));
}

export default function OverviewCommissionArtist({ onSelectCommission, navigation }) {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCommissions() {
      try {
        const response = await authFetch(`${apiBaseUrl}/api/commission`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load commissions.");
        }

        if (active) {
          setCommissions(result);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load commissions.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCommissions();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="prompt-page artist-market-page">
      {navigation}
      <header className="prompt-header" aria-label="Human Renaissance">H</header>
      <h1 className="commissions-title">Market</h1>

      <section className="commission-panel artist-market-panel" aria-labelledby="market-title">
        <h2 id="market-title"><span>Prompts</span></h2>
        <div className="commission-list">
          {loading ? (
            <p className="commission-item">Loading commissions...</p>
          ) : error ? (
            <p className="commission-item" role="alert">{error}</p>
          ) : (
            <CommissionList
              commissions={commissions}
              emptyMessage="No commissions available."
              onSelect={onSelectCommission}
            />
          )}
        </div>
      </section>
    </main>
  );
}
