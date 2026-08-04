


// import React from "react";
// import { View, Text, Image, StyleSheet } from "react-native";
// import { Video } from "expo-av";

// export default function MessageBubble({ message }) {
//   // Use 'content' as the primary source, fallback to 'text' or 'prediction'
//   const displayContent = message.content || message.text || message.prediction || "No content";
//   const type = message.type || "text";
//   const isUser = message.isUser;

//   return (
//     <View style={[styles.bubble, isUser ? styles.user : styles.bot]}>

//       {type === "text" && (
//         <Text style={[styles.text, { color: isUser ? "#FFF" : "#000" }]}>
//           {displayContent}
//         </Text>
//       )}

//       {type === "image" && (
//         <Image source={{ uri: message.content }} style={styles.image} />
//       )}

//       {type === "audio" && (
//         <Text style={styles.audioText}>🎧 Voice Message</Text>
//       )}

//       {type === "video" && (
//         <Video
//           source={{ uri: message.content }}
//           style={styles.video}
//           useNativeControls
//           resizeMode="contain"
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   bubble: {
//     padding: 12,
//     marginVertical: 4,
//     borderRadius: 15,
//     maxWidth: "85%",
//   },
//   user: {
//     backgroundColor: "#007AFF", // Blue
//     alignSelf: "flex-end",
//     borderBottomRightRadius: 2,
//   },
//   bot: {
//     backgroundColor: "#E9E9EB", // Gray
//     alignSelf: "flex-start",
//     borderBottomLeftRadius: 2,
//   },
//   text: {
//     fontSize: 16,
//     lineHeight: 22,
//   },
//   image: { width: 220, height: 160, borderRadius: 10 },
//   video: { width: 220, height: 160, borderRadius: 10 },
//   audioText: { fontSize: 16, fontStyle: 'italic' }
// });



// import React, { useState } from "react";
// import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
// import { Video, Audio } from "expo-av";
// import { Ionicons } from "@expo/vector-icons";

// export default function MessageBubble({ message }) {
//   const isUser = message.isUser;
//   const type = message.type || "text";
  
//   // UNIFIED SOURCE: Check content first (local/socket), then text (from DB history)
//   const mediaUri = message.content || message.text;
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [sound, setSound] = useState(null);

//   // --- Audio Play Function ---
//   async function playSound() {
//     if (isPlaying) {
//       await sound.pauseAsync();
//       setIsPlaying(false);
//     } else {
//       console.log('Loading Sound');
//       const { sound } = await Audio.Sound.createAsync({ uri: mediaUri });
//       setSound(sound);
//       setIsPlaying(true);
//       await sound.playAsync();
//       sound.setOnPlaybackStatusUpdate((status) => {
//         if (status.didJustFinish) setIsPlaying(false);
//       });
//     }
//   }

//   return (
//     <View style={[styles.bubble, isUser ? styles.user : styles.bot]}>
      
//       {type === "text" && (
//         <Text style={[styles.text, { color: isUser ? "#FFF" : "#000" }]}>
//           {mediaUri}
//         </Text>
//       )}

//       {type === "image" && (
//         <Image source={{ uri: mediaUri }} style={styles.image} />
//       )}

//       {type === "audio" && (
//         <TouchableOpacity style={styles.audioContainer} onPress={playSound}>
//           <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={32} color={isUser ? "#FFF" : "#6366f1"} />
//           <Text style={[styles.audioText, { color: isUser ? "#FFF" : "#000" }]}>
//             Voice Message
//           </Text>
//         </TouchableOpacity>
//       )}

//       {type === "video" && (
//         <Video
//           source={{ uri: message.content }}
//           style={styles.video}
//           useNativeControls
//           resizeMode="contain"
//           isLooping={false}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   bubble: {
//     padding: 10,
//     marginVertical: 4,
//     borderRadius: 15,
//     maxWidth: "85%",
//   },
//   user: {
//     backgroundColor: "#6366f1",
//     alignSelf: "flex-end",
//     borderBottomRightRadius: 2,
//   },
//   bot: {
//     backgroundColor: "#E9E9EB",
//     alignSelf: "flex-start",
//     borderBottomLeftRadius: 2,
//   },
//   text: { fontSize: 16, lineHeight: 22 },
//   image: { width: 220, height: 160, borderRadius: 10, backgroundColor: '#ccc' },
//   video: { width: 220, height: 160, borderRadius: 10, backgroundColor: '#000' },
//   audioContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 5 },
//   audioText: { fontSize: 16, fontWeight: '500' }
// });



// import React, { useState, useEffect } from "react";
// import { 
//   View, 
//   Text, 
//   Image, 
//   StyleSheet, 
//   TouchableOpacity, 
//   ActivityIndicator 
// } from "react-native";
// import { Video, Audio } from "expo-av";
// import { Ionicons } from "@expo/vector-icons";

// export default function MessageBubble({ message, onMediaPress }) {
//   const { isUser, type, prediction, confidence } = message;
  
//   // Use content as primary source, fallback to text
//   const mediaUri = message.content || message.text;

//   const [isPlaying, setIsPlaying] = useState(false);
//   const [sound, setSound] = useState(null);
//   const [isAudioLoading, setIsAudioLoading] = useState(false);

//   // --- 1. Audio Memory Management ---
//   // Unload sound when bubble is removed from screen to prevent crashes
//   useEffect(() => {
//     return sound
//       ? () => {
//           sound.unloadAsync();
//         }
//       : undefined;
//   }, [sound]);

//   // --- 2. Audio Play Logic ---
//   async function playSound() {
//     try {
//       if (sound) {
//         if (isPlaying) {
//           await sound.pauseAsync();
//           setIsPlaying(false);
//         } else {
//           await sound.playAsync();
//           setIsPlaying(true);
//         }
//       } else {
//         setIsAudioLoading(true);
//         const { sound: newSound } = await Audio.Sound.createAsync(
//           { uri: mediaUri },
//           { shouldPlay: true }
//         );
//         setSound(newSound);
//         setIsPlaying(true);
//         setIsAudioLoading(false);

//         newSound.setOnPlaybackStatusUpdate((status) => {
//           if (status.didJustFinish) {
//             setIsPlaying(false);
//             newSound.setPositionAsync(0); // Reset to start
//           }
//         });
//       }
//     } catch (error) {
//       console.error("Audio playback error:", error);
//       setIsAudioLoading(false);
//     }
//   }

//   // --- 3. Media Click Handler ---
//   const handleMediaClick = () => {
//     if ((type === "image" || type === "video") && onMediaPress) {
//       onMediaPress(mediaUri, type);
//     }
//   };

//   return (
//     <View style={[styles.bubble, isUser ? styles.user : styles.bot]}>
      
//       {/* --- TEXT CONTENT --- */}
//       {type === "text" && (
//         <Text style={[styles.text, { color: isUser ? "#FFF" : "#000" }]}>
//           {mediaUri}
//         </Text>
//       )}

//       {/* --- IMAGE CONTENT (Clickable) --- */}
//       {type === "image" && (
//         <TouchableOpacity activeOpacity={0.9} onPress={handleMediaClick}>
//           <Image 
//             source={{ uri: mediaUri }} 
//             style={styles.image} 
//             key={mediaUri} // Forces refresh when URI changes
//           />
//         </TouchableOpacity>
//       )}

//       {/* --- AUDIO CONTENT --- */}
//       {type === "audio" && (
//         <TouchableOpacity style={styles.audioContainer} onPress={playSound} disabled={isAudioLoading}>
//           {isAudioLoading ? (
//             <ActivityIndicator size="small" color={isUser ? "#FFF" : "#6366f1"} />
//           ) : (
//             <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={35} color={isUser ? "#FFF" : "#6366f1"} />
//           )}
//           <Text style={[styles.audioText, { color: isUser ? "#FFF" : "#000" }]}>
//             {isPlaying ? "Playing..." : "Voice Message"}
//           </Text>
//         </TouchableOpacity>
//       )}

//       {/* --- VIDEO CONTENT (Clickable Thumbnail) --- */}
//       {type === "video" && (
//         <TouchableOpacity activeOpacity={0.9} onPress={handleMediaClick}>
//           <View style={styles.videoContainer}>
//             <Video
//               source={{ uri: mediaUri }}
//               style={styles.video}
//               resizeMode="cover"
//               shouldPlay={false} // Only play in full-screen modal
//             />
//             <View style={styles.videoOverlay}>
//                 <Ionicons name="play" size={40} color="white" />
//             </View>
//           </View>
//         </TouchableOpacity>
//       )}

//       {/* --- AI PREDICTION TAG (Receiver Side Only) --- */}
//       {/* {prediction && !isUser && (
//         <View style={styles.aiContainer}>
//             <View style={styles.divider} />
//             <Text style={styles.aiTag}>🛡️ AI: {prediction}</Text>
//             {confidence && <Text style={styles.confText}>{confidence} Confidence</Text>}
//         </View>
//       )} */}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   bubble: {
//     padding: 10,
//     marginVertical: 4,
//     borderRadius: 18,
//     maxWidth: "85%",
//     elevation: 1,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//   },
//   user: {
//     backgroundColor: "#6366f1",
//     alignSelf: "flex-end",
//     borderBottomRightRadius: 2,
//   },
//   bot: {
//     backgroundColor: "#E9E9EB",
//     alignSelf: "flex-start",
//     borderBottomLeftRadius: 2,
//   },
//   text: { fontSize: 16, lineHeight: 22 },
//   image: { width: 240, height: 180, borderRadius: 12, backgroundColor: '#ddd' },
//   videoContainer: { width: 240, height: 180, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' },
//   video: { width: '100%', height: '100%' },
//   videoOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
//   audioContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 150 },
//   audioText: { fontSize: 15, fontWeight: '500' },
//   aiContainer: { marginTop: 8, paddingTop: 4 },
//   divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 4 },
//   aiTag: { fontSize: 11, fontWeight: 'bold', color: '#ef4444' },
//   confText: { fontSize: 9, color: '#64748b' }
// });




// import React, { useState, useEffect, useRef, memo } from "react";
// import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
// import { Video, Audio } from "expo-av";
// import { Ionicons } from "@expo/vector-icons";

// const MessageBubble = memo(({ message, onMediaPress }) => {
//   const { type, content, isUser, prediction } = message;
  
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isAudioLoading, setIsAudioLoading] = useState(false);
//   const soundRef = useRef(null); // 🚨 Use useRef to keep sound instance stable

