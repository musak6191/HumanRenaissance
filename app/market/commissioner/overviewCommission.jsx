"use client";

import { useEffect, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function CommissionList({ commissions, emptyMessage, onSelect }) {
  if (commissions.length === 0) {
    return <p className="commission-item">{emptyMessage}</p>;
  }

  return commissions.map((commission) => (
    <button
      className="commission-item commission-item-button"
      key={commission.id}
      type="button"
      onClick={() => onSelect(commission.id)}
    >
      <p>{commission.prompt}</p>
      <span>
        {Array.isArray(commission.artistIds) ? commission.artistIds.length : 0} assigned artists
      </span>
    </button>
  ));
}

export default function OverviewCommission({ onCreate, onSelectCommission, navigation }) {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCommissions() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/commission`);
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

  const activeCommissions = commissions.filter(
    (commission) => Array.isArray(commission.artistIds) && commission.artistIds.length > 0,
  );
  const displayedCommissions = commissions.filter(
    (commission) => !Array.isArray(commission.artistIds) || commission.artistIds.length === 0,
  );

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
          {loading ? (
            <p className="commission-item">Loading commissions...</p>
          ) : error ? (
            <p className="commission-item" role="alert">
              {error}
            </p>
          ) : (
            <CommissionList
              commissions={activeCommissions}
              emptyMessage="No active commissions."
              onSelect={onSelectCommission}
            />
          )}
        </div>
      </section>

      <section className="commission-panel" aria-labelledby="displayed-commissions-title">
        <h2 id="displayed-commissions-title">
          <span>Displayed</span> commissions
        </h2>
        <div className="commission-list">
          {loading ? (
            <p className="commission-item">Loading commissions...</p>
          ) : error ? (
            <p className="commission-item" role="alert">
              {error}
            </p>
          ) : (
            <CommissionList
              commissions={displayedCommissions}
              emptyMessage="No displayed commissions."
              onSelect={onSelectCommission}
            />
          )}
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
