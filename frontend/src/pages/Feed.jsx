import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import MessageCard from "../components/MessageCard.jsx";
import "../styles/Feed.css";

import { API_BASE_URL } from "../api.js";

const createPageUrl = (pageName) => `/${pageName.toLowerCase()}`;

const mockMessages = [
  {
    id: "1",
    user_id: "user1",
    username: "KindPanda",
    content:
      "Remember: every small act of kindness creates a ripple effect. Today, hold the door for someone, smile at a stranger, or simply listen. You never know whose day you might change! ✨",
    whisper_id: "Whispering #0001",
    likes_count: 24,
    comments_count: 5,
    tags: ["kindness", "motivation"],
    mode: "positive",
    is_approved: "approved",
    created_date: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    user_id: "user2",
    username: "BraveDolphin",
    content:
      "Just finished my first 5K run! Six months ago I couldn't run for 2 minutes. Progress isn't always visible day-to-day, but looking back, the change is incredible. Keep going! 🏃‍♀️",
    whisper_id: "Whispering #0002",
    likes_count: 45,
    comments_count: 12,
    tags: ["fitness", "progress"],
    mode: "positive",
    is_approved: "approved",
    created_date: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "3",
    user_id: "user3",
    username: "GentleOwl",
    content:
      "Hot take: pineapple on pizza is actually amazing and I'm tired of pretending it's not 🍕🍍",
    whisper_id: "Whispering #0003",
    likes_count: 67,
    comments_count: 34,
    tags: ["unpopular-opinion", "food"],
    mode: "unhinged",
    is_approved: "approved",
    created_date: new Date(Date.now() - 10800000).toISOString(),
  },
];

const mockProfiles = {
  user1: { display_name: "KindPanda" },
  user2: { display_name: "BraveDolphin" },
  user3: { display_name: "GentleOwl" },
};

