import React, { useState, useEffect } from "react";
import { Heart, MessageSquare } from "lucide-react";
import "../styles/CommentItem.css";

import { API_BASE_URL } from "../api.js";

const formatTimeAgo = (dateString) => {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

function ReplyForm({ parentCommentId, onReplySubmit, userProfile, onCancel }) {
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    try {
      await onReplySubmit(replyContent.trim(), parentCommentId);
      setReplyContent("");
      onCancel(); 
    } catch (err) {
      console.error("Reply submission failed", err);
      alert("Failed to submit reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reply-form">
      <textarea
        placeholder="Write a reply..."
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        className="reply-textarea"
        disabled={!userProfile || isSubmitting}
      />
      <div className="reply-actions">
        <button onClick={onCancel} className="cancel-button" disabled={isSubmitting}>
          Cancel
        </button>
        <button onClick={handleReply} disabled={isSubmitting || !userProfile} className="reply-submit-button">
          {isSubmitting ? "Replying..." : "Reply"}
        </button>
      </div>
    </div>
  );
}

export default function CommentItem({ comment, onReplySubmit, userProfile }) {
  const [isLiked, setIsLiked] = useState(!!comment._liked);
  const [likes, setLikes] = useState(comment.likes_count || 0);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    setIsLiked(!!comment._liked);
    setLikes(comment.likes_count || 0);
    setReplies(comment.replies || []);
  }, [comment]);

  const handleLike = async () => {
    if (isLiking) return;

    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikes((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    setIsLiking(true);

    try {
      const token = localStorage.getItem("token");
      const headers = token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" };

      const res = await fetch(`${API_BASE_URL}/comments/${comment.id}/like`, {
        method: "POST",
        headers,
        body: JSON.stringify({ like: nextLiked }),
      });

      if (!res.ok) {
        throw new Error(`Like request failed (${res.status})`);
      }

      const body = await res.json().catch(() => null);
      if (body && typeof body.likes_count === "number") {
        setLikes(body.likes_count);
      }
    } catch (err) {
      console.error("Failed to sync like with backend, reverting optimistic update.", err);
      setIsLiked((prev) => !prev);
      setLikes((prev) => (nextLiked ? Math.max(0, prev - 1) : prev + 1));

    } finally {
      setIsLiking(false);
    }
  };

  const internalReplySubmit = async (replyContent, parentCommentId) => {
    const tempId = `temp-${Date.now()}`;
    const newReply = {
      id: tempId,
      username: userProfile?.display_name || userProfile?.username || "You",
      content: replyContent,
      likes_count: 0,
      comments_count: 0,
      created_date: new Date().toISOString(),
      replies: [],
    };

    setReplies((prev) => [...prev, newReply]);

    try {
      const token = localStorage.getItem("token");
      const headers = token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" };

      const body = {
        content: replyContent,
        parent_id: parentCommentId,
      };

      if (comment.post_id) body.post_id = comment.post_id;
      if (comment.thread_id) body.thread_id = comment.thread_id;

      const res = await fetch(`${API_BASE_URL}/comments`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Reply request failed (${res.status})`);
      }

      const created = await res.json().catch(() => null);
      setReplies((prev) =>
        prev.map((r) => (r.id === tempId ? { ...(created || {}), id: (created && created.id) || tempId } : r))
      );
    } catch (err) {
      console.error("Failed to post reply to backend; keeping optimistic reply locally.", err);

      setReplies((prev) => prev.map((r) => (r.id === tempId ? { ...r, _unsynced: true } : r)));
      throw err;
    }
  };

  const handleReplySubmit = async (replyContent, parentCommentId) => {
    if (typeof onReplySubmit === "function") {
      try {
        const created = await onReplySubmit(replyContent, parentCommentId);
        if (created && created.id) {
          setReplies((prev) => [...prev, created]);
        } else {
          await internalReplySubmit(replyContent, parentCommentId);
        }
      } catch (err) {
        console.warn("Parent onReplySubmit failed, falling back to internal reply submission.", err);
        await internalReplySubmit(replyContent, parentCommentId);
      }
    } else {
      await internalReplySubmit(replyContent, parentCommentId);
    }
  };

  return (
    <div className="comment-item">
      <div className="comment-avatar">
        <span>{comment.username?.charAt(0) || "?"}</span>
      </div>
      <div className="comment-content-wrapper">
        <div className="comment-bubble">
          <div className="comment-header">
            <p className="comment-username">{comment.username || "Anonymous"}</p>
            <span className="comment-separator">•</span>
            <span className="comment-timestamp">{formatTimeAgo(comment.created_date)}</span>
          </div>
          <p className="comment-text">{comment.content}</p>
        </div>

        <div className="comment-actions">
          <button
            onClick={handleLike}
            className={`comment-action-button ${isLiked ? "liked" : ""}`}
            disabled={isLiking}
            aria-pressed={isLiked}
          >
            <Heart className={isLiked ? "filled" : ""} />
            <span>{likes}</span>
          </button>

          <button
            onClick={() => setShowReplyForm((s) => !s)}
            className="comment-action-button"
            disabled={!userProfile}
            aria-expanded={showReplyForm}
          >
            <MessageSquare />
            <span>Reply</span>
          </button>
        </div>

        {showReplyForm && (
          <ReplyForm
            parentCommentId={comment.id}
            onReplySubmit={handleReplySubmit}
            userProfile={userProfile}
            onCancel={() => setShowReplyForm(false)}
          />
        )}

        {replies && replies.length > 0 && (
          <div className="replies-list">
            {replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} onReplySubmit={onReplySubmit} userProfile={userProfile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}