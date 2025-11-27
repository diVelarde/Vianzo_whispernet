import React, { useState, useEffect, useCallback, useRef } from "react";
import CommentItem from "./CommentItem";
import "../styles/CommentSection.css";

import { API_BASE_URL } from "../api.js";

const mockComments = [
  { id: "c1", username: "HappyFox", content: "This is so inspiring! Thank you for sharing 💕", likes_count: 5, created_date: new Date(Date.now() - 1800000).toISOString(), replies: [] },
  { id: "c2", username: "CalmRabbit", content: "Needed to hear this today!", likes_count: 3, created_date: new Date(Date.now() - 3600000).toISOString(), replies: [] }
];

const mockUserProfile = { user_id: "user1", display_name: "KindPanda" };

export default function CommentSection({ messageId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const fetchControllerRef = useRef(null);

  // helper to recursively add a reply to comments tree
  const addReplyToTree = (items, parentId, reply) => {
    return items.map(item => {
      if (item.id === parentId) {
        return { ...item, replies: [...(item.replies || []), reply] };
      }
      if (item.replies && item.replies.length) {
        return { ...item, replies: addReplyToTree(item.replies, parentId, reply) };
      }
      return item;
    });
  };

  // fetch user profile (best-effort)
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function loadProfile() {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" };

        // try common endpoints for "me"
        let me = null;
        try {
          const res = await fetch(`${API_BASE_URL}/me`, { headers, signal: controller.signal });
          if (res.ok) me = await res.json();
          else {
            const res2 = await fetch(`${API_BASE_URL}/users/me`, { headers, signal: controller.signal });
            if (res2.ok) me = await res2.json();
          }
        } catch (err) {
          // ignore, we'll fallback to mock
        }

        if (mounted) setUserProfile(me ?? mockUserProfile);
      } catch (err) {
        if (mounted) setUserProfile(mockUserProfile);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const fetchComments = useCallback(async () => {
    // Abort any previous fetch
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    setIsLoading(true);
    setFetchError(null);

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" };

      let url = null;
      if (messageId) {
        // common REST patterns
        url = `${API_BASE_URL}/posts/${encodeURIComponent(messageId)}/comments?limit=200`;
      } else {
        // fallback: fetch recent comments
        url = `${API_BASE_URL}/comments?limit=50`;
      }

      const res = await fetch(url, { headers, signal: controller.signal });
      let data = null;
      if (res.ok) {
        data = await res.json();
      } else {
        // try alternate common endpoint shape
        const altRes = await fetch(`${API_BASE_URL}/comments?post_id=${encodeURIComponent(messageId || "")}&limit=200`, { headers, signal: controller.signal });
        if (altRes.ok) data = await altRes.json();
      }

      if (!data) {
        // fallback to mocks
        setComments(mockComments);
        setIsLoading(false);
        return;
      }

      // normalize response shapes: array or { comments: [...] }
      let items = Array.isArray(data) ? data : (Array.isArray(data.comments) ? data.comments : []);
      items = items.map((c) => ({
        id: c.id ?? c._id ?? String(Math.random()),
        username: c.username ?? c.display_name ?? c.author_name ?? "Anonymous",
        content: c.content ?? c.body ?? "",
        likes_count: c.likes_count ?? c.likes ?? 0,
        created_date: c.created_date ?? c.created_at ?? c.timestamp ?? new Date().toISOString(),
        replies: Array.isArray(c.replies) ? c.replies : []
      }));

      // ensure replies are normalized recursively
      const normalizeReplies = (arr) =>
        arr.map((r) => ({
          id: r.id ?? r._id ?? String(Math.random()),
          username: r.username ?? r.display_name ?? r.author_name ?? "Anonymous",
          content: r.content ?? r.body ?? "",
          likes_count: r.likes_count ?? r.likes ?? 0,
          created_date: r.created_date ?? r.created_at ?? new Date().toISOString(),
          replies: Array.isArray(r.replies) ? normalizeReplies(r.replies) : []
        }));

      items = items.map(i => ({ ...i, replies: normalizeReplies(i.replies || []) }));

      setComments(items);
    } catch (err) {
      if (err.name === "AbortError") {
        // ignore abort
        return;
      }
      console.warn("Failed to fetch comments, using fallback:", err);
      setFetchError(err.message || "Failed to load comments");
      setComments(mockComments);
    } finally {
      setIsLoading(false);
      fetchControllerRef.current = null;
    }
  }, [messageId]);

  useEffect(() => {
    fetchComments();
    // cleanup on unmount
    return () => {
      if (fetchControllerRef.current) fetchControllerRef.current.abort();
    };
  }, [fetchComments]);

  const handleSubmitComment = async (content, parentCommentId = null) => {
    if (content.trim() === "" || !userProfile) return;
    setIsSubmitting(true);

    // optimistic comment / reply
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      username: userProfile.display_name || userProfile.username || "You",
      content: content.trim(),
      likes_count: 0,
      created_date: new Date().toISOString(),
      replies: []
    };

    if (parentCommentId) {
      setComments(prev => addReplyToTree(prev, parentCommentId, optimistic));
    } else {
      setComments(prev => [optimistic, ...prev]);
      setNewComment("");
    }

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" };

      const body = {
        content: content.trim()
      };
      if (messageId) body.post_id = messageId;
      if (parentCommentId) body.parent_id = parentCommentId;

      const res = await fetch(`${API_BASE_URL}/comments`, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        // try an alternate endpoint pattern
        const altRes = await fetch(`${API_BASE_URL}/posts/${encodeURIComponent(messageId)}/comments`, {
          method: "POST",
          headers,
          body: JSON.stringify(body)
        });
        if (!altRes.ok) throw new Error(`Comment submit failed (${res.status})`);
        const createdAlt = await altRes.json().catch(() => null);
        // reconcile optimistic
        const created = createdAlt ?? null;
        if (created) {
          if (parentCommentId) {
            setComments(prev => addReplyToTree(prev, parentCommentId, { ...(created), replies: created.replies ?? [] }));
          } else {
            setComments(prev => prev.map(c => c.id === tempId ? { ...(created), replies: created.replies ?? [] } : c));
          }
        }
      } else {
        const created = await res.json().catch(() => null);
        if (created) {
          if (parentCommentId) {
            // replace the optimistic reply with server reply in the tree
            setComments(prev => addReplyToTree(prev, parentCommentId, { ...(created), replies: created.replies ?? [] }));
            // remove the temporary optimistic reply we appended earlier (it will now be duplicated)
            setComments(prev => {
              const removeTemp = (items) =>
                items.map(i => {
                  if (i.id === parentCommentId) {
                    return {
                      ...i,
                      replies: (i.replies || []).filter(r => r.id !== tempId)
                    };
                  }
                  if (i.replies && i.replies.length) {
                    return { ...i, replies: removeTemp(i.replies) };
                  }
                  return i;
                });
              return removeTemp(prev);
            });
          } else {
            setComments(prev => prev.map(c => c.id === tempId ? { ...(created), replies: created.replies ?? [] } : c));
          }
        }
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
      // mark optimistic comment as unsynced so UI can show a notice if desired
      setComments(prev => prev.map(c => c.id === tempId ? { ...c, _unsynced: true } : c));
      // optionally revert optimistic change or inform the user; here we keep it but flagged
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment(newComment);
    }
  };

  return (
    <div className="comment-section">
      <div className="comment-input-wrapper">
        <div className="comment-input-avatar" />
        <div className="comment-input-container">
          <textarea
            placeholder="Add a thoughtful comment... ✨"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            className="comment-textarea"
            disabled={!userProfile || isSubmitting}
          />
          <div className="comment-input-actions">
            <button
              onClick={() => handleSubmitComment(newComment)}
              disabled={isSubmitting || !newComment.trim() || !userProfile}
              className="comment-submit-button"
            >
              {isSubmitting ? "Posting..." : "Reply ✨"}
            </button>
          </div>
        </div>
      </div>

      {fetchError && (
        <div className="comments-error">
          <p>There was a problem loading/syncing comments: {String(fetchError)}</p>
        </div>
      )}

      <div className="comments-list">
        {isLoading ? (
          <div className="comment-skeleton" />
        ) : comments.length === 0 ? (
          <p className="empty-comments">Be the first to share a positive thought! 💭</p>
        ) : (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReplySubmit={handleSubmitComment}
              userProfile={userProfile}
            />
          ))
        )}
      </div>
    </div>
  );
}