import React, { useState, useEffect } from "react";
import { User, MessageSquare, Heart, Award, Edit, Save, X, LogOut } from "lucide-react";
import "../styles/Profile.css";

import { API_BASE_URL } from "../api.js";

const mockUser = { id: "user1", email: "user@example.com" };
const mockProfile = {
  id: "profile1",
  user_id: "user1",
  display_name: "KindPanda",
  messages_posted: 12,
  total_likes_received: 156,
  popularity_score: 432
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isIncognitoMode, setIsIncognitoMode] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("incognitoMode")) || false;
    } catch {
      return false;
    }
  });
  const [fetchError, setFetchError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    const token = localStorage.getItem("token");
    const headers = token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };

    async function loadProfile() {
      setIsLoading(true);
      setFetchError(null);

      try {
        let fetchedUser = null;
        try {
          const res = await fetch(`${API_BASE_URL}/me`, { headers, signal: controller.signal });
          if (res.ok) {
            fetchedUser = await res.json();
          } else if (res.status === 404) {
            const res2 = await fetch(`${API_BASE_URL}/users/me`, { headers, signal: controller.signal });
            if (res2.ok) fetchedUser = await res2.json();
          }
        } catch (err) {
          console.warn("Fetching /me failed, will fallback to mock user.", err);
        }

        if (!fetchedUser) {
          fetchedUser = mockUser;
        }

        if (!mounted) return;
        setUser(fetchedUser);

        let fetchedProfile = null;
        try {
          const byIdRes = await fetch(`${API_BASE_URL}/profiles/${fetchedUser.id}`, {
            headers,
            signal: controller.signal
          });
          if (byIdRes.ok) {
            fetchedProfile = await byIdRes.json();
          } else {
            const qRes = await fetch(`${API_BASE_URL}/profiles?user_id=${encodeURIComponent(fetchedUser.id)}`, {
              headers,
              signal: controller.signal
            });
            if (qRes.ok) {
              const qData = await qRes.json();
              if (Array.isArray(qData)) fetchedProfile = qData[0] || null;
              else fetchedProfile = qData;
            }
          }
        } catch (err) {
          console.warn("Profile fetch failed, using mock profile.", err);
        }

        if (!fetchedProfile) {
          fetchedProfile = mockProfile;
        }

        if (!mounted) return;
        setProfile(fetchedProfile);
        setEditedName(fetchedProfile.display_name || "");
      } catch (err) {
        console.error("Error loading profile data:", err);
        setFetchError(err.message || "Failed to load profile");
        setUser((u) => u || mockUser);
        setProfile((p) => p || mockProfile);
        setEditedName((p) => p || mockProfile.display_name);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("incognitoMode", JSON.stringify(isIncognitoMode));
    } catch {
    }
  }, [isIncognitoMode]);

  const handleIncognitoToggle = () => {
    setIsIncognitoMode((s) => !s);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    const headers = token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };

    try {
      await fetch(`${API_BASE_URL}/logout`, { method: "POST", headers }).catch(() => {});
    } catch {
    } finally {
      try {
        localStorage.removeItem("token");
      } catch {}
      alert("Logged out!");
      window.location.reload();
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    const trimmed = (editedName || "").trim();
    if (!trimmed) {
      alert("Display name cannot be empty.");
      return;
    }
    if (trimmed === profile.display_name) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setFetchError(null);

    const token = localStorage.getItem("token");
    const headers = token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };

    try {
      const res = await fetch(`${API_BASE_URL}/profiles/${profile.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ display_name: trimmed })
      });

      if (!res.ok) {
        const res2 = await fetch(`${API_BASE_URL}/profiles/${profile.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ display_name: trimmed })
        });
        if (!res2.ok) {
          throw new Error(`Save failed (${res.status})`);
        } else {
          const updated = await res2.json().catch(() => null);
          setProfile((prev) => ({ ...(prev || {}), display_name: trimmed, ...(updated || {}) }));
        }
      } else {
        const updated = await res.json().catch(() => null);
        setProfile((prev) => ({ ...(prev || {}), display_name: trimmed, ...(updated || {}) }));
      }

      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setFetchError(err.message || "Failed to save profile");
      alert("Could not save profile. Changes are still local.");
      setProfile((prev) => ({ ...(prev || {}), display_name: trimmed }));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateKindnessBadge = () => {
    if (!profile) return null;
    const score = profile.popularity_score || 0;
    if (score >= 500) return "platinum";
    if (score >= 200) return "gold";
    if (score >= 50) return "silver";
    if (score >= 10) return "bronze";
    return null;
  };

  const kindnessBadge = calculateKindnessBadge();

  return (
    <div className="profile-container">
      <h1>My Profile</h1>

      {isLoading ? (
        <div className="skeleton-container">
          <div className="skeleton-card large" />
          <div className="skeleton-grid">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        </div>
      ) : fetchError ? (
        <div className="error-message">
          <p>There was a problem loading your profile: {String(fetchError)}</p>
          <p>Showing cached or fallback data.</p>
        </div>
      ) : profile ? (
        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-info">
              <User className="profile-avatar" />
              <div className="profile-details">
                {isEditing ? (
                  <div className="edit-name-row">
                    <input
                      value={editedName}
                      onChange={e => setEditedName(e.target.value)}
                      className="name-input"
                      disabled={isSaving}
                      aria-label="Edit display name"
                    />
                    <button
                      onClick={handleSaveProfile}
                      className="icon-button"
                      aria-label="Save display name"
                      disabled={isSaving}
                    >
                      <Save />
                    </button>
                    <button
                      onClick={() => { setIsEditing(false); setEditedName(profile?.display_name || ""); }}
                      className="icon-button"
                      aria-label="Cancel edit"
                      disabled={isSaving}
                    >
                      <X />
                    </button>
                  </div>
                ) : (
                  <div className="display-name-row">
                    <h2>{profile.display_name}</h2>
                    <button onClick={() => setIsEditing(true)} className="icon-button" aria-label="Edit profile name">
                      <Edit />
                    </button>
                  </div>
                )}
                <p className="email">{user?.email}</p>
                {kindnessBadge && (
                  <span className={`badge ${kindnessBadge}`}>
                    <Award /> {kindnessBadge.charAt(0).toUpperCase() + kindnessBadge.slice(1)} Contributor
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <MessageSquare />
              <p className="stat-value">{profile.messages_posted ?? 0}</p>
              <p className="stat-label">Messages</p>
            </div>
            <div className="stat-card">
              <Heart />
              <p className="stat-value">{profile.total_likes_received ?? 0}</p>
              <p className="stat-label">Likes</p>
            </div>
            <div className="stat-card">
              <Award />
              <p className="stat-value">{profile.popularity_score ?? 0}</p>
              <p className="stat-label">Vibe Score</p>
            </div>
          </div>

          <div className="settings-card">
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-title">Incognito Mode</span>
                <span className="setting-description">View and post unmoderated content.</span>
              </div>
              <button
                onClick={handleIncognitoToggle}
                className={`toggle-switch ${isIncognitoMode ? 'active' : ''}`}
                aria-pressed={isIncognitoMode}
                aria-label="Toggle incognito mode"
              >
                <span className="toggle-knob" />
              </button>
            </div>
            <button onClick={handleLogout} className="logout-button" aria-label="Log out">
              <LogOut /> Logout
            </button>
          </div>
        </div>
      ) : (
        <p className="error-message">Could not load profile. Please try again later.</p>
      )}
    </div>
  );
}