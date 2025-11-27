import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Zap, X } from "lucide-react";
import "../styles/Compose.css";

import { API_BASE_URL } from "../api.js";

const createPageUrl = (pageName) => `/${pageName.toLowerCase()}`;

export default function Compose() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIncognitoMode, setIsIncognitoMode] = useState(false);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const maxChars = 500;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedContent = content.trim();
    if (trimmedContent.length < 10) {
      setErrorMessage("Please enter at least 10 characters.");
      return;
    }

    setIsSubmitting(true);

    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const token = localStorage.getItem("token"); // optional auth
      const headers = token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" };

      const body = {
        content: trimmedContent,
        tags,
        mode: isIncognitoMode ? "unhinged" : "positive",
      };

      const res = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal,
      });

      if (!res.ok) {
        let serverMsg = "";
        try {
          const parsed = await res.json();
          serverMsg = parsed?.message || parsed?.error || "";
        } catch {
        }
        throw new Error(serverMsg || `Failed to submit (${res.status})`);
      }

      const created = await res.json().catch(() => null);

      navigate(createPageUrl("Feed"), { state: { justPosted: true, post: created } });
    } catch (err) {
      if (err.name === "AbortError") {
        setErrorMessage("Submission aborted.");
      } else {
        console.error("Compose submit error:", err);
        setErrorMessage(err.message || "Failed to submit post. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }

    return () => controller.abort();
  };

  return (
    <div className="compose-container">
      <div className="compose-header">
        <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
          <ArrowLeft />
        </button>
        <h1>Create Your Vibe</h1>
      </div>

      <div className="compose-form-wrapper">
        <div className="compose-card">
          <div className="compose-card-header">
            <span
              className="compose-icon"
              role="img"
              aria-label={isIncognitoMode ? "Incognito" : "Positive"}
              onClick={() => setIsIncognitoMode((s) => !s)}
              style={{ cursor: "pointer" }}
              title="Toggle incognito mode"
            >
              {isIncognitoMode ? "🔥" : "✨"}
            </span>
            <span className="compose-mode-title">
              {isIncognitoMode ? "Incognito Post" : "Positive Vibe"}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="compose-form">
            <div className="textarea-wrapper">
              <textarea
                placeholder={
                  isIncognitoMode
                    ? "What's really on your mind? Let it all out... Posts are not moderated."
                    : "Share something positive, encouraging, or inspiring... Posts are reviewed for kindness."
                }
                value={content}
                onChange={handleContentChange}
                className="compose-textarea"
                aria-label="Compose your vibe"
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
              <div className="tag-input-wrapper">
                <input
                  type="text"
                  placeholder="Add tags (optional) 🏷️"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="tag-input"
                  disabled={tags.length >= 5 || isSubmitting}
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
                    <span key={index} className="tag">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="remove-tag"
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

            {errorMessage && <div className="form-error" role="alert">{errorMessage}</div>}

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