// import { useState, useEffect } from "react";
// import { Message, User, UserProfile, AppSettings } from "@/entities/all";
// import ComposeForm from "../components/ComposeForm";
// import { useNavigate } from "react-router-dom";
// import { createPageUrl } from "@/utils";
// import { ArrowLeft } from "lucide-react";
// import { Button } from "@/components/ui/button";

// const adjectives = ["Kind", "Brave", "Gentle", "Bright", "Happy", "Calm", "Sweet", "Clever", "Wise", "Cool"];
// const animals = ["Panda", "Dolphin", "Butterfly", "Owl", "Rabbit", "Fox", "Bird", "Cat", "Lion", "Tiger"];

// function generateAnonymousName() {
//   const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
//   const animal = animals[Math.floor(Math.random() * animals.length)];
//   return `${adj}${animal}`;
// }

// async function getNextWhisperId() {
//   try {
//     const settings = await AppSettings.filter({ setting_key: "whisper_counter" });
//     let counter = 1;
//     if (settings.length > 0) {
//       counter = parseInt(settings[0].setting_value, 10) + 1;
//       await AppSettings.update(settings[0].id, { setting_value: counter.toString() });
//     } else {
//       await AppSettings.create({ setting_key: "whisper_counter", setting_value: "1" });
//     }
//     return `Whispering #${counter.toString().padStart(4, '0')}`;
//   } catch (error) {
//     console.error("Failed to get next whisper ID:", error);
//     return `Whispering #${Math.floor(Math.random() * 9999) + 1}`;
//   }
// }

// export default function Compose() {
//   const navigate = useNavigate();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isIncognitoMode, setIsIncognitoMode] = useState(localStorage.getItem('whispernet_incognito_mode') === 'true');

//   useEffect(() => {
//     User.me().then(setCurrentUser).catch(() => navigate(createPageUrl("Feed")));
    
//     const handleThemeChange = (event) => {
//       setIsIncognitoMode(event.detail.isIncognitoMode);
//     };

//     window.addEventListener('themeChanged', handleThemeChange);
//     return () => window.removeEventListener('themeChanged', handleThemeChange);
//   }, [navigate]);

//   const handleSubmit = async (messageData) => {
//     if (!currentUser) return;
//     setIsSubmitting(true);
//     try {
//       // Ensure user has a profile
//       let userProfiles = await UserProfile.filter({ user_id: currentUser.id });
//       let userProfile;
      
//       if (userProfiles.length === 0) {
//         userProfile = await UserProfile.create({
//           user_id: currentUser.id,
//           display_name: generateAnonymousName(),
//         });
//       } else {
//         userProfile = userProfiles[0];
//       }

//       const whisperId = await getNextWhisperId();
      
//       const mode = isIncognitoMode ? 'unhinged' : 'positive';
//       const isApprovedStatus = mode === 'unhinged' ? 'approved' : 'pending';

//       await Message.create({
//         user_id: currentUser.id,
//         content: messageData.content,
//         whisper_id: whisperId,
//         tags: messageData.tags,
//         mode: mode,
//         is_approved: isApprovedStatus,
//         likes_count: 0,
//         comments_count: 0
//       });

//       if (mode === 'positive') {
//           await UserProfile.update(userProfile.id, { 
//             user_id: userProfile.user_id,
//             messages_posted: (userProfile.messages_posted || 0) + 1 
//           });
//       }

//       navigate(createPageUrl("Feed"));
//     } catch (error) {
//       console.error("Error submitting message:", error);
//     }
//     setIsSubmitting(false);
//   };
  
//   if (!currentUser) return null;

//   return (
//     <div className="h-full">
//       <div className="sticky top-0 glass-effect p-6 rounded-t-3xl border-b border-border-color">
//         <div className="flex items-center gap-4">
//           <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
//             <ArrowLeft className="w-5 h-5" />
//           </Button>
//           <h1 className="text-xl font-bold">Create Your Vibe</h1>
//         </div>
//       </div>
//       <ComposeForm onSubmit={handleSubmit} isSubmitting={isSubmitting} isIncognitoMode={isIncognitoMode} />
//     </div>
//   );
// }

import React from "react";

export default function Compose() {
  return <div className="text-xl font-medium">This is the Compose page.</div>;
}