
// import { useState, useEffect, useCallback } from "react";
// import { User, UserProfile, Message } from "@/entities/all";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { User as UserIcon, MessageSquare, Heart, Award, Edit, Save, X, LogOut } from "lucide-react";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Switch } from "@/components/ui/switch";
// import { Label } from "@/components/ui/label";

// const adjectives = ["Kind", "Brave", "Gentle", "Bright", "Happy", "Calm", "Sweet", "Clever", "Wise", "Cool"];
// const animals = ["Panda", "Dolphin", "Butterfly", "Owl", "Rabbit", "Fox", "Bird", "Cat", "Lion", "Tiger"];

// function generateAnonymousName() {
//   const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
//   const animal = animals[Math.floor(Math.random() * animals.length)];
//   return `${adj}${animal}`;
// }

// const badgeColors = {
//   bronze: "bg-amber-100 text-amber-800 border-amber-300",
//   silver: "bg-gray-100 text-gray-800 border-gray-300", 
//   gold: "bg-yellow-100 text-yellow-800 border-yellow-300",
//   platinum: "bg-purple-100 text-purple-800 border-purple-300"
// };

// export default function Profile() {
//   const [user, setUser] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedName, setEditedName] = useState("");
//   const [isIncognitoMode, setIsIncognitoMode] = useState(localStorage.getItem('whispernet_incognito_mode') === 'true');

//   const handleIncognitoToggle = (checked) => {
//     setIsIncognitoMode(checked);
//     localStorage.setItem('whispernet_incognito_mode', checked); // Store the state in localStorage
//     window.dispatchEvent(new CustomEvent('themeChanged', { detail: { isIncognitoMode: checked } })); // Assuming 'themeChanged' is used for this
//   };
  
//   const handleLogout = async () => {
//     await User.logout();
//     // Clear incognito mode setting on logout
//     localStorage.removeItem('whispernet_incognito_mode'); 
//     // Reload to ensure full state reset and redirect to login
//     window.location.reload(); 
//   };

//   const reSyncStats = useCallback(async (userId, currentProfile) => {
//     try {
//       if (!userId) {
//         console.warn("reSyncStats called with invalid userId.");
//         return;
//       }

//       const userMessages = await Message.filter({ user_id: userId, is_approved: "approved" });
//       const totalLikes = userMessages.reduce((sum, msg) => sum + (msg.likes_count || 0), 0);
//       const messagesPosted = userMessages.length;
      
//       const popularityScore = (messagesPosted * 10) + (totalLikes * 2);

//       if (
//         currentProfile.total_likes_received !== totalLikes ||
//         currentProfile.messages_posted !== messagesPosted ||
//         currentProfile.popularity_score !== popularityScore
//       ) {
//         const updatedProfileData = {
//           user_id: currentProfile.user_id, // Add user_id to the update payload
//           total_likes_received: totalLikes,
//           messages_posted: messagesPosted,
//           popularity_score: popularityScore
//         };
//         await UserProfile.update(currentProfile.id, updatedProfileData);
//         setProfile(prev => ({...prev, ...updatedProfileData}));
//       }
//     } catch (error) {
//       console.error("Error re-syncing stats:", error);
//     }
//   }, []);

//   useEffect(() => {
//     const loadProfile = async () => {
//       setIsLoading(true);
//       try {
//         const currentUser = await User.me();
//         setUser(currentUser);
        
//         let userProfiles = await UserProfile.filter({ user_id: currentUser.id });
//         let userProfile;
        
//         if (userProfiles.length > 0) {
//           userProfile = userProfiles[0];
//         } else {
//           userProfile = await UserProfile.create({
//             user_id: currentUser.id,
//             display_name: generateAnonymousName(),
//             messages_posted: 0,
//             total_likes_received: 0,
//             popularity_score: 0
//           });
//         }
//         setProfile(userProfile);
//         setEditedName(userProfile.display_name);

//         await reSyncStats(currentUser.id, userProfile);

//       } catch (error) {
//         console.error("Error loading profile:", error);
//         setProfile(null);
//         setUser(null);
//       }
//       setIsLoading(false);
//     };

//     loadProfile();
//   }, [reSyncStats]);

//   const handleSaveProfile = async () => {
//     if (!profile) return;
//     try {
//       await UserProfile.update(profile.id, { display_name: editedName });
//       setProfile(prev => ({ ...prev, display_name: editedName }));
//       setIsEditing(false);
//     } catch (error) {
//       console.error("Error updating profile:", error);
//     }
//   };

