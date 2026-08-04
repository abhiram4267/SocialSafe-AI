//version 2.10 data - 4/1/2026

// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   FlatList,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   Pressable,
//   ActivityIndicator,
//   Text
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { EvilIcons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import { io } from "socket.io-client";
// import * as ImagePicker from 'expo-image-picker';
// import { Audio } from 'expo-av';
// import AsyncStorage from "@react-native-async-storage/async-storage"; // 🚨 1. Added Missing Import

// // Internal Imports
// import MessageBubble from "../../components/MessageBubble";
// import CameraModal from "../../components/CameraModel";
// import { fetchChatHistory, uploadAudio, uploadImage, uploadVideo } from "../../utils/api";

// export default function ChatScreen({ route, navigation }) {
//   const { recipient } = route.params;
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const [recording, setRecording] = useState(null);
//   const [isCameraVisible, setIsCameraVisible] = useState(false);
//   const socket = useRef(null);
//   const flatListRef = useRef(null);

//   const [currentUserId, setCurrentUserId] = useState(null); // 🚨 2. This is our state ID

//   // --- 3. Load current user ID from Storage ---
//   useEffect(() => {
//     const getData = async () => {
//         try {
//             const stored = await AsyncStorage.getItem("userDetails");
//             if (stored) {
//                 const user = JSON.parse(stored);
//                 setCurrentUserId(user.id);
//             }
//         } catch (e) {
//             console.error("Error loading user details", e);
//         }
//     };
//     getData();
//   }, []);

//   // --- 4. Initialize Socket and History ONLY when currentUserId is ready ---
//   useEffect(() => {
//     if (!currentUserId) return; // 🚨 Wait for ID to be loaded

//     // Socket Setup
//     socket.current = io("http://172.28.158.247:8000");
//     socket.current.emit("join", currentUserId); // Join room with real ID

//     socket.current.on("receive_message", (newMessage) => {
//       // Only show message if it belongs to this conversation
//       if (newMessage.senderId === recipient.id) {
//         const incoming = {
//           id: newMessage._id || Date.now().toString(),
//           type: newMessage.type || "text",
//           content: newMessage.text,
//           isUser: false
//         };
//         setMessages((prev) => [...prev, incoming]);
//       }
//     });

//     loadChatHistory();

//     return () => {
//         if(socket.current) socket.current.disconnect();
//     };
//   }, [currentUserId, recipient.id]); // 🚨 Re-run when ID is found

//   const loadChatHistory = async () => {
//     if (!currentUserId) return;
//     try {
//       const history = await fetchChatHistory(currentUserId, recipient.id);
//       const formatted = history.map(msg => ({
//         id: msg._id,
//         type: msg.type || "text",
//         content: msg.text,
//         isUser: msg.senderId === currentUserId // Compare with dynamic ID
//       }));
//       setMessages(formatted);
//     } catch (error) {
//       console.error("History Load Error:", error);
//     }
//   };

//   // Helper to emit via socket and update local UI
//   const emitAndSave = (content, type = "text") => {
//     if (!currentUserId) return;

//     const messageData = {
//       senderId: currentUserId,
//       receiverId: recipient.id,
//       text: content,
//       type: type,
//       timestamp: new Date()
//     };

//     socket.current.emit("send_message", messageData);
//     setMessages((prev) => [...prev, { id: Date.now().toString(), type, content, isUser: true }]);
//   };

//   // --- UI Handlers ---
//   const handleSendText = () => {
//     if (!inputText.trim()) return;
//     emitAndSave(inputText, "text");
//     setInputText("");
//   };

//   const startRecording = async () => {
//     try {
//       await Audio.requestPermissionsAsync();
//       await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
//       const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
//       setRecording(recording);
//     } catch (err) { console.error(err); }
//   };

//   const stopRecording = async () => {
//     if (!recording) return;
//     await recording.stopAndUnloadAsync();
//     const uri = recording.getURI();
//     setRecording(null);
//     const response = await uploadAudio(uri);
//     if (response) emitAndSave(response.url || uri, "audio");
//   };

//   const pickImage = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.5 });
//     if (!result.canceled) {
//       const response = await uploadImage(result.assets[0].uri);
//       emitAndSave(response.url || result.assets[0].uri, "image");
//     }
//   };

//   const handleMediaCaptured = async (uri, type) => {
//     if (type === 'image') {
//         const res = await uploadImage(uri);
//         emitAndSave(res.url || uri, "image");
//     } else {
//         const res = await uploadVideo(uri);
//         emitAndSave(res.url || uri, "video");
//     }
//   };

//   // Show a loader while waiting for User ID
//   if (!currentUserId) {
//     return (
//         <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
//             <ActivityIndicator size="large" color="#6366f1" />
//         </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#6366f1" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>{recipient.username}</Text>
//       </View>

//       <CameraModal
//         visible={isCameraVisible}
//         onClose={() => setIsCameraVisible(false)}
//         onMediaCaptured={handleMediaCaptured}
//       />

//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => <MessageBubble message={item} />}
//         style={styles.messageList}
//         onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
//         contentContainerStyle={{ paddingVertical: 10 }}
//       />

//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
//       >
//         <View style={styles.inputContainer}>
//           <View style={styles.inputWrapper}>
//             <TouchableOpacity onPress={pickImage}>
//               <Ionicons name="images-outline" size={24} color="#6366f1" style={{ marginHorizontal: 8 }} />
//             </TouchableOpacity>

//             <TextInput
//               style={styles.input}
//               value={inputText}
//               onChangeText={setInputText}
//               placeholder="Message..."
//               multiline
//             />

//             <View style={styles.iconRow}>
//               <Pressable onPressIn={startRecording} onPressOut={stopRecording}>
//                 <MaterialCommunityIcons name="microphone" size={26} color={recording ? 'red' : 'gray'} />
//               </Pressable>

//               <TouchableOpacity onPress={() => setIsCameraVisible(true)}>
//                 <EvilIcons name="camera" size={32} color="gray" />
//               </TouchableOpacity>
//             </View>
//           </View>

//           <TouchableOpacity onPress={handleSendText} style={styles.sendCircle}>
//             <Ionicons name="send" size={20} color="white" />
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F5F7FB" },
//   header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
//   headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15, color: '#333' },
//   messageList: { flex: 1, paddingHorizontal: 12 },
//   inputContainer: { flexDirection: "row", padding: 10, alignItems: "center", backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: '#eee' },
//   inputWrapper: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#F0F2F5", borderRadius: 25, paddingHorizontal: 10, minHeight: 45 },
//   input: { flex: 1, paddingVertical: 8, paddingHorizontal: 10, fontSize: 16, maxHeight: 100 },
//   iconRow: { flexDirection: "row", alignItems: "center", gap: 8 },
//   sendCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: "#6366f1", justifyContent: "center", alignItems: "center", marginLeft: 8 },
// });

//latest version which is working not only the toggle

// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   FlatList,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   Pressable,
//   ActivityIndicator,
//   Text,
//   PanResponder,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { EvilIcons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import { io } from "socket.io-client";
// import * as ImagePicker from 'expo-image-picker';
// import { Audio } from 'expo-av';
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { API_BASE_URL } from "../../utils/api";

// // Internal Imports
// import MessageBubble from "../../components/MessageBubble";
// import CameraModal from "../../components/CameraModel";
// import {
//   fetchChatHistory,
//   sendChatMessage, // Your unified HTTP FormData API
//   toggleSurveillanceAPI
// } from "../../utils/api";

// export default function ChatScreen({ route, navigation }) {
//   const { recipient, UserId } = route.params;
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const [recording, setRecording] = useState(null);
//   const [isCameraVisible, setIsCameraVisible] = useState(false);
//   const [currentUserId, setCurrentUserId] = useState(UserId);
//   const [isSurveillanceDisabled, setIsSurveillanceDisabled] = useState(false);

//   const socket = useRef(null);
//   const flatListRef = useRef(null);

//   // --- 1. Long Swipe Up Gesture (Privacy Toggle) ---
//   const panResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: (evt, gestureState) => {
//         // Detect vertical swipe up
//         return Math.abs(gestureState.dy) > 30 && gestureState.dy < 0;
//       },
//       onPanResponderRelease: (evt, gestureState) => {
//         // If swipe distance is very long (upwards more than 250 pixels)
//         if (gestureState.dy < -250) {
//           handleToggleSurveillance();
//         }
//       },
//     })
//   ).current;

//   const handleToggleSurveillance = async () => {
//     // Standardize IDs: check for .id first, then fallback to ._id
//     const myId = currentUserId;
//     const targetId = recipient.id || recipient._id;

//     if (!myId || !targetId) {
//       console.error("ID Mismatch:", { myId, targetId });
//       Alert.alert("Error", "User session error. Please re-login.");
//       return;
//     }

//     const action = isSurveillanceDisabled ? "enable" : "disable";

//     try {
//       // Pass the correct IDs to the API
//       await toggleSurveillanceAPI(myId, targetId, action);

//       setIsSurveillanceDisabled(!isSurveillanceDisabled);

//       Alert.alert(
//         "Privacy Update",
//         action === "disable"
//           ? "AI Scanning is now DISABLED for this chat."
//           : "AI Scanning is now ENABLED for this chat."
//       );
//     } catch (error) {
//       console.log("Toggle Error Detail:", error.response?.data);
//       Alert.alert("Error", "Could not update privacy settings.");
//     }
//   };

//   // --- 2. Initial Setup (Socket & History) ---
//   useEffect(() => {
//     const initChat = async () => {
//       try {
//         const stored = await AsyncStorage.getItem("userDetails");
//         if (stored) {
//           const user = JSON.parse(stored);
//           console.log("Current User ID:", user);
//           setCurrentUserId(user.id);

//           // Check if user has already disabled AI for this specific person
//           if (user.surveillance_off_users?.includes(recipient.id)) {
//             setIsSurveillanceDisabled(true);
//           }

//           // Socket Setup (Listen only)
//           // socket.current = io("http://172.28.158.247:8000");
//           socket.current = io(API_BASE_URL.replace("/api", ""), { transports: ["websocket"] });
//           socket.current.emit("join", user.id);

//           socket.current.on("receive_message", (newMessage) => {
//             if (newMessage.senderId === recipient.id) {
//               setMessages((prev) => [...prev, {
//                 ...newMessage,
//                 id: newMessage._id,
//                 isUser: false
//               }]);
//             }
//           });

//           // Load Past History
//           const history = await fetchChatHistory(user.id, recipient.id);
//           const formatted = history.map(msg => ({
//             ...msg,
//             id: msg._id,
//             isUser: msg.senderId === user.id
//           }));
//           setMessages(formatted);
//         }
//       } catch (err) {
//         console.error("Initialization Error:", err);
//       }
//     };

//     initChat();
//     return () => socket.current?.disconnect();
//   }, [recipient.id]);

//   // --- 3. Unified Sending Logic (All HTTP) ---
//   const handleUnifiedSend = async (content, type) => {
//     try {
//       // 1. Call HTTP API (FormData) - Backend runs AI and Emits via Socket to recipient
//       const result = await sendChatMessage(currentUserId, recipient.id, type, content);

//       // 2. Add to own UI immediately (Optimistic Update)
//       setMessages((prev) => [...prev, {
//         ...result,
//         id: result._id || Date.now().toString(),
//         isUser: true,
//         text: type === "text" ? content : result.text, // Use local URI for media
//       }]);
//     } catch (e) {
//       console.log(e);
//       Alert.alert("Delivery Failed", "Message could not be sent.");
//     }
//   };

//   // --- 4. User Interaction Handlers ---

//   const handleSendText = () => {
//     if (!inputText.trim()) return;
//     handleUnifiedSend(inputText, "text");
//     setInputText("");
//   };

//   const pickImage = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.5,
//     });
//     if (!result.canceled) {
//       handleUnifiedSend(result.assets[0].uri, "image");
//     }
//   };

//   const startRecording = async () => {
//     try {
//       await Audio.requestPermissionsAsync();
//       await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
//       const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
//       setRecording(recording);
//     } catch (err) { console.error(err); }
//   };

//   const stopRecording = async () => {
//     if (!recording) return;
//     await recording.stopAndUnloadAsync();
//     const uri = recording.getURI();
//     setRecording(null);
//     handleUnifiedSend(uri, "audio");
//   };

//   const handleMediaCaptured = (uri, type) => {
//     handleUnifiedSend(uri, type);
//   };

//   if (!currentUserId) {
//     return (
//       <View style={styles.loading}>
//         <ActivityIndicator size="large" color="#6366f1" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
//       {/* Header with Surveillance Indicator */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#6366f1" />
//         </TouchableOpacity>

//         <View style={styles.headerInfo}>
//           <Text style={styles.headerTitle}>{recipient.actual_name || recipient.username}</Text>
//           <Text style={[styles.headerStatus, { color: isSurveillanceDisabled ? "#ef4444" : "#22c55e" }]}>
//             {isSurveillanceDisabled ? "Private Mode" : "AI Protected"}
//           </Text>
//         </View>

//         <MaterialCommunityIcons
//           name={isSurveillanceDisabled ? "shield-off" : "shield-check"}
//           size={26}
//           color={isSurveillanceDisabled ? "#ef4444" : "#22c55e"}
//         />
//       </View>

//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => <MessageBubble message={item} />}
//         style={styles.messageList}
//         onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
//         contentContainerStyle={{ paddingVertical: 10 }}
//       />

//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
//       >
//         <View style={styles.inputContainer}>
//           <View style={styles.inputWrapper}>
//             <TouchableOpacity onPress={pickImage}>
//               <Ionicons name="images-outline" size={24} color="#6366f1" style={{ marginHorizontal: 8 }} />
//             </TouchableOpacity>

//             <TextInput
//               style={styles.input}
//               value={inputText}
//               onChangeText={setInputText}
//               placeholder="Message..."
//               multiline
//             />

//             <View style={styles.iconRow}>
//               <Pressable onPressIn={startRecording} onPressOut={stopRecording}>
//                 <MaterialCommunityIcons name="microphone" size={26} color={recording ? '#ef4444' : 'gray'} />
//               </Pressable>

//               <TouchableOpacity onPress={() => setIsCameraVisible(true)}>
//                 <EvilIcons name="camera" size={32} color="gray" />
//               </TouchableOpacity>
//             </View>
//           </View>

//           <TouchableOpacity onPress={handleSendText} style={styles.sendCircle}>
//             <Ionicons name="send" size={20} color="white" />
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>

//       <CameraModal
//         visible={isCameraVisible}
//         onClose={() => setIsCameraVisible(false)}
//         onMediaCaptured={handleMediaCaptured}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F5F7FB" },
//   loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
//   headerInfo: { flex: 1, marginLeft: 15 },
//   headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
//   headerStatus: { fontSize: 11, fontWeight: '600' },
//   messageList: { flex: 1, paddingHorizontal: 12 },
//   inputContainer: { flexDirection: "row", padding: 10, alignItems: "center", backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: '#eee' },
//   inputWrapper: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#F0F2F5", borderRadius: 25, paddingHorizontal: 10, minHeight: 45 },
//   input: { flex: 1, paddingVertical: 8, paddingHorizontal: 10, fontSize: 16, maxHeight: 100 },
//   iconRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//   sendCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: "#6366f1", justifyContent: "center", alignItems: "center", marginLeft: 8 },
// });

//My Working code

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import {
//   View,
//   FlatList,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   Pressable,
//   ActivityIndicator,
//   Text,
//   PanResponder,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   EvilIcons,
//   Ionicons,
//   MaterialCommunityIcons,
// } from "@expo/vector-icons";
// import { io } from "socket.io-client";
// import * as ImagePicker from "expo-image-picker";
// import { Audio } from "expo-av";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { API_BASE_URL } from "../../utils/api";

// // Internal Imports
// import MessageBubble from "../../components/MessageBubble";
// import CameraModal from "../../components/CameraModel"; // Ensure path/name is correct
// import {
//   fetchChatHistory,
//   sendChatMessage,
//   toggleSurveillanceAPI,
// } from "../../utils/api";

// export default function ChatScreen({ route, navigation }) {
//   const { recipient } = route.params;
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const [recording, setRecording] = useState(null);
//   const [isCameraVisible, setIsCameraVisible] = useState(false);
//   const [currentUserId, setCurrentUserId] = useState(null); // This is for UI/State
//   const [isSurveillanceDisabled, setIsSurveillanceDisabled] = useState(false);

//   const socket = useRef(null);
//   const flatListRef = useRef(null);

//   const handleToggleSurveillance = async () => {
//     try {
//       // 1. Pull the FRESH data from storage (avoids the state closure bug)
//       const stored = await AsyncStorage.getItem("userDetails");
//       if (!stored) return;

//       const user = JSON.parse(stored);
//       const myId = user.id || user._id;
//       const targetId = recipient.id || recipient._id;
//       const offList = user.surveillance_off_users || [];

//       // 2. Determine the real current status
//       // If the ID is in the list, it is CURRENTLY DISABLED
//       const currentlyDisabled = offList.includes(targetId);

//       // 3. Define the NEXT action
//       // If it's disabled, we want to ENABLE. If enabled, we want to DISABLE.
//       const action = currentlyDisabled ? "enable" : "disable";

//       console.log(
//         `Current Status: ${currentlyDisabled ? "OFF" : "ON"}. Triggering: ${action}`,
//       );

//       // 4. Call the Backend API
//       const apiResponse = await toggleSurveillanceAPI(myId, targetId, action);

//       if (apiResponse.status === "success") {
//         // 5. Update the local list for storage
//         let newOffList = [...offList];

//         if (action === "disable") {
//           if (!newOffList.includes(targetId)) newOffList.push(targetId);
//         } else {
//           newOffList = newOffList.filter((id) => id !== targetId);
//         }

//         // 6. Save back to AsyncStorage immediately
//         const updatedUser = { ...user, surveillance_off_users: newOffList };
//         await AsyncStorage.setItem("userDetails", JSON.stringify(updatedUser));

//         // 7. Update UI State so the Shield Icon changes color
//         setIsSurveillanceDisabled(action === "disable");

//         // 8. Show the Correct Alert
//         Alert.alert(
//           "Privacy Settings",
//           action === "disable"
//             ? "AI Surveillance has been turned OFF."
//             : "AI Surveillance has been turned ON.",
//         );
//       }
//     } catch (error) {
//       console.error("Toggle Error:", error);
//       Alert.alert("Error", "Could not connect to privacy server.");
//     }
//   };

//   // --- 2. Long Swipe Up Gesture ---
//   const panResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: (evt, gestureState) => {
//         return Math.abs(gestureState.dy) > 30 && gestureState.dy < 0;
//       },
//       onPanResponderRelease: (evt, gestureState) => {
//         if (gestureState.dy < -200) {
//           handleToggleSurveillance();
//         }
//       },
//     }),
//   ).current;

//   // --- 3. Initial Setup ---
//   useEffect(() => {
//     const initChat = async () => {
//       try {
//         const stored = await AsyncStorage.getItem("userDetails");
//         if (stored) {
//           const user = JSON.parse(stored);
//           const myId = user.id || user._id;
//           const targetId = recipient.id || recipient._id;

//           setCurrentUserId(myId);

//           // STRICT CHECK: Is this specific recipient in my 'off' list?
//           const offList = user.surveillance_off_users || [];
//           const isTargetOff = offList.includes(targetId);
//           console.log("Setting initial privacy for this chat:", isTargetOff);
//           setIsSurveillanceDisabled(isTargetOff);

//           // Socket Setup using myId directly (don't wait for state)
//           const socketUrl = API_BASE_URL.replace("/api", "");
//           socket.current = io(socketUrl, { transports: ["websocket"] });
//           socket.current.emit("join", myId);

//           socket.current.on("receive_message", (newMessage) => {
//             if (newMessage.senderId === targetId) {
//               setMessages((prev) => [
//                 ...prev,
//                 {
//                   ...newMessage,
//                   id: newMessage._id || newMessage.id,
//                   isUser: false,
//                 },
//               ]);
//             }
//           });

//           // Load Past History using myId
//           const history = await fetchChatHistory(myId, targetId);
//           const formatted = history.map((msg) => ({
//             ...msg,
//             id: msg._id || msg.id,
//             isUser: msg.senderId === myId,
//           }));
//           setMessages(formatted);
//         }
//       } catch (err) {
//         console.error("Init Error:", err);
//       }
//     };
//     initChat();
//   }, [recipient.id, recipient._id]);

//   // --- 4. Unified Sending Logic ---
//   const handleUnifiedSend = async (content, type) => {
//     try {
//       // 1. Call HTTP API (FormData) - Backend runs AI and Emits via Socket to recipient
//       const result = await sendChatMessage(currentUserId, recipient.id, type, content);

//       // 2. Add to own UI immediately (Optimistic Update)
//       setMessages((prev) => [...prev, {
//         ...result,
//         id: result._id || Date.now().toString(),
//         isUser: true,
//         text: type === "text" ? content : result.text, // Use local URI for media
//       }]);
//     } catch (e) {
//       console.log(e);
//       Alert.alert("Delivery Failed", "Message could not be sent.");
//     }
//   };

//   const handleSendText = () => {
//     if (!inputText.trim()) return;
//     handleUnifiedSend(inputText, "text");
//     setInputText("");
//   };

//   const pickImage = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.5,
//     });
//     if (!result.canceled) {
//       handleUnifiedSend(result.assets[0].uri, "image");
//     }
//   };

//   const startRecording = async () => {
//     try {
//       await Audio.requestPermissionsAsync();
//       await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
//       const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
//       setRecording(recording);
//     } catch (err) { console.error(err); }
//   };

//   const stopRecording = async () => {
//     if (!recording) return;
//     await recording.stopAndUnloadAsync();
//     const uri = recording.getURI();
//     setRecording(null);
//     handleUnifiedSend(uri, "audio");
//   };

//   const handleMediaCaptured = (uri, type) => {
//     handleUnifiedSend(uri, type);
//   };

//   if (!currentUserId) {
//     return (
//       <View style={styles.loading}>
//         <ActivityIndicator size="large" color="#6366f1" />
//         <Text style={{ marginTop: 10 }}>Connecting...</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#6366f1" />
//         </TouchableOpacity>

//         <View style={styles.headerInfo}>
//           <Text style={styles.headerTitle}>
//             {recipient.actual_name || recipient.username}
//           </Text>
//           <Text
//             style={[
//               styles.headerStatus,
//               { color: isSurveillanceDisabled ? "#ef4444" : "#22c55e" },
//             ]}
//           >
//             {isSurveillanceDisabled ? "Private Mode (AI Off)" : "AI Protected"}
//           </Text>
//         </View>

//         <MaterialCommunityIcons
//           name={isSurveillanceDisabled ? "shield-off" : "shield-check"}
//           size={26}
//           color={isSurveillanceDisabled ? "#ef4444" : "#22c55e"}
//         />
//       </View>

//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         keyExtractor={(item, index) => item.id?.toString() || index.toString()}
//         renderItem={({ item }) => <MessageBubble message={item} />}
//         style={styles.messageList}
//         onContentSizeChange={() =>
//           flatListRef.current?.scrollToEnd({ animated: true })
//         }
//         contentContainerStyle={{ paddingVertical: 10 }}
//       />

//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
//       >
//         <View style={styles.inputContainer}>
//           <View style={styles.inputWrapper}>
//             <TouchableOpacity
//               onPress={() => {
//                 pickImage();
//               }}
//             >
//               <Ionicons
//                 name="images-outline"
//                 size={24}
//                 color="#6366f1"
//                 style={{ marginHorizontal: 8 }}
//               />
//             </TouchableOpacity>

//             <TextInput
//               style={styles.input}
//               value={inputText}
//               onChangeText={setInputText}
//               placeholder="Message..."
//               multiline
//             />

//             <View style={styles.iconRow}>
//               <Pressable
//                 onPressIn={() => {
//                   startRecording();
//                 }}

//               >
//                 <MaterialCommunityIcons
//                   name="microphone"
//                   size={26}
//                   color={recording ? "#ef4444" : "gray"}
//                 />
//               </Pressable>

//               <TouchableOpacity onPress={() => setIsCameraVisible(true)}>
//                 <EvilIcons name="camera" size={32} color="gray" />
//               </TouchableOpacity>
//             </View>
//           </View>

//           <TouchableOpacity onPress={handleSendText} style={styles.sendCircle}>
//             <Ionicons name="send" size={20} color="white" />
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>

//       <CameraModal
//         visible={isCameraVisible}
//         onClose={() => setIsCameraVisible(false)}
//         onMediaCaptured={handleMediaCaptured}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F5F7FB" },
//   loading: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 15,
//     backgroundColor: "#fff",
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },
//   headerInfo: { flex: 1, marginLeft: 15 },
//   headerTitle: { fontSize: 18, fontWeight: "bold" },
//   headerStatus: { fontSize: 12, fontWeight: "600" },
//   messageList: { flex: 1 },
//   inputContainer: {
//     flexDirection: "row",
//     padding: 10,
//     alignItems: "center",
//     backgroundColor: "#fff",
//   },
//   inputWrapper: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F0F2F5",
//     borderRadius: 25,
//     paddingHorizontal: 10,
//     minHeight: 45,
//   },
//   input: {
//     flex: 1,
//     paddingVertical: 8,
//     paddingHorizontal: 10,
//     fontSize: 16,
//     maxHeight: 100,
//   },
//   iconRow: { flexDirection: "row", alignItems: "center", gap: 8 },
//   sendCircle: {
//     width: 45,
//     height: 45,
//     borderRadius: 22.5,
//     backgroundColor: "#6366f1",
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: 8,
//   },
// });

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  ActivityIndicator,
  Text,
  PanResponder,
  Modal,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  EvilIcons,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { io } from "socket.io-client";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../utils/api";

// Internal Imports
import MessageBubble from "../../components/MessageBubble";
import CameraModal from "../../components/CameraModel";
import MediaViewerModal from "../../components/MediaViewerModal";
import {
  fetchChatHistory,
  sendChatMessage,
  toggleSurveillanceAPI,
  deleteBulkMessagesApi,
  forwardMessagesApi,
  fetchAllUsers,
  getMutualSurveillanceStatus,
} from "../../utils/api";

export default function ChatScreen({ route, navigation }) {
  const { recipient } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [recording, setRecording] = useState(null);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isSurveillanceDisabled, setIsSurveillanceDisabled] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [forwardModalVisible, setForwardModalVisible] = useState(false);
  const [userList, setUserList] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isRecipientDisabled, setIsRecipientDisabled] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState({ uri: null, type: null });
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const targetId = recipient.id || recipient._id;
  const socket = useRef(null);
  const flatListRef = useRef(null);

  const checkMutualStatus = async (myId) => {
    try {
      const status = await getMutualSurveillanceStatus(myId, targetId);
      setIsSurveillanceDisabled(status.i_disabled);
      setIsRecipientDisabled(status.they_disabled);
    } catch (e) {
      console.log("Status check error", e);
    }
  };

  const resolveUri = useCallback((path) => {
    if (!path) return null;
    if (
      path.startsWith("file://") ||
      path.startsWith("content://") ||
      path.startsWith("http")
    )
      return path;
    const baseUrl = API_BASE_URL.replace("/api", "");
    return `${baseUrl}/${path.replace(/^\/+/, "")}`;
  }, []);

  // const handleToggleSurveillance = async () => {
  //   try {
  //     // 1. Pull the FRESH data from storage (avoids the state closure bug)
  //     const stored = await AsyncStorage.getItem("userDetails");
  //     if (!stored) return;

  //     const user = JSON.parse(stored);
  //     const myId = user.id || user._id;
  //     const targetId = recipient.id || recipient._id;
  //     const offList = user.surveillance_off_users || [];

  //     // 2. Determine the real current status
  //     // If the ID is in the list, it is CURRENTLY DISABLED
  //     const currentlyDisabled = offList.includes(targetId);

  //     // 3. Define the NEXT action
  //     // If it's disabled, we want to ENABLE. If enabled, we want to DISABLE.
  //     const action = currentlyDisabled ? "enable" : "disable";

  //     console.log(
  //       `Current Status: ${currentlyDisabled ? "OFF" : "ON"}. Triggering: ${action}`,
  //     );

  //     // 4. Call the Backend API
  //     const apiResponse = await toggleSurveillanceAPI(myId, targetId, action);

  //     if (apiResponse.status === "success") {
  //       // 5. Update the local list for storage
  //       let newOffList = [...offList];

  //       if (action === "disable") {
  //         if (!newOffList.includes(targetId)) newOffList.push(targetId);
  //       } else {
  //         newOffList = newOffList.filter((id) => id !== targetId);
  //       }

  //       // 6. Save back to AsyncStorage immediately
  //       const updatedUser = { ...user, surveillance_off_users: newOffList };
  //       await AsyncStorage.setItem("userDetails", JSON.stringify(updatedUser));

  //       // 7. Update UI State so the Shield Icon changes color
  //       setIsSurveillanceDisabled(action === "disable");

  //       // 8. Show the Correct Alert
  //       Alert.alert(
  //         "Privacy Settings",
  //         action === "disable"
  //           ? "AI Surveillance has been turned OFF."
  //           : "AI Surveillance has been turned ON.",
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Toggle Error:", error);
  //     Alert.alert("Error", "Could not connect to privacy server.");
  //   }
  // };

  const handleToggleSurveillance = async () => {
    try {
      // 1. Get the FRESH data from storage to avoid the closure bug
      const stored = await AsyncStorage.getItem("userDetails");
      if (!stored) return;

      const user = JSON.parse(stored);
      const myId = user.id || user._id;
      const offList = user.surveillance_off_users || [];

      // 2. Determine current status based on the REAL list in storage
      const isCurrentlyOff = offList.includes(targetId);

      // 3. Define the NEXT action
      // If it is currently OFF, we want to 'enable' it (Turn AI back ON)
      // If it is currently ON, we want to 'disable' it (Turn AI OFF)
      const action = isCurrentlyOff ? "enable" : "disable";

      console.log(
        `Current State: ${isCurrentlyOff ? "OFF" : "ON"}. Sending Action: ${action}`,
      );

      // 4. Call the Backend API
      const apiResponse = await toggleSurveillanceAPI(myId, targetId, action);

      if (apiResponse.status === "success") {
        // 5. Update the local list for storage sync
        let newOffList = [...offList];
        if (action === "disable") {
          if (!newOffList.includes(targetId)) newOffList.push(targetId);
        } else {
          newOffList = newOffList.filter((id) => id !== targetId);
        }

        // 6. Save back to AsyncStorage immediately
        const updatedUser = { ...user, surveillance_off_users: newOffList };
        await AsyncStorage.setItem("userDetails", JSON.stringify(updatedUser));

        // 7. Update UI States
        setIsSurveillanceDisabled(action === "disable");

        // Notify other user via socket (if implemented)
        socket.current?.emit("toggle_privacy", {
          senderId: myId,
          receiverId: targetId,
          action,
        });

        // Refresh the mutual status to update the header color
        await checkMutualStatus(myId);

        // 8. Show the correct alert
        Alert.alert(
          "Privacy Settings",
          action === "disable"
            ? "AI Surveillance is now OFF for this chat."
            : "AI Surveillance is now ON (Protected).",
        );
      }
    } catch (error) {
      console.error("Toggle Error:", error);
      Alert.alert("Error", "Could not connect to privacy server.");
    }
  };

  // --- 2. Long Swipe Up Gesture ---
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 30 && gestureState.dy < 0;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy < -200) {
          handleToggleSurveillance();
        }
      },
    }),
  ).current;

  const loadMessages = async (isInitial = true) => {
    if (loadingMore || (!hasMore && !isInitial)) return;
    setLoadingMore(true);

    try {
      const stored = await AsyncStorage.getItem("userDetails");
      const user = JSON.parse(stored);
      const myId = user.id || user._id;

      // 🚨 FIX: Use current list length as 'skip' to handle new messages sent in this session
      const currentSkip = isInitial ? 0 : skip;

      const history = await fetchChatHistory(myId, targetId, currentSkip);

      if (history.length < 20) setHasMore(false);

      // Map backend data to frontend format
      const formatted = history.map((msg) => ({
        ...msg,
        id: msg._id || msg.id,
        isUser: msg.senderId === myId,
        content: msg.type === "text" ? msg.text : resolveUri(msg.text),
      }));

      if (isInitial) {
        setMessages(formatted);
        setSkip(formatted.length);
      } else {
        setMessages((prev) => {
          // 🚨 THE CORE FIX: Filter out duplicates from the new batch
          const filteredNew = formatted.filter(
            (newMsg) => !prev.some((existing) => existing.id === newMsg.id),
          );

          // Inverted list: Old messages go to the END
          const updatedList = [...prev, ...filteredNew];

          // Update skip based on permanent messages in list
          setSkip(updatedList.length);

          return updatedList;
        });
      }
    } catch (err) {
      console.error("Load Error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // --- 3. Initial Setup ---
  useEffect(() => {
    const initChat = async () => {
      try {
        const stored = await AsyncStorage.getItem("userDetails");
        if (stored) {
          const user = JSON.parse(stored);
          const myId = user.id || user._id;
          setCurrentUserId(myId);

          await checkMutualStatus(myId);
          await loadMessages(true); // 🚨 Load history newest-first

          const socketUrl = API_BASE_URL.replace("/api", "");
          socket.current = io(socketUrl, { transports: ["websocket"] });
          socket.current.emit("join", myId);

          socket.current.on("privacy_updated", (data) => {
            if (data.senderId === targetId) checkMutualStatus(myId);
          });

          // 🚨 SOCKET: ADD NEW MESSAGES TO THE START (Bottom of screen)
          socket.current.on("receive_message", (newMessage) => {
            if (newMessage.senderId === targetId) {
              setMessages((prev) => {
                // 🚨 PREVENT DUPLICATES: Check if this ID is already in the list
                const msgId = newMessage._id || newMessage.id;
                if (prev.find((m) => m.id === msgId)) return prev;

                return [
                  {
                    ...newMessage,
                    id: msgId,
                    content:
                      newMessage.type === "text"
                        ? newMessage.text
                        : resolveUri(newMessage.text),
                    isUser: false,
                  },
                  ...prev,
                ];
              });
            }
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    initChat();
    return () => socket.current?.disconnect();
  }, [targetId]);

  // --- 4. Unified Sending Logic ---
  const handleUnifiedSend = async (dataContent, type) => {
    if (!currentUserId || !targetId) return;

    const tempId = "temp-" + Date.now() + Math.random(); // Unique temp ID

    const optimisticMsg = {
      id: tempId,
      isUser: true,
      type: type,
      content: dataContent,
    };

    setMessages((prev) => [optimisticMsg, ...prev]);

    try {
      const result = await sendChatMessage(
        currentUserId,
        targetId,
        type,
        dataContent,
      );

      if (result) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId // 🚨 FIND THE TEMP ID
              ? {
                  ...result,
                  id: result._id || result.id, // 🚨 REPLACE WITH PERMANENT ID
                  isUser: true,
                  content:
                    type === "text" ? dataContent : resolveUri(result.text),
                }
              : m,
          ),
        );
        // Sync skip count
        setSkip((prev) => prev + 1);
      }
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;
    handleUnifiedSend(inputText, "text");
    setInputText("");
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });
    if (!result.canceled) {
      handleUnifiedSend(result.assets[0].uri, "image");
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(recording);
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    handleUnifiedSend(uri, "audio");
  };

  const handleMediaCaptured = (uri, type) => {
    handleUnifiedSend(uri, type);
  };

  if (!currentUserId) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ marginTop: 10 }}>Connecting...</Text>
      </View>
    );
  }

  const toggleSelection = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    Alert.alert(
      "Delete Messages",
      `Delete ${selectedIds.length} selected messages?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBulkMessagesApi(selectedIds, currentUserId);
              // Update UI: remove deleted messages
              setMessages((prev) =>
                prev.filter((m) => !selectedIds.includes(m.id)),
              );
              setSelectedIds([]); // Reset selection
            } catch (error) {
              Alert.alert("Error", "Could not delete messages.");
            }
          },
        },
      ],
    );
  };

  const openForwardPicker = async () => {
    try {
      const users = await fetchAllUsers(currentUserId);
      const sendUsers = users.filter(
        (u) => u.id !== recipient.id && u.id !== currentUserId,
      );
      setUserList(sendUsers);
      setForwardModalVisible(true);
    } catch (e) {
      Alert.alert("Error", "Could not load user list.");
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleBulkForward = async () => {
    if (selectedUserIds.length === 0) return;
    try {
      await forwardMessagesApi(selectedIds, currentUserId, selectedUserIds);

      setForwardModalVisible(false);
      setSelectedIds([]); // Clear selected messages
      setSelectedUserIds([]); // Clear selected users
      Alert.alert("Success", `Forwarded to ${selectedUserIds.length} users`);
    } catch (error) {
      Alert.alert("Error", "Forwarding failed.");
    }
  };

  const openMediaViewer = (uri, type) => {
    setSelectedMedia({ uri, type });
    setViewerVisible(true);
  };

  const isActuallyPrivate = isSurveillanceDisabled && isRecipientDisabled;
  const isWaitingForOther = isSurveillanceDisabled && !isRecipientDisabled;

  return (
    <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
      <MediaViewerModal
        visible={viewerVisible}
        mediaUri={selectedMedia.uri}
        mediaType={selectedMedia.type}
        onClose={() => setViewerVisible(false)}
      />

      {/* --- DYNAMIC HEADER --- */}
      <View
        style={[
          styles.header,
          selectedIds.length > 0 && { backgroundColor: "#6366f1" },
        ]}
      >
        {selectedIds.length > 0 ? (
          <>
            <TouchableOpacity onPress={() => setSelectedIds([])}>
              <Ionicons name="close" size={26} color="white" />
            </TouchableOpacity>
            <Text style={{ color: "white", marginLeft: 20, fontSize: 18 }}>
              {selectedIds.length}
            </Text>
            <View style={{ flex: 1 }} />

            {/* 🚨 FORWARD BUTTON */}
            <TouchableOpacity
              onPress={openForwardPicker}
              style={{ marginRight: 20 }}
            >
              <MaterialCommunityIcons
                name="share-outline"
                size={28}
                color="white"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleBulkDelete}>
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={26}
                color="white"
              />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#6366f1" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerInfo}
              onPress={() =>
                navigation.navigate("InfoScreen", {
                  recipient,
                  currentUserId,
                  messages,
                })
              }
            >
              {/* <Image source={{ uri: recipient.profile_image }} style={styles.headerAvatar} /> */}
              <Text style={styles.headerTitle}>
                {recipient.actual_name || recipient.username}
              </Text>

              {/* 🚨 DYNAMIC STATUS TEXT */}
              <Text
                style={[
                  styles.headerStatus,
                  {
                    color: isActuallyPrivate
                      ? "#ef4444"
                      : isWaitingForOther
                        ? "#f59e0b"
                        : "#22c55e",
                  },
                ]}
              >
                {isActuallyPrivate
                  ? "Mutual Privacy (AI Off)"
                  : isWaitingForOther
                    ? "Waiting for recipient..."
                    : "AI Protected"}
              </Text>
            </TouchableOpacity>

            {/* 🚨 DYNAMIC SHIELD ICON */}
            <MaterialCommunityIcons
              name={
                isActuallyPrivate
                  ? "shield-off"
                  : isWaitingForOther
                    ? "shield-sync"
                    : "shield-check"
              }
              size={26}
              color={
                isActuallyPrivate
                  ? "#ef4444"
                  : isWaitingForOther
                    ? "#f59e0b"
                    : "#22c55e"
              }
            />
          </>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >

      <FlatList
        ref={flatListRef}
        data={messages}
        // 🚨 Force ID to string and handle fallbacks
        keyExtractor={(item, index) => item.id?.toString() || `index-${index}`}
        // 1. 🚨 Pass 'index' here along with 'item'
        renderItem={({ item, index }) => {
          // 2. Logic to calculate if we show the Date Header
          const currentDate = new Date(item.timestamp).toDateString();

          // In an inverted list, the next item in the array (index + 1)
          // is the message sent BEFORE this one in time.
          const prevMessage = messages[index + 1];
          const prevDate = prevMessage
            ? new Date(prevMessage.timestamp).toDateString()
            : null;

          // If the dates are different, it means a new day started
          const showDateHeader = currentDate !== prevDate;

          return (
            <TouchableOpacity
              onLongPress={() => toggleSelection(item.id)}
              onPress={() =>
                selectedIds.length > 0 ? toggleSelection(item.id) : null
              }
              activeOpacity={0.8}
            >
              <View
                style={[selectedIds.includes(item.id) && styles.selectedBubble]}
              >
                <MessageBubble
                  message={item}
                  onMediaPress={openMediaViewer}
                  // 3. 🚨 Pass the calculated boolean to the component
                  showDateHeader={showDateHeader}
                />
              </View>
            </TouchableOpacity>
          );
        }}
        inverted={true}
        onEndReached={() => loadMessages(false)}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              size="small"
              color="#6366f1"
              style={{ marginVertical: 10 }}
            />
          ) : null
        }
        style={styles.messageList}
        contentContainerStyle={{ paddingVertical: 10 }}
      />

      {/* --- MULTI-SELECT FORWARD MODAL --- */}
      <Modal visible={forwardModalVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setForwardModalVisible(false);
                setSelectedUserIds([]);
              }}
            >
              <Text style={{ color: "red", fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Forward to...</Text>
            <TouchableOpacity
              onPress={handleBulkForward}
              disabled={selectedUserIds.length === 0}
            >
              <Text
                style={{
                  color: selectedUserIds.length > 0 ? "#6366f1" : "#ccc",
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                Send
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={userList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userItem}
                onPress={() => toggleUserSelection(item.id)}
              >
                <View style={styles.avatar}>
                  <Text style={{ color: "white" }}>
                    {item.username[0].toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{item.actual_name}</Text>
                  <Text style={{ color: "gray" }}>@{item.username}</Text>
                </View>

                {/* --- CHECKBOX ICON --- */}
                <Ionicons
                  name={
                    selectedUserIds.includes(item.id)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={24}
                  color={selectedUserIds.includes(item.id) ? "#6366f1" : "#ccc"}
                />
              </TouchableOpacity>
            )}
          />

          {selectedUserIds.length > 0 && (
            <View style={styles.selectionCount}>
              <Text style={{ color: "white" }}>
                {selectedUserIds.length} users selected
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
          
      
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity
              onPress={() => {
                pickImage();
              }}
            >
              <Ionicons
                name="images-outline"
                size={24}
                color="#6366f1"
                style={{ marginHorizontal: 8 }}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message..."
              placeholderTextColor="#000"
              multiline
            />

            <View style={styles.iconRow}>
              <Pressable
                onPressIn={() => {
                  startRecording();
                }}
                onPressOut={() => {
                  stopRecording();
                }}
              >
                <MaterialCommunityIcons
                  name="microphone"
                  size={26}
                  color={recording ? "#ef4444" : "gray"}
                />
              </Pressable>

              <TouchableOpacity onPress={() => setIsCameraVisible(true)}>
                <EvilIcons name="camera" size={32} color="gray" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleSendText} style={styles.sendCircle}>
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <CameraModal
        visible={isCameraVisible}
        onClose={() => setIsCameraVisible(false)}
        onMediaCaptured={handleMediaCaptured}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerInfo: { flex: 1, marginLeft: 15 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  headerStatus: { fontSize: 12, fontWeight: "600" },
  messageList: { flex: 1 },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
    borderRadius: 25,
    paddingHorizontal: 10,
    minHeight: 45,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    maxHeight: 100,
    
  },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sendCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  selectedBubble: {
    backgroundColor: "rgba(99, 102, 241, 0.2)", // Light blue highlight
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  userItem: { padding: 20, borderBottomWidth: 1, borderColor: "#f1f5f9" },
  userName: { fontSize: 16, fontWeight: "600" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  userName: { fontSize: 16, fontWeight: "600" },
  selectionCount: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#6366f1",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
  },
});
