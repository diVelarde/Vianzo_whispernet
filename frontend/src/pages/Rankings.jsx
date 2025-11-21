
// import { useState, useEffect, useCallback } from "react";
// import { UserProfile, User, Message } from "@/entities/all";
// import UserRankingCard from "../components/UserRankingCard";
// import { Trophy } from "lucide-react";
// import { Skeleton } from "@/components/ui/skeleton";

// export default function Rankings() {
//   const [users, setUsers] = useState([]);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const reSyncAllStats = useCallback(async (profiles) => {
//     try {
//       const allMessages = await Message.list();
//       const updates = profiles.map(profile => {
//         const userMessages = allMessages.filter(msg => msg.user_id === profile.user_id && msg.is_approved === 'approved');
//         const totalLikes = userMessages.reduce((sum, msg) => sum + (msg.likes_count || 0), 0);
//         const messagesPosted = userMessages.length;
//         const popularityScore = (messagesPosted * 10) + (totalLikes * 2);

//         if(profile.total_likes_received !== totalLikes || profile.messages_posted !== messagesPosted || profile.popularity_score !== popularityScore) {
//           return UserProfile.update(profile.id, {
//             user_id: profile.user_id, // Add user_id to the update payload
//             total_likes_received: totalLikes,
//             messages_posted: messagesPosted,
//             popularity_score: popularityScore
//           });
//         }
//         return null;
//       }).filter(Boolean);

//       if (updates.length > 0) {
//         await Promise.all(updates);
//         // Re-fetch after updating
//         return await UserProfile.list('-popularity_score');
//       }
//       return profiles;
//     } catch (error) {
//       console.error("Error re-syncing all stats:", error);
//       return profiles;
//     }
//   }, []);


//   useEffect(() => {
//     const loadRankings = async () => {
//       setIsLoading(true);
//       try {
//         const [userProfiles, user] = await Promise.all([
//           UserProfile.list('-popularity_score'),
//           User.me().catch(() => null)
//         ]);
        
//         const syncedProfiles = await reSyncAllStats(userProfiles);

//         setUsers(syncedProfiles.sort((a,b) => (b.popularity_score || 0) - (a.popularity_score || 0)));
//         setCurrentUser(user);
//       } catch (error) {
//         console.error("Error loading rankings:", error);
//       }
//       setIsLoading(false);
//     };

//     loadRankings();
//   }, [reSyncAllStats]);

//   return (
//     <div className="p-4">
//       <div className="text-center mb-8">
//         <h1 className="text-2xl font-bold">Kindness Leaderboard</h1>
//         <p className="text-text-secondary">Celebrating our most positive contributors</p>
//       </div>

//       <div className="space-y-4">
//         {isLoading ? (
//           Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl"/>)
//         ) : users.length === 0 ? (
//           <div className="text-center py-16">
//             <Trophy className="w-12 h-12 mx-auto text-primary mb-4" />
//             <h3 className="text-xl font-semibold mb-2">No rankings yet</h3>
//             <p className="text-text-secondary">Start sharing vibes to get on the board!</p>
//           </div>
//         ) : (
//           users.map((user, index) => (
//             <UserRankingCard
//               key={user.id}
//               user={user}
//               rank={index + 1}
//               currentUser={currentUser}
//             />
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

import React from "react";

export default function Rankings() {
  return <div className="text-xl font-medium">This is the Rankings page.</div>;
}