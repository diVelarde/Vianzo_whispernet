import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Heart, MessageSquare, Award } from "lucide-react";
import { motion } from "framer-motion";

const badgeColors = {
  bronze: "bg-amber-100 text-amber-800 border-amber-300",
  silver: "bg-gray-100 text-gray-800 border-gray-300", 
  gold: "bg-yellow-100 text-yellow-800 border-yellow-300",
  platinum: "bg-purple-100 text-purple-800 border-purple-300"
};

const badgeIcons = {
  bronze: "🥉",
  silver: "🥈", 
  gold: "🥇",
  platinum: "💎"
};

export default function UserRankingCard({ user, rank, currentUser }) {
  const isCurrentUser = currentUser && user.user_id === currentUser.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.1 }}
    >
      <Card className={`transition-all duration-300 hover:shadow-lg ${
        isCurrentUser 
          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200' 
          : 'bg-white/80 backdrop-blur-sm border-gray-200'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                rank <= 3 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {rank <= 3 ? (
                  <Trophy className="w-6 h-6" />
                ) : (
                  `#${rank}`
                )}
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">
                    {user.display_name || `Student #${user.id.slice(-4)}`}
                  </h3>
                  {isCurrentUser && (
                    <Badge variant="outline" className="text-xs bg-indigo-100 text-indigo-700">
                      You
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MessageSquare className="w-4 h-4" />
                    <span>{user.messages_posted} messages</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>{user.total_likes_received} likes</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600 mb-1">
                {user.popularity_score || 0}
              </div>
              {user.kindness_badge && (
                <Badge className={`${badgeColors[user.kindness_badge]} text-xs`}>
                  <Award className="w-3 h-3 mr-1" />
                  {badgeIcons[user.kindness_badge]} {user.kindness_badge}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}