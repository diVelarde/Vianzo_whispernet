import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Flag, Share2, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CommentSection from "./CommentSection";

export default function MessageCard({ message, onLike, onReport }) {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(message.id, !isLiked);
  };

  const isUnhinged = message.mode === 'unhinged';
  const username = message.username || 'Anonymous';

  return (
    <Card className="glass-effect border-purple-300/30 hover:fun-shadow transition-all duration-300 rounded-3xl mb-4">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-white ${
            isUnhinged 
              ? 'bg-gradient-to-r from-red-500 via-pink-500 to-orange-500' 
              : 'bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600'
          }`}>
            <span className="text-lg">
              {isUnhinged ? '🔥' : username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <p className="font-bold text-lg" style={{color: 'var(--text-primary)'}}>{username}</p>
              <Badge 
                variant="outline" 
                className={`text-xs rounded-full ${
                  isUnhinged 
                    ? 'border-red-400/50 text-red-600 bg-red-50/50' 
                    : 'border-purple-400/50 text-purple-600 bg-purple-50/50'
                }`}
              >
                {message.whisper_id}
              </Badge>
              <span className="text-xs" style={{color: 'var(--text-secondary)'}}>•</span>
              <span className="text-xs" style={{color: 'var(--text-secondary)'}}>
                {formatDistanceToNow(new Date(message.created_date), { addSuffix: true })}
              </span>
              {isUnhinged && (
                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Unhinged
                </Badge>
              )}
            </div>

            <p className="leading-relaxed text-lg mb-4 whitespace-pre-wrap" style={{color: 'var(--text-primary)'}}>
              {message.content}
            </p>

            {message.tags && message.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {message.tags.map((tag, index) => (
                  <Badge key={index} className="bg-purple-500/20 text-purple-700 hover:bg-purple-500/30 rounded-full transition-colors">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-purple-300/20">
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-2 hover:bg-blue-500/10 hover:text-blue-600 rounded-full px-4 py-2 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">{message.comments_count || 0}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center gap-2 hover:bg-red-500/10 hover:text-red-600 rounded-full px-4 py-2 transition-all ${
                    isLiked ? 'text-red-500' : ''
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{message.likes_count || 0}</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full hover:bg-green-500/10 hover:text-green-600 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReport(message.id)}
                  className="rounded-full hover:bg-orange-500/10 hover:text-orange-600 transition-all"
                >
                  <Flag className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {showComments && (
              <div className="mt-4 pt-4 border-t border-purple-300/20">
                <CommentSection messageId={message.id} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}