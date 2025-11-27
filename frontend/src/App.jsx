import React, { useState, useEffect } from 'react';
import Sidebar from './components/RightSideBar';
import Header from './components/Header';
import Compose from './components/ComposeForm';
import Feed from './components/Feed';
import Trending from './components/Trending';
import './App.css';

const BACKEND_URL = "https://whisper-net.base44.app/api/v1"; // use your backend API URL

function App() {
  const [posts, setPosts] = useState([]);
  const [activeSection, setActiveSection] = useState('feed');

  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/posts`);
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = async (content) => {
    try {
      const res = await fetch(`${BACKEND_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error('Failed to post');
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert('Failed to post whisper');
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/posts/${postId}/like`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to like');
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="main-content">
        <Header activeSection={activeSection} />
        {activeSection === 'feed' && (
          <>
            <Compose onPost={handlePost} />
            <Feed posts={posts} onLike={handleLike} />
          </>
        )}
      </main>
      <aside className="right-sidebar">
        <Trending posts={posts} />
      </aside>
    </div>
  );
}

export default App;
