"use client";

import { useEffect, useMemo, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function fetchJson(path) {
  const response = await fetch(`${apiBaseUrl}${path}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to load commission data.");
  }

  return result;
}

export default function ViewCommission({ commissionId, onBack, navigation }) {
  const [commission, setCommission] = useState(null);
  const [artists, setArtists] = useState([]);
  const [artGroups, setArtGroups] = useState([]);
  const [currentApplicant, setCurrentApplicant] = useState(0);
  const [acceptedArtists, setAcceptedArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCommission() {
      try {
        const [commissionResult, artistsResult, groupsResult] = await Promise.all([
          fetchJson(`/api/commission/${commissionId}`),
          fetchJson("/api/artist"),
          fetchJson("/api/artgroup"),
        ]);

        if (active) {
          setCommission(commissionResult);
          setArtists(artistsResult);
          setArtGroups(groupsResult);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load commission data.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCommission();

    return () => {
      active = false;
    };
  }, [commissionId]);

  const applicants = useMemo(() => {
    if (!commission) {
      return [];
    }

    const applicantIds = Array.isArray(commission.applicantIds)
      ? commission.applicantIds
      : commission.artistIds;

    return applicantIds
      .map((artistId) => artists.find((artist) => artist.id === artistId))
      .filter(Boolean)
      .filter((artist) => !acceptedArtists.includes(artist.id));
  }, [artists, commission, acceptedArtists]);

  const applicant = applicants[currentApplicant];
  const applicantGroup = applicant
    ? artGroups.find(
        (group) => Array.isArray(group.artistIds) && group.artistIds.includes(applicant.id),
      )
    : null;
  const isFusionSecondApplicant = Boolean(
    commission?.fusionCommission && acceptedArtists.length === 1,
  );

  useEffect(() => {
    setCurrentApplicant(0);
  }, [acceptedArtists]);

  async function updateAcceptedArtists(nextAcceptedArtists) {
    if (!commission) {
      return false;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/commission/${commission.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...commission,
          artistIds: nextAcceptedArtists,
          started: true,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to accept this applicant.");
      }

      setCommission(result);
      setAcceptedArtists(nextAcceptedArtists);
      return true;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to accept this applicant.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  }

  function declineApplicant() {
    if (currentApplicant < applicants.length - 1) {
      setCurrentApplicant((current) => current + 1);
    } else {
      setError("There are no more applicants for this commission.");
    }
  }

  function acceptApplicant() {
    if (!applicant) {
      return;
    }

    const nextAcceptedArtists = [...acceptedArtists, applicant.id];

    if (commission.fusionCommission && nextAcceptedArtists.length < 2) {
      setAcceptedArtists(nextAcceptedArtists);
      return;
    }

    updateAcceptedArtists(nextAcceptedArtists).then((updated) => {
      if (updated) {
        onBack();
      }
    });
  }

  return (
    <main className="prompt-page view-commission-page">
      {navigation}
      <header className="prompt-header" aria-label="Human Renaissance">
        H
      </header>

      {loading ? (
        <p className="commission-view-message">Loading commission...</p>
      ) : error && !commission ? (
        <p className="commission-view-message" role="alert">{error}</p>
      ) : (
        <>
          <h1 className="commission-view-title">Your Commission</h1>
          <p className="commission-view-prompt">{commission.prompt}</p>
          <section className="applicant-panel" aria-labelledby="applicants-title">
            <h2 id="applicants-title"><span>Applicants</span></h2>
            {isFusionSecondApplicant && (
              <p className="fusion-applicant-note">
                Choose the 2. artist for this fusion commission.
              </p>
            )}
            {applicant ? (
              <>
                <div className="portfolio-carousel">
                  {(applicant.portfolioPictures || []).map((picture) => (
                    <img key={picture} src={picture} alt="" />
                  ))}
                  {(!applicant.portfolioPictures || applicant.portfolioPictures.length === 0) && (
                    <div className="portfolio-placeholder">Portfolio</div>
                  )}
                </div>
                <h3>{applicant.name} {applicant.surname}</h3>
                <p className="artist-group">{applicantGroup?.artStyle || "No art group"}</p>
                <p className="artist-biography">{applicant.biography || "No biography provided."}</p>
              </>
            ) : (
              <p className="commission-view-message">No applicants yet.</p>
            )}
            {error && commission && <p className="prompt-status" role="alert">{error}</p>}
            <div className="applicant-actions">
              <button type="button" className="decline-applicant" aria-label="Decline applicant" onClick={declineApplicant} disabled={!applicant || saving}>×</button>
              <button type="button" className="accept-applicant" aria-label="Accept applicant" onClick={acceptApplicant} disabled={!applicant || saving}>✓</button>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
