"use client";

import { useEffect, useState } from "react";
import { apiBaseUrl, authFetch } from "../../lib/authFetch";

async function fetchCommission(commissionId) {
  const response = await authFetch(`${apiBaseUrl}/api/commission/${commissionId}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to load commission.");
  }

  return result;
}

export default function ViewCommissionArtist({
  commissionId,
  artistId,
  onBack,
  onApplicationSent,
  navigation,
}) {
  const [commission, setCommission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetchCommission(commissionId)
      .then((result) => {
        if (active) {
          setCommission(result);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : "Unable to load commission.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [commissionId]);

  async function sendPortfolio() {
    setSending(true);
    setError("");

    try {
      const response = await authFetch(`${apiBaseUrl}/api/commission/${commissionId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to send portfolio.");
      }

      onApplicationSent(result.message || "Application sent successfully.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send portfolio.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="prompt-page view-commission-page artist-market-page">
      {navigation}
      <header className="prompt-header" aria-label="Human Renaissance">H</header>

      {loading ? (
        <p className="commission-view-message">Loading commission...</p>
      ) : error && !commission ? (
        <p className="commission-view-message" role="alert">{error}</p>
      ) : (
        <>
          <h1 className="commission-view-title">Submit application</h1>
          <section className="applicant-panel artist-commission-detail" aria-labelledby="commission-prompt-title">
            <h2 id="commission-prompt-title"><span>Prompt</span></h2>
            <p className="commission-view-prompt">{commission.prompt}</p>
            <p className="artist-commissioner-name">
              {commission.commissioner?.familyName} {commission.commissioner?.surname}
            </p>
            <p className="artist-commissioner-city">{commission.commissioner?.city}</p>
            <p className="gage-field artist-commission-gage">
              <span>Gage:</span>
              <strong>{commission.budget ?? "Not specified"}</strong>
            </p>
            {error && <p className="prompt-status" role="alert">{error}</p>}
          </section>
          <div className="artist-commission-actions">
            <button
              className="commission-back-button"
              type="button"
              aria-label="Back to market"
              onClick={onBack}
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              className="next-button artist-send-portfolio"
              type="button"
              onClick={sendPortfolio}
              disabled={sending}
            >
              <span>Send Portfolio</span>
              <span aria-hidden="true" />
            </button>
          </div>
        </>
      )}
    </main>
  );
}