//   // --- 1. Audio Cleanup (Prevents Looping & Memory Leaks) ---
//   useEffect(() => {
//     return () => {
//       if (soundRef.current) {
//         console.log("Unloading sound");
//         soundRef.current.unloadAsync();
//       }
//     };
//   }, []);

//   // --- 2. Audio Play Function ---
//   const playSound = async () => {
//     try {
//       // If already playing, pause it
//       if (soundRef.current && isPlaying) {
//         await soundRef.current.pauseAsync();
//         setIsPlaying(false);
//         return;
//       }

//       // If sound exists but is paused, resume it
//       if (soundRef.current && !isPlaying) {
//         await soundRef.current.playAsync();
//         setIsPlaying(true);
//         return;
//       }

//       // First time play
//       setIsAudioLoading(true);
//       const { sound } = await Audio.Sound.createAsync(
//         { uri: content },
//         { 
//           shouldPlay: true, 
//           isLooping: false, // 🚨 EXPLICITLY DISABLE LOOPING
//           volume: 1.0 
//         }
//       );
      
//       soundRef.current = sound;
//       setIsPlaying(true);
//       setIsAudioLoading(false);

//       sound.setOnPlaybackStatusUpdate((status) => {
//         if (status.didJustFinish) {
//           setIsPlaying(false);
//           sound.setPositionAsync(0); // Reset for next play
//         }
//       });
//     } catch (error) {
//       console.error("Playback error:", error);
//       setIsAudioLoading(false);
//     }
//   };

