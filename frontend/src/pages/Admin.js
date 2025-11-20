import { useState, useEffect } from "react";
import { Message, User, UserProfile } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Shield, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

function PendingMessageCard({ message, onApprove, onReject, isProcessing }) {
  return (
    <Card className="bg-card-background border-border-color">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
            <p className="font-bold text-text-primary">{message.username}</p>
            <Badge variant="outline">{message.whisper_id}</Badge>
        </div>
        <p className="text-text-primary mb-4">{message.content}</p>
        <div className="flex justify-end gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => onReject(message.id)}
            disabled={isProcessing}
          >
            <X className="w-4 h-4 mr-1" />
            Reject
          </Button>
          <Button 
            size="sm" 
            className="bg-green-500 hover:bg-green-600"
            onClick={() => onApprove(message.id)}
            disabled={isProcessing}
          >
            <Check className="w-4 h-4 mr-1" />
            Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const [pendingMessages, setPendingMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const currentUser = await User.me();
        const profiles = await UserProfile.filter({ created_by: currentUser.email });
        if (!profiles[0]?.is_moderator) {
          navigate(createPageUrl("Feed"));
          return;
        }
        fetchPendingMessages();
      } catch (error) {
        navigate(createPageUrl("Feed"));
      }
    };
    checkAuthAndFetch();
  }, [navigate]);

  const fetchPendingMessages = async () => {
    setIsLoading(true);
    const messages = await Message.filter({ is_approved: "pending" }, "-created_date");
    setPendingMessages(messages);
    setIsLoading(false);
  };

  const handleDecision = async (messageId, decision) => {
    setIsProcessing(messageId);
    try {
      await Message.update(messageId, { is_approved: decision });
      setPendingMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (error) {
      console.error(`Error ${decision === 'approved' ? 'approving' : 'rejecting'} message:`, error);
    }
    setIsProcessing(null);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold">Admin Moderation</h1>
        </div>
        <Button variant="outline" size="icon" onClick={fetchPendingMessages} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : pendingMessages.length === 0 ? (
        <div className="text-center py-16">
          <Check className="w-12 h-12 mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-semibold">All caught up!</h3>
          <p className="text-text-secondary">There are no pending messages to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">{pendingMessages.length} messages waiting for review.</p>
          {pendingMessages.map(msg => (
            <PendingMessageCard 
              key={msg.id} 
              message={msg} 
              onApprove={(id) => handleDecision(id, "approved")}
              onReject={(id) => handleDecision(id, "rejected")}
              isProcessing={isProcessing === msg.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}