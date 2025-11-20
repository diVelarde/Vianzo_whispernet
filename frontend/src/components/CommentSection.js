import { useState, useEffect, useCallback } from "react";
import { Comment, Message, User, UserProfile } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import CommentItem from "./CommentItem";

export default function CommentSection({ messageId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = await User.me();
        const profiles = await UserProfile.filter({ user_id: user.id });
        if (profiles.length > 0) {
          setUserProfile(profiles[0]);
        }
      } catch (e) { /* Not logged in */ }
    };
    fetchUserProfile();
  }, []);


  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const allComments = await Comment.filter({ message_id: messageId, is_approved: true }, '-created_date');
      const topLevelComments = allComments.filter(c => !c.parent_comment_id);

      const userIds = [...new Set(allComments.map(c => c.user_id).filter(Boolean))];
      let profilesMap = {};
      if (userIds.length > 0) {
        const userProfiles = await UserProfile.filter({ user_id: { $in: userIds } });
        profilesMap = userProfiles.reduce((acc, profile) => {
          acc[profile.user_id] = profile;
          return acc;
        }, {});
      }
      
      const commentsWithReplies = topLevelComments.map(comment => {
        const replies = allComments
          .filter(reply => reply.parent_comment_id === comment.id)
          .map(reply => ({ ...reply, username: profilesMap[reply.user_id]?.display_name || reply.username }));
        return { ...comment, username: profilesMap[comment.user_id]?.display_name || comment.username, replies };
      });
      setComments(commentsWithReplies);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
    setIsLoading(false);
  }, [messageId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async (content, parentCommentId = null) => {
    if (content.trim() === "" || !userProfile) return;
    setIsSubmitting(true);
    
    try {
      await Comment.create({
        message_id: messageId,
        content: content.trim(),
        username: userProfile.display_name, // Use established display name
        user_id: userProfile.user_id,
        is_approved: true,
        likes_count: 0,
        parent_comment_id: parentCommentId
      });

      if (!parentCommentId) {
        const message = await Message.get(messageId);
        await Message.update(messageId, { comments_count: (message.comments_count || 0) + 1 });
        setNewComment("");
      }

      fetchComments(); // Refresh all comments
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
    setIsSubmitting(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment(newComment);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-sky-400 rounded-full flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Add a thoughtful comment... ✨"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            className="glass-effect rounded-xl resize-none"
            rows={2}
            disabled={!userProfile}
          />
          <div className="flex justify-end">
            <Button 
              onClick={() => handleSubmitComment(newComment)} 
              disabled={isSubmitting || !newComment.trim() || !userProfile}
              className="bg-gradient-to-r from-pink-500 to-sky-500 text-white rounded-full px-6"
            >
              {isSubmitting ? "Posting..." : "Reply ✨"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-20 w-full rounded-xl" />
        ) : comments.length === 0 ? (
          <p className="text-sm text-center py-4 text-text-secondary">
            Be the first to share a positive thought! 💭
          </p>
        ) : (
          comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} onReplySubmit={handleSubmitComment} userProfile={userProfile} />
          ))
        )}
      </div>
    </div>
  );
}