import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Shield, RefreshCw } from "lucide-react";
import "../styles/Admin.css";

const createPageUrl = (pageName) => `/${pageName.toLowerCase()}`;

const mockPendingMessages = [
  { id: "1", username: "NewUser1", content: "This is my first post, hoping to spread some positivity!", whisper_id: "Whispering #0010" },
  { id: "2", username: "NewUser2", content: "Just wanted to say everyone here is amazing! Keep being awesome.", whisper_id: "Whispering #0011" },
  { id: "3", username: "NewUser3", content: "Remember to take breaks and stay hydrated! 💧", whisper_id: "Whispering #0012" },
];

function PendingMessageCard({ message, onApprove, onReject, isProcessing }) {
  return (
    <div className="pending-card">
      <div className="pending-card-header">
        <p className="username">{message.username}</p>
        <span className="whisper-id">{message.whisper_id}</span>
      </div>
      <p className="content">{message.content}</p>
      <div className="pending-card-actions">
        <button onClick={() => onReject(message.id)} disabled={isProcessing} className="reject-button">
          <X /> Reject
        </button>
        <button onClick={() => onApprove(message.id)} disabled={isProcessing} className="approve-button">
          <Check /> Approve
        </button>
      </div>
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const [pendingMessages, setPendingMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null);
  const [isModerator, setIsModerator] = useState(true);

  useEffect(() => {
    if (!isModerator) {
      navigate(createPageUrl("Feed"));
      return;
    }
    fetchPendingMessages();
  }, [navigate, isModerator]);

  const fetchPendingMessages = () => {
    setIsLoading(true);
    setTimeout(() => {
      setPendingMessages(mockPendingMessages);
      setIsLoading(false);
    }, 1000);
  };

  const handleDecision = (messageId, decision) => {
    setIsProcessing(messageId);
    setTimeout(() => {
      setPendingMessages(prev => prev.filter(m => m.id !== messageId));
      setIsProcessing(null);
    }, 500);
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-title">
          <Shield />
          <h1>Admin Moderation</h1>
        </div>
        <button onClick={fetchPendingMessages} disabled={isLoading} className="refresh-button">
          <RefreshCw className={isLoading ? 'spinning' : ''} />
        </button>
      </div>

      {isLoading ? (
        <div className="skeleton-container">
          {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : pendingMessages.length === 0 ? (
        <div className="empty-state">
          <Check className="success-icon" />
          <h3>All caught up!</h3>
          <p>There are no pending messages to review.</p>
        </div>
      ) : (
        <div className="pending-list">
          <p className="pending-count">{pendingMessages.length} messages waiting for review.</p>
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