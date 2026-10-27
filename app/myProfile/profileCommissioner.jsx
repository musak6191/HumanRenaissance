"use client";

import { useEffect, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const commissionerId = "sample-commissioner-1";

export default function ProfileCommissioner({ onBack, navigation }) {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch(`${apiBaseUrl}/api/commissioner/${commissionerId}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Unable to load profile.");
        }
        return result;
      })
      .then((result) => {
        if (active) {
          setProfile(result);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : "Unable to load profile.");
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
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  }

  function handleEditButtonClick(event) {
    if (!editing) {
      event.preventDefault();
      setEditing(true);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/commissioner/${commissionerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save profile.");
      }

      setProfile(result);
      setEditing(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="prompt-page commissioner-profile-page">
      {navigation}
      <header className="prompt-header" aria-label="Human Renaissance">H</header>
      <h1 className="profile-title">My profile</h1>

      {loading ? (
        <p className="commission-view-message">Loading profile...</p>
      ) : error && !profile ? (
        <p className="commission-view-message" role="alert">{error}</p>
      ) : (
        <form className="profile-panel" onSubmit={saveProfile}>
          <div className="profile-fields">
            <label>
              <span>Surname</span>
              <input name="surname" value={profile.surname || ""} onChange={updateField} readOnly={!editing} />
            </label>
            <label>
              <span>Name</span>
              <input name="name" value={profile.name || ""} onChange={updateField} readOnly={!editing} />
            </label>
            <label className="profile-biography-field">
              <span>Biography</span>
              <textarea name="biography" value={profile.biography || ""} onChange={updateField} readOnly={!editing} />
            </label>
            <div className="profile-location">
              <label>
                <span>City</span>
                <input name="city" value={profile.city || ""} onChange={updateField} readOnly={!editing} />
              </label>
              <label>
                <span>Country</span>
                <input name="country" value={profile.country || ""} onChange={updateField} readOnly={!editing} />
              </label>
              <label>
                <span>ZIP Code</span>
                <input name="zipCode" value={profile.zipCode || ""} onChange={updateField} readOnly={!editing} />
              </label>
            </div>
          </div>

          {error && <p className="prompt-status" role="alert">{error}</p>}
          <div className="profile-actions">
            <button type="button" className="change-password-button">Change password</button>
            <button
              type="submit"
              className="edit-profile-button"
              aria-label={editing ? "Save profile" : "Edit profile"}
              onClick={handleEditButtonClick}
              disabled={saving}
            >
              {editing ? "✓" : "✎"}
            </button>
          </div>
        </form>
      )}

      <button className="commission-back-button profile-back-button" type="button" onClick={onBack} aria-label="Back to commissions">
        <span aria-hidden="true">←</span>
      </button>
    </main>
  );
}
