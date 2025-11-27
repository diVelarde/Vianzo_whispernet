import React from 'react';
import Post from './Post';

export default function Feed({ posts, onLike }) {
  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">💭</div>
        <h3 className="empty-title">No whispers yet</h3>
        <p className="empty-message">Be the first to share an anonymous thought with the world.</p>
      </div>
    );
  }

  return (
    <section className="feed">
      {posts.map(post => (
        <Post key={post.id} post={post} onLike={onLike} />
      ))}
    </section>
  );
}