//   return (
//     <View style={[styles.bubble, isUser ? styles.user : styles.bot]}>
//       {type === "text" && (
//         <Text style={{ color: isUser ? "#FFF" : "#000", fontSize: 16 }}>{content}</Text>
//       )}

//       {type === "image" && (
//         <TouchableOpacity onPress={() => onMediaPress(content, 'image')}>
//           <Image source={{ uri: content }} style={styles.image} key={content} />
//         </TouchableOpacity>
//       )}

//       {type === "audio" && (
//         <TouchableOpacity style={styles.audioRow} onPress={playSound} disabled={isAudioLoading}>
//           {isAudioLoading ? (
//             <ActivityIndicator size="small" color={isUser ? "#FFF" : "#6366f1"} />
//           ) : (
//             <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={35} color={isUser ? "#FFF" : "#6366f1"} />
//           )}
//           <Text style={{ color: isUser ? "#FFF" : "#000", marginLeft: 10 }}>Voice Note</Text>
//         </TouchableOpacity>
//       )}

//       {type === "video" && (
//         <TouchableOpacity onPress={() => onMediaPress(content, 'video')}>
//           <View style={styles.videoContainer}>
//             <Video
//               source={{ uri: content }}
//               style={styles.video}
//               resizeMode="cover"
//               shouldPlay={false} // Only play in the Full Screen Modal
//               useNativeControls={false}
//               key={content}
//             />
//             <View style={styles.videoOverlay}>
//               <Ionicons name="play" size={40} color="white" />
//             </View>
//           </View>
//         </TouchableOpacity>
//       )}

