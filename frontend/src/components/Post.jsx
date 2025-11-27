import React from 'react';

export default function Post({ post, onLike }) {
  return (
    <div className="post">
      <div className="post-header">
        <div className="post-avatar">👤</div>
        <div className="post-info">
          <span className="post-username">{post.username || "Anonymous"}</span>
          <span className="post-time">· {post.time || "now"}</span>
        </div>
      </div>
      <div className="post-content">{post.content}</div>
      <div className="post-actions">
        <button className="action-button" onClick={() => alert('Replies not implemented')}>💬 {post.replies || 0}</button>
        <button
          className={`action-button like-btn ${post.liked ? 'liked' : ''}`}
          onClick={() => onLike(post.id)}
        >
          {post.liked ? '❤️' : '🤍'} {post.likes || 0}
        </button>
        <button className="action-button share-btn" onClick={() => alert('Share not implemented')}>📤</button>
      </div>
    </div>
  );
}
