import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Search as SearchIcon, Filter, X } from "lucide-react";
import MessageCard from "../components/MessageCard.jsx";
import "../styles/Search.css";

import { API_BASE_URL } from "../api.js";

const mockMessages = [
  { id: "1", user_id: "user1", username: "KindPanda", content: "Remember: every small act of kindness creates a ripple effect!", whisper_id: "Whispering #0001", likes_count: 24, comments_count: 5, tags: ["kindness", "motivation"], mode: "positive", created_date: new Date(Date.now() - 3600000).toISOString() },
  { id: "2", user_id: "user2", username: "BraveDolphin", content: "Just finished my first 5K run! Progress isn't always visible day-to-day.", whisper_id: "Whispering #0002", likes_count: 45, comments_count: 12, tags: ["fitness", "progress"], mode: "positive", created_date: new Date(Date.now() - 7200000).toISOString() },
  { id: "3", user_id: "user3", username: "GentleOwl", content: "Taking time for self-care isn't selfish, it's necessary. 🌸", whisper_id: "Whispering #0003", likes_count: 67, comments_count: 8, tags: ["selfcare", "mental-health"], mode: "positive", created_date: new Date(Date.now() - 10800000).toISOString() },
];

export default function Search() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [searchTerm, setSearchTerm] = useState(queryParams.get("q") || "");
  const [selectedTags, setSelectedTags] = useState([]);
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableTags, setAvailableTags] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  const debounceRef = useRef(null);
  const latestFetchController = useRef(null);

  // Fetch messages from backend (debounced when searchTerm/selectedTags change)
  useEffect(() => {
    // debounce to avoid spamming the API while typing
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      // Abort previous fetch if any
      if (latestFetchController.current) {
        latestFetchController.current.abort();
      }
      const controller = new AbortController();
      latestFetchController.current = controller;

      async function loadMessages() {
        setIsLoading(true);
        setFetchError(null);

        const token = localStorage.getItem("token");
        const headers = token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" };

        try {
          // Build query params for backend search
          const params = new URLSearchParams();
          if (searchTerm) params.set("search", searchTerm);
          if (selectedTags.length) params.set("tags", selectedTags.join(","));
          // default page size
          params.set("limit", "50");

          // Try common post search endpoint
          const res = await fetch(`${API_BASE_URL}/posts?${params.toString()}`, { headers, signal: controller.signal });

          let data = null;
          if (res.ok) {
            data = await res.json();
          } else {
            // fallback to a generic search endpoint
            const altRes = await fetch(`${API_BASE_URL}/search?${params.toString()}`, { headers, signal: controller.signal });
            if (altRes.ok) data = await altRes.json();
          }

          if (!data) {
            // If backend didn't return data, fall back to local mock filtering
            setMessages(mockMessages);
            const tags = new Set();
            mockMessages.forEach(m => m.tags?.forEach(t => tags.add(t)));
            setAvailableTags(Array.from(tags));
            setIsLoading(false);
            return;
          }

          // Normalize possible shapes: array of posts or { posts: [...] }
          let posts = Array.isArray(data) ? data : (Array.isArray(data.posts) ? data.posts : []);
          // Ensure the posts have expected fields
          posts = posts.map(p => ({
            id: p.id ?? p._id ?? String(Math.random()),
            user_id: p.user_id ?? p.userId ?? p.author_id,
            username: p.username ?? p.display_name ?? p.author_name ?? "Anonymous",
            content: p.content ?? p.body ?? "",
            whisper_id: p.whisper_id ?? p.whisperId ?? p.slug ?? "",
            likes_count: p.likes_count ?? p.likes ?? 0,
            comments_count: p.comments_count ?? p.comments ?? 0,
            tags: p.tags ?? p.tags_list ?? [],
            mode: p.mode ?? (p.is_moderated ? "positive" : "unhinged"),
            created_date: p.created_date ?? p.created_at ?? p.timestamp ?? new Date().toISOString(),
          }));

          setMessages(posts);

          // derive available tags from returned posts if backend doesn't provide /tags endpoint
          const tagSet = new Set();
          posts.forEach(m => m.tags?.forEach(t => tagSet.add(t)));
          // additionally try to fetch tags list endpoint if available (best-effort)
          try {
            const tagsRes = await fetch(`${API_BASE_URL}/tags`, { headers, signal: controller.signal });
            if (tagsRes.ok) {
              const tagsData = await tagsRes.json();
              if (Array.isArray(tagsData) && tagsData.length > 0) {
                setAvailableTags(tagsData);
              } else {
                setAvailableTags(Array.from(tagSet));
              }
            } else {
              setAvailableTags(Array.from(tagSet));
            }
          } catch {
            setAvailableTags(Array.from(tagSet));
          }
        } catch (err) {
          if (err.name === "AbortError") {
            // aborted - ignore
            return;
          }
          console.warn("Search fetch failed, falling back to mock messages.", err);
          setFetchError(err.message || "Failed to load search results");
          setMessages(mockMessages);
          const tags = new Set();
          mockMessages.forEach(m => m.tags?.forEach(t => tags.add(t)));
          setAvailableTags(Array.from(tags));
        } finally {
          setIsLoading(false);
        }
      }

      loadMessages();
    }, 300); // 300ms debounce

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (latestFetchController.current) {
        // Do not abort here to allow in-flight request to finish if user navigates quickly.
        // (cleanup on next fetch or unmount)
      }
    };
  }, [searchTerm, selectedTags]);

  // Cleanup on unmount: abort any in-flight fetch
  useEffect(() => {
    return () => {
      if (latestFetchController.current) latestFetchController.current.abort();
    };
  }, []);

  // Keep client-side filteredMessages in sync (used when backend returns many posts or for immediate UI)
  useEffect(() => {
    let filtered = messages;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        (m.content || "").toLowerCase().includes(q) ||
        (m.username || "").toLowerCase().includes(q)
      );
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter(m => (m.tags || []).some(t => selectedTags.includes(t)));
    }
    setFilteredMessages(filtered);
  }, [messages, searchTerm, selectedTags]);

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
  };

  // Optimistic like handling with backend sync
  const handleLike = async (messageId, isLiked) => {
    setMessages(prev => prev.map(m =>
      m.id === messageId
        ? { ...m, likes_count: isLiked ? (m.likes_count || 0) + 1 : Math.max(0, (m.likes_count || 0) - 1), _optimisticLiking: true }
        : m
    ));

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" };

      const res = await fetch(`${API_BASE_URL}/posts/${messageId}/like`, {
        method: "POST",
        headers,
        body: JSON.stringify({ like: isLiked })
      });

      if (!res.ok) throw new Error(`Like failed (${res.status})`);

      const body = await res.json().catch(() => null);
      setMessages(prev => prev.map(m =>
        m.id === messageId
          ? { ...m, likes_count: typeof body?.likes_count === "number" ? body.likes_count : m.likes_count, _optimisticLiking: false }
          : m
      ));
    } catch (err) {
      console.error("Failed to sync like:", err);
      // revert optimistic change
      setMessages(prev => prev.map(m =>
        m.id === messageId
          ? { ...m, likes_count: isLiked ? Math.max(0, (m.likes_count || 0) - 1) : (m.likes_count || 0) + 1, _optimisticLiking: false }
          : m
      ));
      setFetchError(err.message || "Failed to sync like");
    }
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h1>Search Messages</h1>
        <p>Find inspiring messages and positive content</p>
      </div>

      {fetchError && (
        <div className="error-banner">
          <p>There was a problem loading live results: {String(fetchError)} — showing fallback content where available.</p>
        </div>
      )}

      <div className="search-filters-card">
        <div className="search-input-row">
          <div className="search-input-wrapper">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search messages or usernames..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          {(searchTerm || selectedTags.length > 0) && (
            <button onClick={clearFilters} className="clear-button">
              <X /> Clear
            </button>
          )}
        </div>

        {availableTags.length > 0 && (
          <div className="tags-filter">
            <div className="tags-filter-header">
              <Filter />
              <span>Filter by tags:</span>
            </div>
            <div className="tags-filter-list">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`tag-filter-button ${selectedTags.includes(tag) ? 'active' : ''}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="search-results">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className="skeleton-card" />)
        ) : filteredMessages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <SearchIcon />
            </div>
            <h3>{searchTerm || selectedTags.length > 0 ? "No messages found" : "Start searching"}</h3>
          </div>
        ) : (
          <>
            <p className="results-count">Found {filteredMessages.length} message(s)</p>
            {filteredMessages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onLike={handleLike}
                onReport={() => {}}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}