import React from 'react';

export default function Trending({ posts }) {
  if (posts.length === 0) {
    return (
      <div className="trending-section">
        <h2 className="trending-title">Top Whispers</h2>
        <div className="trending-empty">
          <p>No whispers to rank yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  const topPosts = [...posts].sort((a,b) => b.likes - a.likes).slice(0,5);

  return (
    <div className="trending-section">
      <h2 className="trending-title">Top Whispers</h2>
      <div id="trending-list">
        {topPosts.map((post,index) => (
          <div key={post.id} className="trending-item">
            <div className="trending-topic">
              <span className="trending-rank">#{index+1}</span>
              {post.username || 'Anonymous'}
            </div>
            <div className="trending-posts">{post.likes || 0} likes</div>
          </div>
        ))}
      </div>
    </div>
  );
}
