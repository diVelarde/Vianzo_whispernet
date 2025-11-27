import React, { useState } from 'react';

export default function Compose({ onPost }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() === '') return;
    onPost(text.trim());
    setText('');
  };

  return (
    <section className="compose-section">
      <div className="compose-box">
        <div className="avatar">👤</div>
        <form className="compose-form" onSubmit={handleSubmit}>
          <textarea
            className="compose-textarea"
            placeholder="What's on your mind anonymously?"
            maxLength={280}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="compose-actions">
            <button type="submit" className="post-button" disabled={text.trim() === ''}>
              Post
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
