import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageSquareHeart, Search, TrendingUp, User, Shield, Edit, LogOut, Moon } from "lucide-react";
import RightSidebar from "./RightSideBar.jsx";
import "../styles/Layout.css";

import { API_BASE_URL } from "../api.js";

const createPageUrl = (pageName) => `/${pageName.toLowerCase()}`;

export default function Layout({ children }) {
  const location = useLocation();
  const [isModerator, setIsModerator] = useState(false);
  const [isIncognitoMode, setIsIncognitoMode] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("incognitoMode")) || false;
    } catch {
      return false;
    }
  });
  const [user, setUser] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Fetch current user / permissions (best-effort)
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function loadMe() {
      setFetchError(null);
      try {
        const token = localStorage.getItem("token");
        const headers = token
          ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          : { "Content-Type": "application/json" };

        // Try common endpoints for authenticated user
        let me = null;
        try {
          const res = await fetch(`${API_BASE_URL}/me`, { headers, signal: controller.signal });
          if (res.ok) me = await res.json();
          else {
            const res2 = await fetch(`${API_BASE_URL}/users/me`, { headers, signal: controller.signal });
            if (res2.ok) me = await res2.json();
          }
        } catch (err) {
          // ignore: backend may not expose /me
        }

        if (!me) {
          // try a profile endpoint if /me isn't available
          try {
            const p = await fetch(`${API_BASE_URL}/profile`, { headers, signal: controller.signal });
            if (p.ok) me = await p.json();
          } catch {}
        }

        if (mounted) {
          if (me) {
            setUser(me);
            // determine moderator status from common fields
            const mod =
              Boolean(me.is_moderator) ||
              Boolean(me.isModerator) ||
              (Array.isArray(me.roles) && me.roles.includes("moderator")) ||
              (Array.isArray(me.permissions) && me.permissions.includes("moderate_posts"));

            setIsModerator(Boolean(mod));
          } else {
            // If unauthenticated or no API, try to infer from localStorage (fallback)
            const fallback = localStorage.getItem("isModerator");
            setIsModerator(fallback === "true");
          }
        }
      } catch (err) {
        console.warn("Failed to load current user for layout:", err);
        if (mounted) {
          setFetchError(err.message || "Failed to load user");
          const fallback = localStorage.getItem("isModerator");
          setIsModerator(fallback === "true");
        }
      }
    }

    loadMe();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("incognitoMode", JSON.stringify(isIncognitoMode));
    } catch {
      // ignore storage errors
    }
  }, [isIncognitoMode]);

  const navigationItems = useMemo(() => {
    const base = [
      { title: "Feed", url: createPageUrl("Feed"), icon: MessageSquareHeart },
      { title: "Compose", url: createPageUrl("Compose"), icon: Edit },
      { title: "Search", url: createPageUrl("Search"), icon: Search },
      { title: "Rankings", url: createPageUrl("Rankings"), icon: TrendingUp },
      { title: "Profile", url: createPageUrl("Profile"), icon: User },
    ];
    if (isModerator) base.push({ title: "Admin", url: createPageUrl("Admin"), icon: Shield });
    return base;
  }, [isModerator]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" };
      // Best-effort logout on server
      await fetch(`${API_BASE_URL}/logout`, { method: "POST", headers }).catch(() => {});
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      try { localStorage.removeItem("token"); } catch {}
      window.location.reload();
    }
  };

  const toggleIncognito = () => setIsIncognitoMode((s) => !s);

  // helper to mark active nav item (supports partial matches)
  const isActive = (url) => {
    if (!url) return false;
    return location.pathname === url || location.pathname.startsWith(url + "/");
  };

  return (
    <div className={`app-layout ${isIncognitoMode ? "dark" : ""}`}>
      <div className="layout-container">
        <div className="layout-grid">
          <aside className="left-sidebar" aria-label="Main navigation">
            <div className="sidebar-content">
              <Link to={createPageUrl("Feed")} className="logo-link">
                <div className="logo-icon">
                  <MessageSquareHeart />
                </div>
                <h2 className="logo-text">WhisperNet</h2>
              </Link>

              <nav className="nav-menu" role="navigation" aria-label="Primary">
                {navigationItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`nav-item ${isActive(item.url) ? "active" : ""}`}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </nav>

              <div className="sidebar-footer">
                <button className={`incognito-toggle ${isIncognitoMode ? "active" : ""}`} onClick={toggleIncognito} aria-pressed={isIncognitoMode} title="Toggle incognito mode">
                  <Moon /> {isIncognitoMode ? "Incognito" : "Normal"}
                </button>

                <button className="logout-button" onClick={handleLogout} title="Log out">
                  <LogOut /> Logout
                </button>
              </div>

              {fetchError && (
                <div className="sidebar-error" role="status">
                  <small>Could not load user data ({String(fetchError)}). Using cached settings.</small>
                </div>
              )}
            </div>
          </aside>

          <main className="main-content" role="main">
            {children}
          </main>

          <aside className="right-sidebar-container" aria-label="Sidebar">
            <RightSidebar isIncognitoMode={isIncognitoMode} user={user} />
          </aside>
        </div>
      </div>

      <div className="mobile-nav" role="navigation" aria-label="Mobile">
        {navigationItems.slice(0, 5).map((item) => (
          <Link
            key={item.title}
            to={item.url}
            className={`mobile-nav-item ${isActive(item.url) ? "active" : ""}`}
            title={item.title}
          >
            <item.icon />
          </Link>
        ))}
      </div>
    </div>
  );
}