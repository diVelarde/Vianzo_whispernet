
import { useState, useEffect, useCallback, useMemo } from "react";
import { Message, UserProfile } from "@/entities/all";
import MessageCard from "../components/MessageCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp } from "lucide-react";

export default function Feed() {
  const [messages, setMessages] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("-created_date");
  const [isIncognitoMode, setIsIncognitoMode] = useState(localStorage.getItem('whispernet_incognito_mode') === 'true');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleThemeChange = (event) => {
    setIsIncognitoMode(event.detail.isIncognitoMode);
  };
  
  useEffect(() => {
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const modeFilter = isIncognitoMode ? undefined : "positive"; // Unhinged posts appear in incognito mode
      const approvedMessages = await Message.filter({ is_approved: "approved", mode: modeFilter }, filter, 50);
      
      const userIds = [...new Set(approvedMessages.map(m => m.user_id))];
      if (userIds.length > 0) {
        const userProfiles = await UserProfile.filter({ user_id: { $in: userIds } });
        const profilesMap = userProfiles.reduce((acc, profile) => {
          acc[profile.user_id] = profile;
          return acc;
        }, {});
        setProfiles(profilesMap);
      }
      setMessages(approvedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
    setIsLoading(false);
  }, [filter, isIncognitoMode]);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const messagesWithProfiles = useMemo(() => {
    return messages.map(msg => ({
      ...msg,
      // Replace the random username with the one from the profile
      username: profiles[msg.user_id]?.display_name || msg.username,
    }));
  }, [messages, profiles]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLike = async (messageId, isLiked) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        const newLikesCount = isLiked ? (message.likes_count || 0) + 1 : Math.max(0, (message.likes_count || 0) - 1);
        await Message.update(messageId, { likes_count: newLikesCount });
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, likes_count: newLikesCount } : m));
      }
    } catch (error) { 
      console.error("Error updating likes:", error); 
    }
  };

  const handleReport = async (messageId) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        await Message.update(messageId, { reported_count: (message.reported_count || 0) + 1 });
        alert("Thank you for your feedback. The post has been reported for review.");
      }
    } catch (error) { 
      console.error("Error reporting message:", error); 
    }
  };

  return (
    <div className="h-full relative pb-16 lg:pb-0">
      <div className="sticky top-0 glass-effect p-4 lg:rounded-t-2xl border-b border-border-color z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            {isIncognitoMode ? "🕶️ Incognito Feed" : "✨ Vibe Feed"}
          </h1>
          <Link to={createPageUrl("Compose")}>
            <Button className="bg-gradient-to-r from-pink-500 to-sky-500 dark:from-teal-500 dark:to-pink-500 text-white rounded-full px-4 fun-shadow">
              Post Vibe
            </Button>
          </Link>
        </div>
        <div className="flex mt-2">
           <Button variant="ghost" className={`flex-1 font-bold py-2 ${filter === '-created_date' ? 'border-b-2 border-primary text-primary' : ''} rounded-none`} onClick={() => setFilter('-created_date')}>
            Fresh
          </Button>
          <Button variant="ghost" className={`flex-1 font-bold py-2 ${filter === '-likes_count' ? 'border-b-2 border-primary text-primary' : ''} rounded-none`} onClick={() => setFilter('-likes_count')}>
            Popular
          </Button>
        </div>
      </div>
      
      <div className="p-4 pb-20 lg:pb-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-3xl" />)}
          </div>
        ) : messagesWithProfiles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">{isIncognitoMode ? "🕶️" : "🤫"}</div>
            <h3 className="text-xl font-semibold mb-2">The feed is empty...</h3>
            <p className="mb-6 text-text-secondary">Be the first to share a vibe!</p>
          </div>
        ) : (
          messagesWithProfiles.map((message) => (
            <MessageCard key={message.id} message={message} onLike={handleLike} onReport={handleReport}/>
          ))
        )}
      </div>

       {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-20 right-8 lg:bottom-8 z-20 h-12 w-12 rounded-full fun-shadow bg-gradient-to-br from-pink-500 to-sky-500 dark:from-teal-500 dark:to-pink-500 text-white"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
