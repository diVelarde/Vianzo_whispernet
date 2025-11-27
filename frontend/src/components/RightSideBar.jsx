import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import "../styles/RightSideBar.css";

import { API_BASE_URL } from "../api.js";

const createPageUrl = (pageName) => `/${pageName.toLowerCase()}`;

const mockRankings = [
  { id: "1", display_name: "KindPanda", popularity_score: 918, kindness_badge: "gold" },
  { id: "2", display_name: "BraveDolphin", popularity_score: 698, kindness_badge: "gold" },
  { id: "3", display_name: "GentleOwl", popularity_score: 592, kindness_badge: "silver" },
];

export default function RightSidebar({ isIncognitoMode }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const controllerRef = useRef(null);

  useEffect(() => {
    controllerRef.current = new AbortController();
    const { signal } = controllerRef.current;

    async function loadRankings() {
      setIsLoading(true);
      setFetchError(null);

      const token = localStorage.getItem("token");
      const headers = token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" };

      try {
        // Try a lightweight leaderboard endpoint first
        let res = await fetch(`${API_BASE_URL}/rankings?limit=5`, { headers, signal });
        let data = null;

        if (!res.ok) {
          // fallback to profiles sorted by popularity
          res = await fetch(`${API_BASE_URL}/profiles?sort=-popularity_score&limit=5`, { headers, signal });
        }

        if (res.ok) {
          data = await res.json();
        }

        if (!data || (Array.isArray(data) && data.length === 0)) {
          // final fallback: some APIs wrap results
          // attempt to fetch /leaderboard
          try {
            const alt = await fetch(`${API_BASE_URL}/leaderboard?limit=5`, { headers, signal });
            if (alt.ok) data = await alt.json();
          } catch (err) {
            // ignore
          }
        }

        // normalize into expected small ranking list
        let normalized = [];
        if (Array.isArray(data)) {
          normalized = data.map((u, idx) => ({
            id: u.id ?? u.user_id ?? String(idx),
            display_name: u.display_name ?? u.name ?? `User ${idx + 1}`,
            popularity_score: u.popularity_score ?? u.popularity ?? u.score ?? 0,
            kindness_badge: u.kindness_badge ?? (u.popularity_score ? deriveBadge(u.popularity_score) : null),
          }));
        } else if (data && Array.isArray(data.items)) {
          normalized = data.items.slice(0, 5).map((u, idx) => ({
            id: u.id ?? u.user_id ?? String(idx),
            display_name: u.display_name ?? u.name ?? `User ${idx + 1}`,
            popularity_score: u.popularity_score ?? u.popularity ?? u.score ?? 0,
            kindness_badge: u.kindness_badge ?? (u.popularity_score ? deriveBadge(u.popularity_score) : null),
          }));
        }

        if (normalized.length === 0) {
          setRankings(mockRankings);
        } else {
          setRankings(normalized.slice(0, 5));
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.warn("Failed to load right sidebar rankings:", err);
        setFetchError(err.message || "Failed to load rankings");
        setRankings(mockRankings);
      } finally {
        setIsLoading(false);
      }
    }

    loadRankings();

    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, []);

  function deriveBadge(popularity_score) {
    const score = Number(popularity_score || 0);
    if (score >= 500) return "platinum";
    if (score >= 200) return "gold";
    if (score >= 50) return "silver";
    if (score >= 10) return "bronze";
    return null;
  }

  const handleSearch = (e) => {
    e?.preventDefault();
    const q = searchTerm.trim();
    if (!q) return;
    // navigate to Search route with query param (preserves SPA behavior)
    navigate(`${createPageUrl("Search")}?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="right-sidebar">
      <form onSubmit={handleSearch} className="search-form" role="search" aria-label="Search messages">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search the vibes 🔍"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Search"
          />
        </div>
      </form>

      <div className="leaders-card" role="region" aria-label="Vibe leaders">
        <div className="leaders-header">
          <span className="crown">👑</span>
          <span>Vibe Leaders</span>
        </div>

        {fetchError && (
          <div className="error-banner">
            <small>Could not load live leaders — showing recent data.</small>
          </div>
        )}

        <div className="leaders-list">
          {isLoading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="leader-skeleton">
                  <div className="skeleton-avatar" />
                  <div className="skeleton-text" />
                </div>
              ))
          ) : (
            rankings.map((user, index) => (
              <div key={user.id} className="leader-item">
                <div className="leader-left">
                  <div className={`leader-rank rank-${index + 1}`}>
                    {["🥇", "🥈", "🥉"][index] || `#${index + 1}`}
                  </div>
                  <div className="leader-info">
                    <p className="leader-name">{user.display_name || "Anonymous"}</p>
                    <p className="leader-score">{user.popularity_score || 0} vibes ✨</p>
                  </div>
                </div>
                {user.kindness_badge && (
                  <span className="leader-badge" aria-hidden>
                    {user.kindness_badge === "platinum" ? "💎" : user.kindness_badge === "gold" ? "🏆" : user.kindness_badge === "silver" ? "🥈" : "🥉"}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        <Link to={createPageUrl("Rankings")} className="view-all-link">
          View all vibes 🚀
        </Link>
      </div>
    </div>
  );
}