//       {/* {prediction && !isUser && (
//         <View style={styles.aiContainer}>
//             <View style={styles.divider} />
//             <Text style={styles.aiTag}>🛡️ AI Result: {prediction}</Text>
//         </View>
//       )} */}
//     </View>
//   );
// });

// const styles = StyleSheet.create({
//   bubble: { padding: 12, marginVertical: 4, borderRadius: 18, maxWidth: "80%" },
//   user: { backgroundColor: "#6366f1", alignSelf: "flex-end", borderBottomRightRadius: 2 },
//   bot: { backgroundColor: "#E9E9EB", alignSelf: "flex-start", borderBottomLeftRadius: 2 },
//   image: { width: 220, height: 160, borderRadius: 10, backgroundColor: '#ccc' },
//   videoContainer: { width: 220, height: 160, borderRadius: 10, overflow: 'hidden', backgroundColor: '#000' },
//   video: { width: '100%', height: '100%' },
//   videoOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
//   audioRow: { flexDirection: 'row', alignItems: 'center', minWidth: 140 },
//   aiContainer: { marginTop: 8, paddingTop: 4 },
//   divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 4 },
//   aiTag: { fontSize: 10, fontWeight: 'bold', color: '#ef4444' }
// });

// export default MessageBubble;




// import React, { useState, useEffect, useRef, memo, useCallback } from "react";
// import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
// import { Video, Audio } from "expo-av";
// import { Ionicons } from "@expo/vector-icons";
// import { API_BASE_URL } from "../utils/api";

// const MessageBubble = memo(({ message, onMediaPress }) => {
//   const { type, content, isUser } = message;

//   const resolveUri = useCallback((path) => {
//     if (!path) return null;
//     if (path.startsWith("file://") || path.startsWith("content://")) return path;
//     const currentBaseUrl = API_BASE_URL.replace("/api", "");
//     let cleanPath = path;
//     if (path.startsWith("http")) {
//       const parts = path.split("/static/");
//       if (parts.length > 1) cleanPath = `/static/${parts[1]}`;
//       else return path;
//     }
//     const normalizedPath = cleanPath.replace(/\\/g, "/");
//     const finalPath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
//     return `${currentBaseUrl}${finalPath}`;
//   }, []);

//   const finalUri = resolveUri(content);

//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isAudioLoading, setIsAudioLoading] = useState(false);
//   const soundRef = useRef(null);

//   // --- 1. Robust Cleanup ---
//   useEffect(() => {
//     return () => {
//       if (soundRef.current) {
//         console.log("Cleaning up sound instance...");
//         soundRef.current.unloadAsync();
//       }
//     };
//   }, []);

//   // --- 2. Corrected Playback Listener ---
//   const onPlaybackStatusUpdate = (status) => {
//     if (status.isLoaded) {
//       if (status.didJustFinish && !status.isLooping) {
//         // 🚨 THIS IS THE FIX: Explicitly stop and reset
//         setIsPlaying(false);
//         if (soundRef.current) {
//             soundRef.current.setPositionAsync(0);
//             soundRef.current.stopAsync(); 
//         }
//       }
//     } else if (status.error) {
//       console.error(`Playback Error: ${status.error}`);
//     }
//   };

//   const playSound = async () => {
//     try {
//       // If sound is already loaded
//       if (soundRef.current) {
//         if (isPlaying) {
//           await soundRef.current.pauseAsync();
//           setIsPlaying(false);
//         } else {
//           await soundRef.current.playAsync();
//           setIsPlaying(true);
//         }
//         return;
//       }

