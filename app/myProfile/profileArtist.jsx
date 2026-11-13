"use client";

import { useEffect, useState } from "react";
import { apiBaseUrl, authFetch } from "../lib/authFetch";

const emptyPictures = [];

export default function ProfileArtist({ artistId, navigation }) {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    authFetch(`${apiBaseUrl}/api/artist/${artistId}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Unable to load profile.");
        }
        return result;
      })
      .then((result) => {
        if (active) {
          setProfile({
            ...result,
            portfolioPictures: result.portfolioPictures || emptyPictures,
          });
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
  }, [artistId]);

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

  function addPictures(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    const currentPictures = profile.portfolioPictures || emptyPictures;
    if (currentPictures.length + files.length > 4) {
      setError("You can add up to 4 portfolio pictures.");
      return;
    }

    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ objectKey: reader.result, altText: file.name });
            reader.onerror = () => reject(new Error("Unable to read one of the selected pictures."));
            reader.readAsDataURL(file);
          }),
      ),
    )
      .then((pictures) => {
        setProfile((current) => ({
          ...current,
          portfolioPictures: [...(current.portfolioPictures || emptyPictures), ...pictures],
        }));
        setError("");
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : "Unable to add pictures.");
      });
  }

  function removePicture(indexToRemove) {
    setProfile((current) => ({
      ...current,
      portfolioPictures: (current.portfolioPictures || emptyPictures).filter(
        (_picture, index) => index !== indexToRemove,
      ),
    }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await authFetch(`${apiBaseUrl}/api/artist/${artistId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          portfolioPictures: (profile.portfolioPictures || emptyPictures).map(
            (picture) => picture.objectKey,
          ),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save profile.");
      }

      setProfile({ ...result, portfolioPictures: result.portfolioPictures || emptyPictures });
      setEditing(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="prompt-page artist-profile-page">
      {navigation}
      <header className="prompt-header" aria-label="Human Renaissance">H</header>
      <h1 className="profile-title">My profile</h1>

      {loading ? (
        <p className="commission-view-message">Loading profile...</p>
      ) : error && !profile ? (
        <p className="commission-view-message" role="alert">{error}</p>
      ) : (
        <form className="profile-panel artist-profile-panel" onSubmit={saveProfile}>
          <div className="artist-profile-portfolio">
            <div className="portfolio-carousel artist-profile-carousel">
              {(profile.portfolioPictures || []).map((picture, index) => (
                <div className="artist-profile-picture" key={`${picture.objectKey}-${index}`}>
                  <img src={picture.objectKey} alt={picture.altText || ""} />
                  {editing && (
                    <button
                      type="button"
                      className="artist-profile-remove"
                      onClick={() => removePicture(index)}
                      aria-label={`Remove portfolio picture ${index + 1}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {(profile.portfolioPictures || []).length === 0 && (
                <div className="portfolio-placeholder">Portfolio</div>
              )}
            </div>
            {editing && (profile.portfolioPictures || []).length < 4 && (
              <label className="artist-profile-upload">
                <span>Add portfolio pictures</span>
                <input type="file" accept="image/*" multiple onChange={addPictures} />
              </label>
            )}
          </div>

          <div className="profile-fields">
            <label>
              <span>Surname</span>
              <input name="surname" value={profile.surname || ""} onChange={updateField} readOnly={!editing} />
            </label>
            <label>
              <span>Family Name</span>
              <input name="familyName" value={profile.familyName || ""} onChange={updateField} readOnly={!editing} />
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
    </main>
  );
}
