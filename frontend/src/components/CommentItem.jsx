import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

const ReplyForm = ({ parentCommentId, onReplySubmit, userProfile, onCancel }) => {
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    await onReplySubmit(replyContent, parentCommentId);
    setIsSubmitting(false);
    setReplyContent("");
  };
  
  return (
    <div className="pl-6 pt-2 space-y-2">
      <Textarea
        placeholder="Write a reply..."
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        className="glass-effect rounded-xl text-sm"
        rows={1}
        disabled={!userProfile}
      />
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={handleReply} disabled={isSubmitting || !userProfile}>
          {isSubmitting ? "Replying..." : "Reply"}
        </Button>
      </div>
    </div>
  );
};

export default function CommentItem({ comment, onReplySubmit, userProfile }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(comment.likes_count || 0);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    // TODO: API call to update comment likes
  };

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-pink-400 dark:from-teal-400 dark:to-fuchsia-400 rounded-full flex-shrink-0 flex items-center justify-center">
        <span className="text-white font-bold text-xs">
          {comment.username?.charAt(0) || '?'}
        </span>
      </div>
      <div className="flex-1">
        <div className="glass-effect rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm">{comment.username || 'Anonymous'}</p>
            <span className="text-xs text-text-secondary">•</span>
            <span className="text-xs text-text-secondary">
              {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm leading-relaxed">{comment.content}</p>
        </div>
        <div className="flex items-center gap-2 mt-1 px-2">
          <Button variant="ghost" size="sm" onClick={handleLike} className={`text-xs gap-1 ${isLiked ? 'text-red-500' : 'text-text-secondary'}`}>
            <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowReplyForm(!showReplyForm)} className="text-xs gap-1 text-text-secondary" disabled={!userProfile}>
            <MessageSquare className="w-3 h-3" />
            <span>Reply</span>
          </Button>
        </div>
        
        {showReplyForm && <ReplyForm parentCommentId={comment.id} onReplySubmit={onReplySubmit} userProfile={userProfile} onCancel={() => setShowReplyForm(false)} />}
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="pl-6 mt-3 space-y-3 border-l-2 border-border-color">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} onReplySubmit={onReplySubmit} userProfile={userProfile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}