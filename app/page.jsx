"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CreateCommission from "./market/commissioner/createCommission";
import OverviewCommission from "./market/commissioner/overviewCommission";
import ViewCommission from "./market/commissioner/viewCommission";
import OverviewCommissionArtist from "./market/artist/overviewCommission";
import ViewCommissionArtist from "./market/artist/viewCommission";
import ProfileCommissioner from "./myProfile/profileCommissioner";
import ProfileArtist from "./myProfile/profileArtist";
import CommissionerNavigation from "./navigation";
import { apiBaseUrl, authFetch } from "./lib/authFetch";

const initialForm = {
  prompt: "",
  gage: "",
  fusion: false,
};
export default function HomePage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [screen, setScreen] = useState("prompt");
  const [selectedCommissionId, setSelectedCommissionId] = useState(null);
  const [selectedCommissionIsActive, setSelectedCommissionIsActive] = useState(false);
  const [artistNotification, setArtistNotification] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    authFetch(`${apiBaseUrl}/api/auth/me`)
      .then(async (response) => {
        if (!response.ok) {
          router.replace("/login");
          return;
        }
        const result = await response.json();
        setUser(result.user);
        if (
          result.user.accountType === "commissioner" &&
          new URLSearchParams(window.location.search).get("screen") === "commissions"
        ) {
          setScreen("commissions");
        }
        setAuthChecked(true);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!authChecked) {
    return null;
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  function toggleFusion(event) {
    setForm((current) => ({ ...current, fusion: event.target.checked }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await authFetch(`${apiBaseUrl}/api/commission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: form.prompt,
          budget: Number(form.gage),
          fusionCommission: form.fusion,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to create the commission.");
      }

      setForm(initialForm);
      setScreen("commissions");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create the commission.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const navigation = (
    <CommissionerNavigation
      menuOpen={menuOpen}
      onToggle={() => setMenuOpen((current) => !current)}
      onClose={() => setMenuOpen(false)}
      onMarket={() => {
        setMenuOpen(false);
        setScreen("commissions");
      }}
      onProfile={() => {
        setMenuOpen(false);
        setScreen("profile");
      }}
    />
  );

  if (user.accountType === "artist") {
    const artistNavigation = (
      <CommissionerNavigation
        menuOpen={menuOpen}
        onToggle={() => setMenuOpen((current) => !current)}
        onClose={() => setMenuOpen(false)}
        onMarket={() => {
          setMenuOpen(false);
          setScreen("artist-market");
        }}
        onProfile={() => {
          setMenuOpen(false);
          setScreen("artist-profile");
        }}
      />
    );

    if (screen === "artist-profile") {
      return <ProfileArtist artistId={user.id} navigation={artistNavigation} />;
    }

    if (screen === "artist-commission") {
      return (
        <ViewCommissionArtist
          commissionId={selectedCommissionId}
          artistId={user.id}
          onBack={() => setScreen("artist-market")}
          onApplicationSent={(message) => {
            setArtistNotification(message);
            setScreen("artist-market");
          }}
          navigation={artistNavigation}
        />
      );
    }

    return (
      <OverviewCommissionArtist
        navigation={artistNavigation}
        notification={artistNotification}
        onSelectCommission={(commissionId) => {
          setArtistNotification("");
          setSelectedCommissionId(commissionId);
          setScreen("artist-commission");
        }}
      />
    );
  }

  if (screen === "commissions") {
    return (
      <OverviewCommission
        onCreate={() => setScreen("prompt")}
        onSelectCommission={(commissionId, isActive) => {
          setSelectedCommissionId(commissionId);
          setSelectedCommissionIsActive(isActive);
          setScreen("view-commission");
        }}
        navigation={navigation}
      />
    );
  }

  if (screen === "view-commission") {
    return (
      <ViewCommission
        commissionId={selectedCommissionId}
        isActive={selectedCommissionIsActive}
        onBack={() => setScreen("commissions")}
        navigation={navigation}
      />
    );
  }

  if (screen === "profile") {
    return (
      <ProfileCommissioner
        commissionerId={user.id}
        onBack={() => setScreen("commissions")}
        navigation={navigation}
      />
    );
  }

  return (
    <CreateCommission
      form={form}
      submitting={submitting}
      error={error}
      onFieldChange={updateField}
      onFusionToggle={toggleFusion}
      onSubmit={handleSubmit}
      navigation={navigation}
    />
  );
}