//       // If sound is not loaded, load it
//       setIsAudioLoading(true);
//       const { sound } = await Audio.Sound.createAsync(
//         { uri: finalUri },
//         { 
//             shouldPlay: true, 
//             isLooping: false, // 🚨 Ensure False
//             volume: 1.0 
//         },
//         onPlaybackStatusUpdate // Attach listener
//       );
      
//       soundRef.current = sound;
//       // Double-enforce no looping
//       await sound.setIsLoopingAsync(false);
      
//       setIsPlaying(true);
//       setIsAudioLoading(false);

//     } catch (error) {
//       console.error("Audio Load Error:", error);
//       setIsAudioLoading(false);
//     }
//   };

//   return (
//     <View style={[styles.bubble, isUser ? styles.user : styles.bot]}>
//       {type === "text" && <Text style={{ color: isUser ? "#FFF" : "#000", fontSize: 16 }}>{content}</Text>}

//       {type === "image" && (
//         <TouchableOpacity onPress={() => onMediaPress(finalUri, 'image')}>
//           <Image source={{ uri: finalUri }} style={styles.image} key={finalUri} />
//         </TouchableOpacity>
//       )}

//       {type === "audio" && (
//         <TouchableOpacity 
//           style={styles.audioRow} 
//           onPress={playSound} 
//           disabled={isAudioLoading}
//         >
//           {isAudioLoading ? (
//             <ActivityIndicator size="small" color={isUser ? "#FFF" : "#6366f1"} />
//           ) : (
//             <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={35} color={isUser ? "#FFF" : "#6366f1"} />
//           )}
//           <Text style={{ color: isUser ? "#FFF" : "#000", marginLeft: 10 }}>
//             {isPlaying ? "Playing..." : "Voice Note"}
//           </Text>
//         </TouchableOpacity>
//       )}

//       {type === "video" && (
//         <TouchableOpacity onPress={() => onMediaPress(finalUri, 'video')}>
//           <View style={styles.videoContainer}>
//             <Video source={{ uri: finalUri }} style={styles.video} resizeMode="cover" shouldPlay={false} key={finalUri} />
//             <View style={styles.videoOverlay}><Ionicons name="play" size={40} color="white" /></View>
//           </View>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// });

// const styles = StyleSheet.create({
//   bubble: { padding: 12, marginVertical: 4, borderRadius: 18, maxWidth: "80%" },
//   user: { backgroundColor: "#6366f1", alignSelf: "flex-end", borderBottomRightRadius: 2 },
//   bot: { backgroundColor: "#E9E9EB", alignSelf: "flex-start", borderBottomLeftRadius: 2 },
//   image: { width: 220, height: 160, borderRadius: 10 },
//   videoContainer: { width: 220, height: 160, borderRadius: 10, overflow: 'hidden' },
//   video: { width: '100%', height: '100%' },
//   videoOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
//   audioRow: { flexDirection: 'row', alignItems: 'center', minWidth: 160 }
// });

// export default MessageBubble;




import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Video, Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../utils/api";

