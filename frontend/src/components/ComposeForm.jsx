import React, { useState, useEffect } from "react";
import { Send, Zap, X } from "lucide-react";
import "../styles/ComposeForm.css";

import { API_BASE_URL } from "../api.js";

export default function ComposeForm({
  onSubmit,           // optional: parent-provided submit handler (async or sync)
  onSuccess,          // optional: callback invoked with created post on success
  isSubmitting: isSubmittingProp, // optional controlled submitting state
  isIncognitoMode = false,
}) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const maxChars = 500;

  const isSubmitting = typeof isSubmittingProp === "boolean" ? isSubmittingProp : internalSubmitting;

  useEffect(() => {
    // clear error when user types
    if (errorMessage && content.length > 0) setErrorMessage("");
  }, [content, errorMessage]);

  const handleContentChange = (e) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setContent(text);
      setCharCount(text.length);
    }
  };

  const addTag = () => {
    const trimmed = currentTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags((prev) => [...prev, trimmed]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  const submitToBackend = async (payload) => {
    const token = localStorage.getItem("token");
    const headers = token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };

    const res = await fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let serverMsg = "";
      try {
        const parsed = await res.json();
        serverMsg = parsed?.message || parsed?.error || "";
      } catch {}
      throw new Error(serverMsg || `Failed to submit (${res.status})`);
    }

    // try to parse created post
    const created = await res.json().catch(() => null);
    return created;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedContent = content.trim();
    if (trimmedContent.length < 10) {
      setErrorMessage("Please enter at least 10 characters.");
      return;
    }

    const payload = {
      content: trimmedContent,
      tags,
      mode: isIncognitoMode ? "unhinged" : "positive",
    };

    // Use controlled onSubmit if provided, otherwise POST to backend directly
    const performSubmit = async () => {
      if (typeof onSubmit === "function") {
        // parent handler may handle network; support sync or async
        return await onSubmit(payload);
      } else {
        // do the network call here
        return await submitToBackend(payload);
      }
    };

    if (isSubmitting) return;
    if (typeof isSubmittingProp !== "boolean") setInternalSubmitting(true);

    try {
      const created = await performSubmit();
      // reset local form on success (only if parent didn't manage form state)
      setContent("");
      setCharCount(0);
      setTags([]);
      setCurrentTag("");
      if (typeof onSuccess === "function") {
        try {
          onSuccess(created || null);
        } catch (err) {
          // swallow onSuccess errors
          console.warn("onSuccess callback threw:", err);
        }
      }
    } catch (err) {
      console.error("ComposeForm submit error:", err);
      setErrorMessage(err.message || "Failed to submit. Please try again.");
    } finally {
      if (typeof isSubmittingProp !== "boolean") setInternalSubmitting(false);
    }
  };

  return (
    <div className="compose-form-container">
      <div className="compose-card" role="region" aria-label="Compose form">
        <div className="compose-card-header">
          <div className="compose-title">
            <span className="compose-icon" aria-hidden>
              {isIncognitoMode ? "🔥" : "✨"}
            </span>
            <span className="compose-mode-text">
              {isIncognitoMode ? "Incognito Post" : "Positive Vibe"}
            </span>
          </div>
        </div>

        <div className="compose-card-body">
          <form onSubmit={handleSubmit} className="compose-form">
            <div className="textarea-section">
              <textarea
                placeholder={
                  isIncognitoMode
                    ? "What's really on your mind? Let it all out... Posts are not moderated."
                    : "Share something positive, encouraging, or inspiring... Posts are reviewed for kindness."
                }
                value={content}
                onChange={handleContentChange}
                className="compose-textarea"
                aria-label="Compose your post"
                disabled={isSubmitting}
              />
              <div className="textarea-footer">
                <span className="helper-text">
                  {isIncognitoMode ? "Express yourself freely (but respectfully)" : "Be kind and supportive!"}
                </span>
                <span className={`char-count ${charCount > maxChars * 0.8 ? "warning" : ""}`}>
                  {charCount}/{maxChars}
                </span>
              </div>
            </div>

            <div className="tags-section">
              <div className="tag-input-row">
                <input
                  type="text"
                  placeholder="Add tags (optional) 🏷️"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="tag-input"
                  disabled={tags.length >= 5 || isSubmitting}
                  aria-label="New tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!currentTag.trim() || tags.length >= 5 || isSubmitting}
                  className="add-tag-button"
                >
                  Add
                </button>
              </div>

              {tags.length > 0 && (
                <div className="tags-list">
                  {tags.map((tag, index) => (
                    <span key={index} className="tag-badge">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="remove-tag-button"
                        aria-label={`Remove tag ${tag}`}
                        disabled={isSubmitting}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="form-error" role="alert" style={{ marginBottom: 8 }}>
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={content.trim().length < 10 || isSubmitting}
              className={`submit-button ${isIncognitoMode ? "unhinged" : "positive"}`}
              aria-disabled={content.trim().length < 10 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" />
                  {isIncognitoMode ? "Unleashing..." : "Spreading vibes..."}
                </>
              ) : (
                <>
                  {isIncognitoMode ? <Zap /> : <Send />}
                  {isIncognitoMode ? "Unleash Thoughts" : "Share the Love"}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}