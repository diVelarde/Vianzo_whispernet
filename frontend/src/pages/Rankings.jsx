import React, { useState, useEffect } from "react";
import { Trophy, Heart, MessageSquare, Award } from "lucide-react";
import "../styles/Rankings.css";

import { API_BASE_URL } from "../api.js";

const mockUsers = [
  { id: "1", user_id: "user1", display_name: "KindPanda", messages_posted: 45, total_likes_received: 234, popularity_score: 918, kindness_badge: "gold" },
  { id: "2", user_id: "user2", display_name: "BraveDolphin", messages_posted: 32, total_likes_received: 189, popularity_score: 698, kindness_badge: "gold" },
  { id: "3", user_id: "user3", display_name: "GentleOwl", messages_posted: 28, total_likes_received: 156, popularity_score: 592, kindness_badge: "gold" },
  { id: "4", user_id: "user4", display_name: "HappyFox", messages_posted: 21, total_likes_received: 98, popularity_score: 406, kindness_badge: "silver" },
  { id: "5", user_id: "user5", display_name: "CalmRabbit", messages_posted: 15, total_likes_received: 67, popularity_score: 284, kindness_badge: "silver" },
];

const mockCurrentUser = { id: "user2" };

const badgeIcons = { bronze: "🥉", silver: "🥈", gold: "🥇", platinum: "💎" };

function deriveBadge(popularity_score) {
  const score = Number(popularity_score || 0);
  if (score >= 500) return "platinum";
  if (score >= 200) return "gold";
  if (score >= 50) return "silver";
  if (score >= 10) return "bronze";
  return null;
}

function UserRankingCard({ user, rank, currentUser }) {
  const isCurrentUser = currentUser && user.user_id === currentUser.id;

  return (
    <div className={`ranking-card ${isCurrentUser ? 'current-user' : ''}`}>
      <div className="ranking-card-content">
        <div className="ranking-left">
          <div className={`rank-badge ${rank <= 3 ? 'top-three' : ''}`}>
            {rank <= 3 ? <Trophy /> : `#${rank}`}
          </div>
          <div className="user-info">
            <div className="user-name-row">
              <h3>{user.display_name || `User #${String(user.id).slice(-4)}`}</h3>
              {isCurrentUser && <span className="you-badge">You</span>}
            </div>
            <div className="user-stats">
              <span><MessageSquare /> {user.messages_posted ?? 0} messages</span>
              <span><Heart /> {user.total_likes_received ?? 0} likes</span>
            </div>
          </div>
        </div>
        <div className="ranking-right">
          <div className="popularity-score">{user.popularity_score ?? 0}</div>
          { (user.kindness_badge || deriveBadge(user.popularity_score)) && (
            <span className={`kindness-badge ${user.kindness_badge || deriveBadge(user.popularity_score)}`}>
              <Award /> {badgeIcons[user.kindness_badge || deriveBadge(user.popularity_score)]} {user.kindness_badge || deriveBadge(user.popularity_score)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Rankings() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function loadRankings() {
      setIsLoading(true);
      setFetchError(null);

      const token = localStorage.getItem("token");
      const headers = token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" };

      try {
        // Try a dedicated leaderboard endpoint first
        let rankingsRes = await fetch(`${API_BASE_URL}/rankings`, { headers, signal: controller.signal });
        let rankingsData = null;

        if (rankingsRes.ok) {
          rankingsData = await rankingsRes.json();
        } else {
          // fallback: try a profiles endpoint sorted by popularity (common patterns)
          const fallbackRes = await fetch(`${API_BASE_URL}/profiles?sort=-popularity_score&limit=50`, { headers, signal: controller.signal });
          if (fallbackRes.ok) {
            rankingsData = await fallbackRes.json();
          } else {
            // final fallback: some APIs return /leaderboard
            const otherRes = await fetch(`${API_BASE_URL}/leaderboard`, { headers, signal: controller.signal });
            if (otherRes.ok) {
              rankingsData = await otherRes.json();
            }
          }
        }

        if (!mounted) return;

        // Normalize data into expected shape: array of users
        let normalized = [];
        if (Array.isArray(rankingsData)) {
          normalized = rankingsData.map((u, idx) => ({
            id: u.id ?? u.user_id ?? String(idx),
            user_id: u.user_id ?? u.id ?? u.userId ?? `user_${idx}`,
            display_name: u.display_name ?? u.name ?? `User ${idx + 1}`,
            messages_posted: u.messages_posted ?? u.messagesCount ?? 0,
            total_likes_received: u.total_likes_received ?? u.likes ?? 0,
            popularity_score: u.popularity_score ?? u.popularity ?? 0,
            kindness_badge: u.kindness_badge ?? deriveBadge(u.popularity_score ?? u.popularity),
          }));
        }

        if (!normalized.length) {
          // If the API returned nothing useful, use mock users
          setUsers(mockUsers);
        } else {
          // Sort descending by popularity_score just in case
          normalized.sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
          setUsers(normalized);
        }
      } catch (err) {
        console.warn("Failed to fetch rankings, falling back to mocks.", err);
        setFetchError(err.message || "Failed to load rankings");
        if (mounted) {
          setUsers(mockUsers);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }

      // Load current user (best-effort)
      try {
        let me = null;
        const meRes = await fetch(`${API_BASE_URL}/me`, { headers, signal: controller.signal });
        if (meRes.ok) {
          me = await meRes.json();
        } else {
          const meRes2 = await fetch(`${API_BASE_URL}/users/me`, { headers, signal: controller.signal });
          if (meRes2.ok) me = await meRes2.json();
        }
        if (mounted) {
          setCurrentUser(me ?? mockCurrentUser);
        }
      } catch {
        if (mounted) setCurrentUser(mockCurrentUser);
      }
    }

    loadRankings();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="rankings-container">
      <div className="rankings-header">
        <h1>Kindness Leaderboard</h1>
        <p>Celebrating our most positive contributors</p>
      </div>

      {fetchError && (
        <div className="error-banner">
          <p>There was a problem loading live rankings — showing fallback data.</p>
        </div>
      )}

      <div className="rankings-list">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="skeleton-card" />)
        ) : users.length === 0 ? (
          <div className="empty-state">
            <Trophy />
            <h3>No rankings yet</h3>
            <p>Start sharing vibes to get on the board!</p>
          </div>
        ) : (
          users.map((user, index) => (
            <UserRankingCard
              key={user.id ?? user.user_id ?? index}
              user={user}
              rank={index + 1}
              currentUser={currentUser}
            />
          ))
        )}
      </div>
    </div>
  );
}