const MessageBubble = memo(({ message, onMediaPress, showDateHeader }) => {
  const { type, content, isUser, timestamp } = message;

  // --- 1. URI Resolver (IP-Proof) ---
  const resolveUri = useCallback((path) => {
    if (!path) return null;
    if (path.startsWith("file://") || path.startsWith("content://")) return path;
    const currentBaseUrl = API_BASE_URL.replace("/api", "");
    let cleanPath = path;
    if (path.startsWith("http")) {
      const parts = path.split("/static/");
      if (parts.length > 1) cleanPath = `/static/${parts[1]}`;
      else return path;
    }
    const normalizedPath = cleanPath.replace(/\\/g, "/");
    const finalPath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
    return `${currentBaseUrl}${finalPath}`;
  }, []);

  const finalUri = resolveUri(content);

  // --- 2. Date/Time Formatters ---
  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDateLabel = (ts) => {
    const date = new Date(ts);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // --- 3. Audio Logic (Loop-Free) ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const soundRef = useRef(null);

  useEffect(() => {
    return () => { if (soundRef.current) soundRef.current.unloadAsync(); };
  }, []);

  // const playSound = async () => {

  //   try {
  //     if (soundRef.current) {
  //       isPlaying ? await soundRef.current.pauseAsync() : await soundRef.current.playAsync();
  //       setIsPlaying(!isPlaying);
  //       return;
  //     }
  //     setIsAudioLoading(true);
  //     const { sound } = await Audio.Sound.createAsync(
  //       { uri: finalUri },
  //       { shouldPlay: true, isLooping: false },
  //       (s) => { if (s.didJustFinish) { setIsPlaying(false); sound.setPositionAsync(0); }}
  //     );
  //     soundRef.current = sound;
  //     setIsPlaying(true);
  //     setIsAudioLoading(false);
  //   } catch (e) { setIsAudioLoading(false); }
  // };


  const playSound = async () => {
    try {
      if (soundRef.current) {
        isPlaying ? await soundRef.current.pauseAsync() : await soundRef.current.playAsync();
        setIsPlaying(!isPlaying);
        return;
      }
      
      setIsAudioLoading(true);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: finalUri },
        { shouldPlay: true, isLooping: false }, // initialStatus
        async (s) => { 
          if (s.didJustFinish) { 
            setIsPlaying(false); 
            await sound.stopAsync();        // 🚨 ADD THIS: Explicitly stop the player
            await sound.setPositionAsync(0); // Reset position to start for next click
          } 
        }
      );
      
      soundRef.current = sound;
      setIsPlaying(true);
      setIsAudioLoading(false);
    } catch (e) { 
      setIsAudioLoading(false); 
    }
  };

  return (
    <View style={styles.container}>
      {/* 📅 DATE SEPARATOR */}
      {showDateHeader && (
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{getDateLabel(timestamp)}</Text>
        </View>
      )}

      <View style={[styles.bubble, isUser ? styles.user : styles.bot]}>
        
        {/* TEXT */}
        {type === "text" && <Text style={[styles.text, { color: isUser ? "#FFF" : "#000" }]}>{content}</Text>}

        {/* IMAGE */}
        {type === "image" && (
          <TouchableOpacity onPress={() => onMediaPress(finalUri, 'image')}>
            <Image source={{ uri: finalUri }} style={styles.image} key={finalUri} />
          </TouchableOpacity>
        )}

        {/* AUDIO */}
        {type === "audio" && (
          <TouchableOpacity style={styles.audioRow} onPress={playSound} disabled={isAudioLoading}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={24} color={isUser ? "#FFF" : "#6366f1"} />
            <Text style={{ color: isUser ? "#FFF" : "#000", marginLeft: 10 }}>Voice Note</Text>
          </TouchableOpacity>
        )}

        {/* VIDEO */}
        {type === "video" && (
          <TouchableOpacity onPress={() => onMediaPress(finalUri, 'video')}>
            <View style={styles.videoContainer}>
              <Video source={{ uri: finalUri }} style={styles.video} resizeMode="cover" shouldPlay={false} key={finalUri} />
              <View style={styles.videoOverlay}><Ionicons name="play" size={40} color="white" /></View>
            </View>
          </TouchableOpacity>
        )}

        {/* 🕒 TIME STAMP */}
        <View style={styles.timeRow}>
            <Text style={[styles.timeText, { color: isUser ? "rgba(255,255,255,0.7)" : "#94a3b8" }]}>
                {formatTime(timestamp)}
            </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { width: "100%" },
  dateHeader: { alignSelf: 'center', marginVertical: 20, backgroundColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  dateText: { fontSize: 12, color: '#475569', fontWeight: 'bold' },
  bubble: { padding: 12, marginVertical: 4, borderRadius: 18, maxWidth: "80%" },
  user: { backgroundColor: "#6366f1", alignSelf: "flex-end", borderBottomRightRadius: 2 },
  bot: { backgroundColor: "#E9E9EB", alignSelf: "flex-start", borderBottomLeftRadius: 2 },
  text: { fontSize: 16 },
  image: { width: 220, height: 160, borderRadius: 10 },
  videoContainer: { width: 220, height: 160, borderRadius: 10, overflow: 'hidden' },
  video: { width: '100%', height: '100%' },
  videoOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  audioRow: { flexDirection: 'row', alignItems: 'center', minWidth: 150 },
  timeRow: { alignSelf: 'flex-end', marginTop: 4 },
  timeText: { fontSize: 10 }
});

export default MessageBubble;
