import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Flag, Share2, Zap } from "lucide-react";
import "../styles/MessageCard.css";

import { API_BASE_URL } from "../api.js";
import CommentSection from "./CommentSection.jsx";

const formatTimeAgo = (dateString) => {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function MessageCard({ message, onLike, onReport }) {
  const [isLiked, setIsLiked] = useState(!!message._liked);
  const [likesCount, setLikesCount] = useState(message.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  useEffect(() => {
    // keep local state in sync if parent updates message prop
    setIsLiked(!!message._liked);
    setLikesCount(message.likes_count || 0);
  }, [message]);

  const handleLike = async () => {
    // If parent provided a handler, let it own the network call.
    // Still do an optimistic local update for snappy UI.
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((c) => (nextLiked ? (c || 0) + 1 : Math.max(0, (c || 0) - 1)));
    setIsLiking(true);

    if (typeof onLike === "function") {
      try {
        // parent handler may be sync/async
        await onLike(message.id, nextLiked);
      } catch (err) {
        // revert on error
        console.error("Parent onLike failed, reverting like:", err);
        setIsLiked((s) => !s);
        setLikesCount((c) => (nextLiked ? Math.max(0, (c || 0) - 1) : (c || 0) + 1));
      } finally {
        setIsLiking(false);
      }
      return;
    }

    // No parent handler: do best-effort backend call here
    try {
      const token = localStorage.getItem("token");
      const headers = token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" };

      const res = await fetch(`${API_BASE_URL}/posts/${encodeURIComponent(message.id)}/like`, {
        method: "POST",
        headers,
        body: JSON.stringify({ like: nextLiked }),
      });

      if (!res.ok) {
        throw new Error(`Like failed (${res.status})`);
      }

      const body = await res.json().catch(() => null);
      if (body && typeof body.likes_count === "number") {
        setLikesCount(body.likes_count);
      }
    } catch (err) {
      console.error("Like request failed, reverting optimistic update:", err);
      // revert optimistic update
      setIsLiked((s) => !s);
      setLikesCount((c) => (nextLiked ? Math.max(0, (c || 0) - 1) : (c || 0) + 1));
    } finally {
      setIsLiking(false);
    }
  };

  const handleReportClick = async () => {
    if (typeof onReport === "function") {
      try {
        setIsReporting(true);
        await onReport(message.id);
      } catch (err) {
        console.error("Parent onReport failed:", err);
        alert("Could not report the post. Please try again.");
      } finally {
        setIsReporting(false);
      }
      return;
    }

    // Best-effort local report call
    if (!confirm("Report this post for review?")) return;

    setIsReporting(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" };

      const res = await fetch(`${API_BASE_URL}/posts/${encodeURIComponent(message.id)}/report`, {
        method: "POST",
        headers,
        body: JSON.stringify({ reason: "user_report" }),
      });

      if (!res.ok) {
        throw new Error(`Report failed (${res.status})`);
      }

      alert("Thank you — the post has been reported and will be reviewed.");
    } catch (err) {
      console.error("Report request failed:", err);
      alert("There was an error reporting the post. Please try again later.");
    } finally {
      setIsReporting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${encodeURIComponent(message.id)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: message.whisper_id || "Whisper",
          text: message.content.slice(0, 140),
          url: shareUrl,
        });
      } catch (err) {
        // user cancelled or share failed — fall back to clipboard
        try {
          await navigator.clipboard.writeText(shareUrl);
          alert("Post link copied to clipboard.");
        } catch {
          console.warn("Could not copy share link.");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Post link copied to clipboard.");
      } catch {
        alert("Could not copy link. Your browser may not support clipboard API.");
      }
    }
  };

  const isUnhinged = message.mode === "unhinged";
  const username = message.username || "Anonymous";

  return (
    <div className={`message-card ${isUnhinged ? "unhinged" : ""}`}>
      <div className="message-card-content">
        <div className={`avatar ${isUnhinged ? "unhinged" : ""}`}>
          <span>{isUnhinged ? "🔥" : username.charAt(0).toUpperCase()}</span>
        </div>
        <div className="message-body">
          <div className="message-header">
            <p className="username">{username}</p>
            <span className={`whisper-id ${isUnhinged ? "unhinged" : ""}`}>{message.whisper_id}</span>
            <span className="separator">•</span>
            <span className="timestamp">{formatTimeAgo(message.created_date)}</span>
            {isUnhinged && (
              <span className="unhinged-badge" title="Unhinged post">
                <Zap /> Unhinged
              </span>
            )}
          </div>

          <p className="message-content">{message.content}</p>

          {message.tags && message.tags.length > 0 && (
            <div className="message-tags">
              {message.tags.map((tag, index) => (
                <span key={index} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="message-actions">
            <div className="actions-left">
              <button
                onClick={() => setShowComments((s) => !s)}
                className="action-button"
                aria-expanded={showComments}
                title="Toggle comments"
              >
                <MessageCircle /> <span>{message.comments_count || 0}</span>
              </button>

              <button
                onClick={handleLike}
                className={`action-button ${isLiked ? "liked" : ""}`}
                disabled={isLiking}
                aria-pressed={isLiked}
                title={isLiked ? "Unlike" : "Like"}
              >
                <Heart className={isLiked ? "filled" : ""} /> <span>{likesCount}</span>
              </button>
            </div>

            <div className="actions-right">
              <button onClick={handleShare} className="action-button" title="Share">
                <Share2 />
              </button>
              <button
                onClick={handleReportClick}
                className="action-button"
                disabled={isReporting}
                title="Report post"
              >
                <Flag />
              </button>
            </div>
          </div>

          {showComments && (
            <div className="comments-section">
              <CommentSection messageId={message.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}