export default function Feed() {
  const [messages, setMessages] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("-created_date");
  const [isIncognitoMode, setIsIncognitoMode] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Fetch posts and associated profiles from backend (with fallbacks)
  useEffect(() => {
    const ac = new AbortController();
    let mounted = true;

    const token = localStorage.getItem("token"); // optional auth token
    const headers = token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };

    async function loadFeed() {
      try {
        setIsLoading(true);
        setFetchError(null);

        const res = await fetch(`${API_BASE_URL}/posts`, {
          method: "GET",
          headers,
          signal: ac.signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        if (!mounted) return;

        // Ensure data is an array
        const posts = Array.isArray(data) ? data : [];

        setMessages(posts);

        // collect unique user IDs
        const userIds = Array.from(
          new Set(posts.map((p) => p.user_id).filter(Boolean))
        );

        if (userIds.length === 0) return;

        // try bulk fetch profiles
        try {
          const idsParam = encodeURIComponent(userIds.join(","));
          const profilesRes = await fetch(
            `${API_BASE_URL}/profiles?ids=${idsParam}`,
            { method: "GET", headers, signal: ac.signal }
          );

          if (profilesRes.ok) {
            const profilesData = await profilesRes.json();
            // Expecting an object like { user1: {display_name: ...}, user2: {...} }
            if (mounted) setProfiles((prev) => ({ ...prev, ...profilesData }));
          } else {
            // fallback to fetching them individually
            const fetchedProfiles = {};
            for (const id of userIds) {
              try {
                const r = await fetch(`${API_BASE_URL}/profiles/${id}`, {
                  method: "GET",
                  headers,
                  signal: ac.signal,
                });
                if (r.ok) {
                  const profile = await r.json();
                  fetchedProfiles[id] = profile;
                }
              } catch (err) {
                // ignore individual profile failures
                console.warn(`Failed to fetch profile ${id}:`, err);
              }
            }
            if (mounted && Object.keys(fetchedProfiles).length > 0) {
              setProfiles((prev) => ({ ...prev, ...fetchedProfiles }));
            }
          }
        } catch (profilesErr) {
          // If any profile call fails, do not block the feed; keep going with whatever we have
          console.warn("Profile fetch failed, using any cached or mock profiles.", profilesErr);
        }
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        // fallback to mock data so the UI remains usable even if backend is down
        setMessages(mockMessages);
        setProfiles(mockProfiles);
        setFetchError(err.message || "Failed to load feed");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadFeed();

    return () => {
      mounted = false;
      ac.abort();
    };
  }, []);

  // back to top visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const messagesWithProfiles = useMemo(() => {
    return messages.map((msg) => ({
      ...msg,
      username: profiles[msg.user_id]?.display_name || msg.username || "Anonymous",
    }));
  }, [messages, profiles]);

  const filteredMessages = useMemo(() => {
    let filtered = [...messagesWithProfiles];
    if (!isIncognitoMode) {
      filtered = filtered.filter((m) => m.mode === "positive");
    }
    if (filter === "-likes_count") {
      filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    } else if (filter === "-created_date") {
      filtered.sort(
        (a, b) =>
          new Date(b.created_date || b.created_at || 0) -
          new Date(a.created_date || a.created_at || 0)
      );
    }
    return filtered;
  }, [messagesWithProfiles, filter, isIncognitoMode]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Optimistic like handling with backend sync (reverts on failure)
  const handleLike = async (messageId, isLiked) => {
    // optimistic update
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              likes_count: isLiked ? (m.likes_count || 0) + 1 : Math.max(0, (m.likes_count || 0) - 1),
              _optimisticLiking: true,
            }
          : m
      )
    );

    try {
      const token = localStorage.getItem("token");
      const headers = token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" };

      const res = await fetch(`${API_BASE_URL}/posts/${messageId}/like`, {
        method: "POST",
        headers,
        body: JSON.stringify({ like: isLiked }),
      });

      if (!res.ok) {
        throw new Error(`Like request failed: ${res.status}`);
      }

      const serverBody = await res.json();

      // reconcile server value if available
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                likes_count: typeof serverBody.likes_count === "number" ? serverBody.likes_count : m.likes_count,
                _optimisticLiking: false,
              }
            : m
        )
      );
    } catch (err) {
      console.error("Failed to sync like with backend, reverting optimistic change.", err);
      // revert optimistic change
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                likes_count: isLiked ? Math.max(0, (m.likes_count || 0) - 1) : (m.likes_count || 0) + 1,
                _optimisticLiking: false,
              }
            : m
        )
      );
    }
  };

  // Report a message to the backend (optimistic acknowledgement)
  const handleReport = async (messageId) => {
    // Optional: mark locally as reported so UI gives feedback
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, _reported: true } : m))
    );

    try {
      const token = localStorage.getItem("token");
      const headers = token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" };

      const res = await fetch(`${API_BASE_URL}/posts/${messageId}/report`, {
        method: "POST",
        headers,
        body: JSON.stringify({ reason: "user_report" }),
      });

      if (!res.ok) {
        throw new Error(`Report request failed: ${res.status}`);
      }

      // optionally check response body for confirmation
      // show a friendly confirmation
      alert("Thank you for your feedback. The post has been reported for review.");
    } catch (err) {
      console.error("Failed to report post to backend", err);
      // keep UI friendly: inform the user but leave the message state
      alert("There was an error submitting your report. It will still be reviewed locally.");
    }
  };

  return (
    <div className="feed-container">
      <div className="feed-header">
        <div className="feed-header-top">
          <h1 className="feed-title">{isIncognitoMode ? "🕶️ Incognito Feed" : "✨ Vibe Feed"}</h1>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="post-vibe-button"
              aria-label="Compose a new vibe"
              onClick={() => {
                /* keep Link for routing but allow any additional logic if needed */
                /* We keep Link around for semantics but also handle programmatic navigation if desired */
              }}
            >
              <Link to={createPageUrl("Compose")} style={{ color: "inherit", textDecoration: "none" }}>
                Post Vibe
              </Link>
            </button>

            <button
              className={`filter-button ${isIncognitoMode ? "active" : ""}`}
              aria-pressed={isIncognitoMode}
              onClick={() => setIsIncognitoMode((s) => !s)}
              title="Toggle incognito (shows all posts when on)"
              style={{ padding: "8px 10px", marginLeft: 4 }}
            >
              {isIncognitoMode ? "Incognito On" : "Incognito Off"}
            </button>
          </div>
        </div>

        <div className="feed-filters">
          <button
            className={`filter-button ${filter === "-created_date" ? "active" : ""}`}
            onClick={() => setFilter("-created_date")}
          >
            Fresh
          </button>
          <button
            className={`filter-button ${filter === "-likes_count" ? "active" : ""}`}
            onClick={() => setFilter("-likes_count")}
          >
            Popular
          </button>
        </div>
      </div>

      <div className="feed-content">
        {isLoading ? (
          <div className="skeleton-container">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="skeleton-card" />
              ))}
          </div>
        ) : fetchError ? (
          <div className="error-state">
            <h3>Unable to load the live feed</h3>
            <p>{String(fetchError)}</p>
            <p>Showing cached/fallback content below.</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{isIncognitoMode ? "🕶️" : "🤫"}</div>
            <h3>The feed is empty...</h3>
            <p>Be the first to share a vibe!</p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              onLike={handleLike}
              onReport={handleReport}
            />
          ))
        )}
      </div>

      {showBackToTop && (
        <button className="back-to-top-button" onClick={scrollToTop} aria-label="Back to top">
          <ArrowUp />
        </button>
      )}
    </div>
  );
}