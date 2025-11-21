
// import { useState, useEffect, useCallback } from "react";
// import { useLocation } from "react-router-dom";
// import { Message } from "@/entities/all";
// import MessageCard from "../components/MessageCard";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Search as SearchIcon, Filter, X } from "lucide-react";
// import { motion } from "framer-motion";
// import { Skeleton } from "@/components/ui/skeleton";

// export default function Search() {
//   const location = useLocation();
//   const queryParams = new URLSearchParams(location.search);
  
//   const [searchTerm, setSearchTerm] = useState(queryParams.get("q") || "");
//   const [selectedTags, setSelectedTags] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [filteredMessages, setFilteredMessages] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [availableTags, setAvailableTags] = useState([]);

//   const filterMessages = useCallback(() => {
//     let filtered = messages;

//     if (searchTerm) {
//       filtered = filtered.filter(message =>
//         message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         message.username.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     if (selectedTags.length > 0) {
//       filtered = filtered.filter(message =>
//         message.tags && message.tags.some(tag => selectedTags.includes(tag))
//       );
//     }

//     setFilteredMessages(filtered);
//   }, [searchTerm, selectedTags, messages]);

//   useEffect(() => {
//     loadInitialData();
//   }, []);

//   useEffect(() => {
//     filterMessages();
//   }, [filterMessages]);

//   const loadInitialData = async () => {
//     setIsLoading(true);
//     try {
//       const data = await Message.filter({ is_approved: true }, '-created_date', 100);
//       setMessages(data);
      
//       // Extract unique tags
//       const tags = new Set();
//       data.forEach(message => {
//         if (message.tags) {
//           message.tags.forEach(tag => tags.add(tag));
//         }
//       });
//       setAvailableTags(Array.from(tags));
//     } catch (error) {
//       console.error("Error loading messages:", error);
//     }
//     setIsLoading(false);
//   };

//   const toggleTag = (tag) => {
//     setSelectedTags(prev =>
//       prev.includes(tag)
//         ? prev.filter(t => t !== tag)
//         : [...prev, tag]
//     );
//   };

//   const clearFilters = () => {
//     setSearchTerm("");
//     setSelectedTags([]);
//   };

//   const handleLike = async (messageId, isLiked) => {
//     try {
//       const message = messages.find(m => m.id === messageId);
//       if (message) {
//         const newLikesCount = isLiked 
//           ? message.likes_count + 1 
//           : Math.max(0, message.likes_count - 1);
        
//         await Message.update(messageId, { likes_count: newLikesCount });
//         setMessages(prev => prev.map(m => 
//           m.id === messageId ? { ...m, likes_count: newLikesCount } : m
//         ));
//       }
//     } catch (error) {
//       console.error("Error updating likes:", error);
//     }
//   };

//   const handleReport = async (messageId) => {
//     try {
//       const message = messages.find(m => m.id === messageId);
//       if (message) {
//         await Message.update(messageId, { 
//           reported_count: message.reported_count + 1 
//         });
//       }
//     } catch (error) {
//       console.error("Error reporting message:", error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
//             Search Messages
//           </h1>
//           <p className="text-gray-600">Find inspiring messages and positive content</p>
//         </div>

//         <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-200 p-6 mb-6">
//           <div className="flex gap-4 mb-4">
//             <div className="flex-1 relative">
//               <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//               <Input
//                 placeholder="Search messages or usernames..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 border-indigo-200 focus:border-indigo-400"
//               />
//             </div>
//             {(searchTerm || selectedTags.length > 0) && (
//               <Button
//                 variant="outline"
//                 onClick={clearFilters}
//                 className="border-indigo-200 hover:bg-indigo-50"
//               >
//                 <X className="w-4 h-4 mr-2" />
//                 Clear
//               </Button>
//             )}
//           </div>

//           {availableTags.length > 0 && (
//             <div>
//               <div className="flex items-center gap-2 mb-3">
//                 <Filter className="w-4 h-4 text-gray-500" />
//                 <span className="text-sm font-medium text-gray-700">Filter by tags:</span>
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 {availableTags.map((tag) => (
//                   <Badge
//                     key={tag}
//                     variant={selectedTags.includes(tag) ? "default" : "outline"}
//                     className={`cursor-pointer transition-colors ${
//                       selectedTags.includes(tag)
//                         ? "bg-indigo-600 text-white hover:bg-indigo-700"
//                         : "border-indigo-200 hover:bg-indigo-50 text-gray-700"
//                     }`}
//                     onClick={() => toggleTag(tag)}
//                   >
//                     #{tag}
//                   </Badge>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="space-y-6">
//           {isLoading ? (
//             Array(5).fill(0).map((_, i) => (
//               <div key={i} className="bg-white rounded-lg p-6 border border-indigo-100">
//                 <div className="flex items-center gap-3 mb-4">
//                   <Skeleton className="w-8 h-8 rounded-full" />
//                   <div>
//                     <Skeleton className="h-4 w-24 mb-1" />
//                     <Skeleton className="h-3 w-32" />
//                   </div>
//                 </div>
//                 <Skeleton className="h-16 w-full mb-4" />
//                 <div className="flex justify-between">
//                   <Skeleton className="h-8 w-20" />
//                   <Skeleton className="h-8 w-20" />
//                 </div>
//               </div>
//             ))
//           ) : filteredMessages.length === 0 ? (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="text-center py-16"
//             >
//               <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <SearchIcon className="w-12 h-12 text-indigo-600" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                 {searchTerm || selectedTags.length > 0 ? "No messages found" : "Start searching"}
//               </h3>
//               <p className="text-gray-600">
//                 {searchTerm || selectedTags.length > 0 
//                   ? "Try different keywords or remove some filters" 
//                   : "Enter keywords or select tags to find positive messages"
//                 }
//               </p>
//             </motion.div>
//           ) : (
//             <>
//               <div className="text-sm text-gray-600 mb-4">
//                 Found {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
//               </div>
//               {filteredMessages.map((message, index) => (
//                 <motion.div
//                   key={message.id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.5, delay: index * 0.1 }}
//                 >
//                   <MessageCard
//                     message={message}
//                     onLike={handleLike}
//                     onReport={handleReport}
//                   />
//                 </motion.div>
//               ))}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import React from "react";

export default function Search() {
  return <div className="text-xl font-medium">This is the Search page.</div>;
}