//   const calculateKindnessBadge = () => {
//     if (!profile) return null;
//     const score = profile.popularity_score || 0;
//     if (score >= 500) return "platinum";
//     if (score >= 200) return "gold";
//     if (score >= 50) return "silver";
//     if (score >= 10) return "bronze";
//     return null;
//   };

//   const kindnessBadge = calculateKindnessBadge();

//   return (
//     <div className="p-4">
//       <h1 className="text-xl font-bold mb-4">My Profile</h1>
//        {isLoading ? (
//           <div className="space-y-6">
//             <Skeleton className="h-32 w-full rounded-xl"/>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <Skeleton className="h-24 w-full rounded-xl"/>
//               <Skeleton className="h-24 w-full rounded-xl"/>
//               <Skeleton className="h-24 w-full rounded-xl"/>
//             </div>
//           </div>
//         ) : profile ? (
//           <div className="space-y-6">
//             <Card className="glass-effect rounded-2xl">
//               <CardContent className="p-6">
//                  <div className="flex items-center gap-4">
//                    <UserIcon className="w-12 h-12 text-primary"/>
//                    <div>
//                       {isEditing ? (
//                         <div className="flex gap-2 items-center">
//                            <Input value={editedName} onChange={e => setEditedName(e.target.value)} className="w-auto"/>
//                            <Button onClick={handleSaveProfile} size="icon"><Save className="w-4 h-4"/></Button>
//                            <Button onClick={() => { setIsEditing(false); setEditedName(profile?.display_name || ""); }} size="icon" variant="ghost"><X className="w-4 h-4"/></Button>
//                         </div>
//                       ) : (
//                         <div className="flex items-center gap-2">
//                           <h2 className="text-2xl font-bold">{profile.display_name}</h2>
//                           <Button onClick={() => setIsEditing(true)} size="icon" variant="ghost"><Edit className="w-4 h-4"/></Button>
//                         </div>
//                       )}
//                       <p className="text-gray-600 text-sm">{user?.email}</p>
//                       {kindnessBadge && (
//                         <Badge className={`${badgeColors[kindnessBadge]} mt-2`}>
//                           <Award className="w-3 h-3 mr-1" />
//                           {kindnessBadge.charAt(0).toUpperCase() + kindnessBadge.slice(1)} Contributor
//                         </Badge>
//                       )}
//                    </div>
//                  </div>
//               </CardContent>
//             </Card>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <Card className="glass-effect rounded-xl text-center">
//                 <CardContent className="p-4">
//                   <MessageSquare className="w-8 h-8 mx-auto mb-2 text-primary" />
//                   <p className="text-2xl font-bold">{profile.messages_posted}</p>
//                   <p className="text-sm text-gray-600">Messages</p>
//                 </CardContent>
//               </Card>
//               <Card className="glass-effect rounded-xl text-center">
//                 <CardContent className="p-4">
//                   <Heart className="w-8 h-8 mx-auto mb-2 text-primary" />
//                   <p className="text-2xl font-bold">{profile.total_likes_received}</p>
//                   <p className="text-sm text-gray-600">Likes</p>
//                 </CardContent>
//               </Card>
//               <Card className="glass-effect rounded-xl text-center">
//                 <CardContent className="p-4">
//                   <Award className="w-8 h-8 mx-auto mb-2 text-primary" />
//                   <p className="text-2xl font-bold">{profile.popularity_score}</p>
//                   <p className="text-sm text-gray-600">Vibe Score</p>
//                 </CardContent>
//               </Card>
//             </div>
            
//             <Card className="glass-effect rounded-2xl">
//               <CardContent className="p-6 space-y-4">
//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="incognito-mode" className="flex flex-col space-y-1">
//                     <span className="font-medium">Incognito Mode</span>
//                     <span className="text-sm font-normal text-gray-600">
//                       View and post unmoderated content.
//                     </span>
//                   </Label>
//                   <Switch
//                     id="incognito-mode"
//                     checked={isIncognitoMode}
//                     onCheckedChange={handleIncognitoToggle}
//                   />
//                 </div>
//                 <Button onClick={handleLogout} variant="outline" className="w-full">
//                   <LogOut className="w-4 h-4 mr-2" />
//                   Logout
//                 </Button>
//               </CardContent>
//             </Card>

//           </div>
//         ) : (
//           <p className="text-center text-gray-500">Could not load profile. Please try again later.</p>
//         )}
//     </div>
//   );
// }

import React from "react";

export default function Profile() {
  return <div className="text-xl font-medium">This is the Profile page.</div>;
}