import { useState, useEffect } from "react";
import { UserProfile } from "@/entities/all";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export default function RightSidebar() {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRankings = async () => {
      setIsLoading(true);
      try {
        const topUsers = await UserProfile.list('-popularity_score', 5);
        setRankings(topUsers);
      } catch (error) {
        console.error("Error fetching rankings", error);
      }
      setIsLoading(false);
    };
    fetchRankings();
  }, []);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if(searchTerm.trim()){
      navigate(createPageUrl(`Search?q=${encodeURIComponent(searchTerm.trim())}`));
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{color: 'var(--text-secondary)'}} />
          <Input 
            placeholder="Search the vibes 🔍" 
            className="pl-10 glass-effect border-purple-300/30 focus:border-purple-400 rounded-2xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </form>

      <Card className="glass-effect fun-shadow rounded-3xl border-purple-300/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">👑</span>
            <span>Vibe Leaders</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))
            ) : (
              rankings.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-purple-500/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' :
                      index === 2 ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white' :
                      'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                    }`}>
                      {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{color: 'var(--text-primary)'}}>
                        {user.display_name || 'Anonymous'}
                      </p>
                      <p className="text-xs" style={{color: 'var(--text-secondary)'}}>
                        {user.popularity_score || 0} vibes ✨
                      </p>
                    </div>
                  </div>
                  {user.kindness_badge && (
                    <span className="text-lg">
                      {user.kindness_badge === 'platinum' ? '💎' :
                       user.kindness_badge === 'gold' ? '🏆' :
                       user.kindness_badge === 'silver' ? '🥈' : '🥉'}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
          <Link to={createPageUrl("Rankings")}>
            <Button variant="ghost" className="w-full mt-4 rounded-2xl hover:bg-purple-500/10">
              View all vibes 🚀
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}