import React, { useMemo } from "react";
import { Trophy, Heart, MessageSquare, Award } from "lucide-react";
import "../styles/UserRankingCard.css";

const badgeIcons = { bronze: "🥉", silver: "🥈", gold: "🥇", platinum: "💎" };

export default function UserRankingCard({ user = {}, rank = 0, currentUser = null, onClick }) {
  // normalize common shapes so component is resilient to different backend responses
  const normalized = useMemo(() => {
    const popularity_score = Number(
      user.popularity_score ?? user.popularity ?? user.score ?? 0
    );

    return {
      id: user.id ?? user.user_id ?? String(Math.random()),
      user_id: user.user_id ?? user.id ?? user.userId,
      display_name: user.display_name ?? user.name ?? `User ${String(user.id ?? user.user_id ?? "").slice(-4) || ""}`,
      messages_posted: user.messages_posted ?? user.messagesCount ?? user.messages ?? 0,
      total_likes_received: user.total_likes_received ?? user.likes ?? 0,
      popularity_score,
      kindness_badge: user.kindness_badge ?? deriveBadge(popularity_score),
    };
  }, [user]);

  const isCurrentUser = currentUser && (normalized.user_id === currentUser.id || normalized.id === currentUser.id);

  function deriveBadge(score) {
    const s = Number(score || 0);
    if (s >= 500) return "platinum";
    if (s >= 200) return "gold";
    if (s >= 50) return "silver";
    if (s >= 10) return "bronze";
    return null;
  }

  const handleKeyPress = (e) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(normalized);
    }
  };

  const handleClick = () => {
    if (typeof onClick === "function") onClick(normalized);
  };

  return (
    <div
      className={`ranking-card ${isCurrentUser ? "current-user" : ""}`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick ? handleClick : undefined}
      onKeyPress={onClick ? handleKeyPress : undefined}
      aria-pressed={isCurrentUser ? true : undefined}
    >
      <div className="ranking-card-content">
        <div className="ranking-left">
          <div className={`rank-badge ${rank <= 3 ? "top-three" : ""}`} aria-hidden>
            {rank <= 3 ? <Trophy /> : `#${rank}`}
          </div>
          <div className="user-info">
            <div className="user-name-row">
              <h3 className="user-name">{normalized.display_name || `User #${String(normalized.id).slice(-4)}`}</h3>
              {isCurrentUser && <span className="you-badge" aria-label="You">You</span>}
            </div>
            <div className="user-stats">
              <span className="stat-item" title={`${normalized.messages_posted} messages`}>
                <MessageSquare /> <span className="stat-number">{normalized.messages_posted}</span>
              </span>
              <span className="stat-item" title={`${normalized.total_likes_received} likes`}>
                <Heart /> <span className="stat-number">{normalized.total_likes_received}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="ranking-right">
          <div className="popularity-score" aria-label={`Vibe score ${normalized.popularity_score}`}>
            {normalized.popularity_score}
          </div>

          {normalized.kindness_badge && (
            <span className={`kindness-badge ${normalized.kindness_badge}`} aria-hidden>
              <Award /> {badgeIcons[normalized.kindness_badge]} {normalized.kindness_badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}