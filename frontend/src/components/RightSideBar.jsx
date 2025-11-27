import React from 'react';

const navItems = [
  { label: 'Feed', icon: '🏠', section: 'feed' },
  { label: 'Search', icon: '🔍', section: 'search' },
  { label: 'Ranking', icon: '📊', section: 'ranking' },
  { label: 'Profile', icon: '👤', section: 'profile' },
];

export default function Sidebar({ activeSection, setActiveSection }) {
  const handleLogout = () => {
    console.log('Logging out...');
    window.location.href = 'base.html';
  };

  return (
    <nav className="sidebar">
      <div className="logo-section">
        <div className="logo">💭</div>
        <h1 className="site-title">WhisperNet</h1>
      </div>
      <ul className="nav-menu">
        {navItems.map(item => (
          <li key={item.section} className="nav-item">
            <a
              href="#"
              className={`nav-link ${activeSection === item.section ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveSection(item.section); }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </a>
          </li>
        ))}
        <li className="nav-item" style={{ marginTop: '24px' }}>
          <a href="#" className="nav-link" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
