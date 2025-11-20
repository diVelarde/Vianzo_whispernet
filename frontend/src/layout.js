import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, UserProfile } from "@/entities/all";
import { MessageSquareHeart, Search, TrendingUp, User as UserIcon, Shield, Edit } from "lucide-react";
import RightSidebar from "./components/RightSidebar";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isModerator, setIsModerator] = useState(false);
  const [isIncognitoMode, setIsIncognitoMode] = useState(localStorage.getItem('whispernet_incognito_mode') === 'true');

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await User.me();
        const profiles = await UserProfile.filter({ user_id: user.id });
        if (profiles.length > 0 && profiles[0].is_moderator) {
          setIsModerator(true);
        }
      } catch (error) {
        // User not logged in
      }
    };
    checkUser();

    const handleThemeChange = (event) => setIsIncognitoMode(event.detail.isIncognitoMode);
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  useEffect(() => {
    if (isIncognitoMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('whispernet_incognito_mode', isIncognitoMode.toString());
  }, [isIncognitoMode]);

  const navigationItems = [
    { title: "Feed", url: createPageUrl("Feed"), icon: MessageSquareHeart },
    { title: "Compose", url: createPageUrl("Compose"), icon: Edit },
    { title: "Search", url: createPageUrl("Search"), icon: Search },
    { title: "Rankings", url: createPageUrl("Rankings"), icon: TrendingUp },
    { title: "Profile", url: createPageUrl("Profile"), icon: UserIcon },
    ...(isModerator ? [{ title: "Admin", url: createPageUrl("Admin"), icon: Shield }] : []),
  ];

  return (
    <>
      <style>
        {`
          :root {
            --background: linear-gradient(to bottom, #f3e8ff, #ffffff);
            --background-solid: #f3e8ff;
            --card-background: rgba(255, 255, 255, 0.7);
            --text-primary: #1e293b;
            --text-secondary: #64748b;
            --border-color: rgba(167, 139, 250, 0.3);
            --primary: #8b5cf6;
          }
          .dark {
            --background: #000000;
            --background-solid: #000000;
            --card-background: #111111;
            --text-primary: #e5e7eb;
            --text-secondary: #9ca3af;
            --border-color: #4f46e5;
            --primary: #a78bfa;
          }
          body {
            background: var(--background);
            background-attachment: fixed;
            color: var(--text-primary);
          }
          .glass-effect {
            background: var(--card-background);
            backdrop-filter: blur(10px) saturate(150%);
            border: 1px solid var(--border-color);
          }
        `}
      </style>
      <div className="min-h-screen">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-0 md:p-4">
            
            <aside className="hidden lg:block lg:col-span-3 py-4">
              <div className="sticky top-4 space-y-4">
                <Link to={createPageUrl("Feed")} className="flex items-center gap-3 px-4 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-lg">
                    <MessageSquareHeart className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="font-bold text-xl">WhisperNet</h2>
                </Link>

                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`flex items-center gap-4 px-4 py-3 rounded-lg font-medium text-lg ${
                        location.pathname === item.url
                          ? 'text-primary'
                          : 'hover:text-primary transition-colors'
                      }`}
                    >
                      <item.icon className="w-6 h-6" />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            <main className="col-span-12 lg:col-span-6 glass-effect lg:rounded-2xl min-h-screen lg:min-h-[calc(100vh-2rem)] shadow-lg">
              {children}
            </main>

            <aside className="hidden lg:block lg:col-span-3 py-4">
              <div className="sticky top-4">
                <RightSidebar />
              </div>
            </aside>

          </div>
        </div>
        
        <div className="lg:hidden fixed bottom-0 left-0 right-0 glass-effect border-t flex justify-around">
          {navigationItems.slice(0, 5).map(item => (
             <Link key={item.title} to={item.url} className={`p-3 rounded-lg flex flex-col items-center transition-colors ${location.pathname === item.url ? 'text-primary' : 'text-text-secondary'}`}>
               <item.icon className="w-6 h-6" />
             </Link>
          ))}
        </div>
      </div>
    </>
  );
}