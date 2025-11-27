import React from 'react';

export default function Header({ activeSection }) {
  const titles = {
    feed: 'Home',
    search: 'Search',
    ranking: 'Trending',
    profile: 'Profile',
  };
  return (
    <header className="header">
      <h1>{titles[activeSection]}</h1>
    </header>
  );
}
