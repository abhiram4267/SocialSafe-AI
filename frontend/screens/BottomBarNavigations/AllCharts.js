// import React, { useState, useEffect } from "react";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { fetchAllUsers } from "../../utils/api";
// import { Ionicons } from "@expo/vector-icons";

// export default function AllChatScreen({ navigation }) {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // For now, hardcode or get from your Login state
//   const [currentUserId, setCurrentUserId] = useState(null);

//   useEffect(() => {
//     const getStoredData = async () => {
//       try {
//         const stored = await AsyncStorage.getItem("userDetails");
//         if (stored) {
//           const user = JSON.parse(stored);
//           console.log("Logged in as:", user.id);
//           setCurrentUserId(user.id);
//         }
//       } catch (error) {
//         console.error("Error reading storage:", error);
//       }
//     };
//     getStoredData();
//   }, []);

//   useEffect(() => {
//     // Prevent the API call if currentUserId is still null
//     if (!currentUserId) return;

//     const getUsers = async () => {
//       try {
//         setLoading(true);
//         const data = await fetchAllUsers(currentUserId);
//         setUsers(data);
//       } catch (err) {
//         console.log("Failed to load users", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     getUsers();
//   }, [currentUserId]);

//   if (loading && !currentUserId) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center' }}>
//         <ActivityIndicator size="large" color="#6366f1" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//     <View style={Styles.container}>
//       <View style={Styles.header}>
//     <Text style={Styles.headerTitle}>Chats</Text>
// </View>

// <TouchableOpacity
//     style={Styles.searchBarTrigger}
//     onPress={() => navigation.navigate("Search", {
//        myId: currentUserId })}>
//     <Ionicons name="search" size={20} color="gray" />
//     <Text style={Styles.searchText}>Search Users...</Text>
// </TouchableOpacity>
//       <FlatList
//         data={users}
//         keyExtractor={(item) => item._id}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             style={Styles.userCard}
//             onPress={() => navigation.navigate("IndividualChats", {
//               recipient: item // Passing the whole user object to the next screen
//             })}
//           >
//             <Text style={Styles.userName}>{item.actual_name}</Text>
//             <Text style={Styles.userHandle}>@{item.username}</Text>
//           </TouchableOpacity>
//         )}
//       />
//     </View>
//     </SafeAreaView>
//   );
// }

// const Styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: 'white' },
//   userCard: { padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
//   userName: { fontSize: 18, fontWeight: 'bold' },
//   userHandle: { color: 'gray' },
//   searchBarTrigger: { flexDirection: 'row', backgroundColor: '#f1f5f9', margin: 15, padding: 12, borderRadius: 10, alignItems: 'center', gap: 10 },
//   searchText: { color: 'gray', fontSize: 16 }
// });






// import React, { useState, useEffect } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   Image,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { fetchRecentChats } from "../../utils/api";
// import { Ionicons } from "@expo/vector-icons";

// export default function AllChatScreen({ navigation }) {
//   const [chats, setChats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentUserId, setCurrentUserId] = useState(null);

//   useEffect(() => {
//     const init = async () => {
//       const stored = await AsyncStorage.getItem("userDetails");
//       if (stored) {
//         const user = JSON.parse(stored);
//         setCurrentUserId(user.id);
//       }
//     };
//     init();
//   }, []);

//   // Use useFocusEffect or a listener to refresh the list when user returns from a chat
//   useEffect(() => {
//     if (!currentUserId) return;
//     const unsubscribe = navigation.addListener("focus", loadChats);
//     return unsubscribe;
//   }, [currentUserId]);

//   const loadChats = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchRecentChats(currentUserId);
//       setChats(data);
//     } catch (err) {
//       console.log("Error loading chats", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
//       <View style={Styles.header}>
//         <Text style={Styles.headerTitle}>Messages</Text>
//       </View>

//       <TouchableOpacity
//         style={Styles.searchBarTrigger}
//         onPress={() => navigation.navigate("Search", { myId: currentUserId })}
//       >
//         <Ionicons name="search" size={20} color="gray" />
//         <Text style={{ color: "gray" }}>Search users to start chatting...</Text>
//       </TouchableOpacity>

//       <FlatList
//         data={chats}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => {
//           // 🚨 FIX: Fallback to username if actual_name is null
//           const displayName = item.actual_name || item.username || "User";

//           // 🚨 FIX: Use charAt(0) instead of [0] because it's safer for strings
//           const avatarLetter = displayName.charAt(0).toUpperCase();

//           return (
//             <TouchableOpacity
//               style={Styles.chatCard}
//               onPress={() =>
//                 navigation.navigate("IndividualChats", { recipient: item })
//               }
//             >
//               {/* Avatar with safe letter */}
//               <View style={Styles.avatar}>
//                 <Text style={Styles.avatarText}>{avatarLetter}</Text>
//               </View>

//               <View style={Styles.chatInfo}>
//                 <View style={Styles.row}>
//                   {/* Safe name display */}
//                   <Text style={Styles.userName}>{displayName}</Text>
//                   <Text style={Styles.time}>
//                     {formatTime(item.lastTimestamp)}
//                   </Text>
//                 </View>

//                 <Text style={Styles.lastMsg} numberOfLines={1}>
//                   {/* Logic to show a clean snippet instead of a long URL */}
//                   {item.lastMessageType === "text"
//                     ? item.lastMessage
//                     : `📷 Sent an ${item.lastMessageType}`}
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           );
//         }}
//         ListEmptyComponent={
//           <Text style={Styles.empty}>
//             No active chats. Use search to find friends!
//           </Text>
//         }
//       />
//     </SafeAreaView>
//   );
// }

// const Styles = StyleSheet.create({
//   header: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
//   headerTitle: { fontSize: 24, fontWeight: "bold" },
//   searchBarTrigger: {
//     flexDirection: "row",
//     backgroundColor: "#f1f5f9",
//     margin: 15,
//     padding: 12,
//     borderRadius: 25,
//     alignItems: "center",
//     gap: 10,
//   },
//   chatCard: { flexDirection: "row", padding: 15, alignItems: "center" },
//   avatar: {
//     width: 55,
//     height: 55,
//     borderRadius: 27.5,
//     backgroundColor: "#6366f1",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   avatarText: { color: "white", fontSize: 20, fontWeight: "bold" },
//   chatInfo: {
//     flex: 1,
//     marginLeft: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f1f5f9",
//     paddingBottom: 10,
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   userName: { fontSize: 17, fontWeight: "600" },
//   time: { fontSize: 12, color: "gray" },
//   lastMsg: { fontSize: 14, color: "#64748b", marginTop: 3 },
//   empty: { textAlign: "center", marginTop: 100, color: "gray" },
// });



//My latest working code until the refresh of the chat list is implemented

// import React, { useState, useEffect, useCallback } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl, // 👈 Added for better UX
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { fetchRecentChats } from "../../utils/api";
// import { Ionicons } from "@expo/vector-icons";

// export default function AllChatScreen({ navigation }) {
//   const [chats, setChats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false); // 👈 Pull to refresh state
//   const [currentUserId, setCurrentUserId] = useState(null);

//   // --- 1. INITIAL STARTUP ---
//   useEffect(() => {
//     const startup = async () => {
//       try {
//         setLoading(true);
//         const stored = await AsyncStorage.getItem("userDetails");
//         if (stored) {
//           const user = JSON.parse(stored);
//           setCurrentUserId(user.id);
          
//           // 🚨 THE FIX: Immediately load chats once we have the ID
//           // Don't wait for a navigation focus event on the first run
//           await loadChats(user.id);
//         }
//       } catch (error) {
//         console.error("Startup Error:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     startup();
//   }, []);

//   // --- 2. REFRESH ON RETURN ---
//   // This handles refreshing when you come back from the Individual Chat screen
//   useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', () => {
//       if (currentUserId) {
//         loadChats(currentUserId);
//       }
//     });
//     return unsubscribe;
//   }, [navigation, currentUserId]);

//   const loadChats = async (userId) => {
//     try {
//       // Use the passed userId or the state one
//       const targetId = userId || currentUserId;
//       if (!targetId) return;

//       const data = await fetchRecentChats(targetId);
//       setChats(data || []);
//     } catch (err) {
//       console.log("Error loading chats", err);
//     }
//   };

//   // --- 3. PULL TO REFRESH ---
//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     if (currentUserId) await loadChats(currentUserId);
//     setRefreshing(false);
//   }, [currentUserId]);

//   const formatTime = (timestamp) => {
//     if (!timestamp) return "";
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   };

//   if (loading && !refreshing) {
//     return (
//       <View style={Styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#6366f1" />
//         <Text style={{ marginTop: 10, color: '#6366f1' }}>Loading messages...</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
//       <View style={Styles.header}>
//         <Text style={Styles.headerTitle}>Messages</Text>
//       </View>

//       <TouchableOpacity
//         style={Styles.searchBarTrigger}
//         onPress={() => navigation.navigate("Search", { myId: currentUserId })}
//       >
//         <Ionicons name="search" size={20} color="gray" />
//         <Text style={{ color: "gray" }}>Search users to start chatting...</Text>
//       </TouchableOpacity>

//       <FlatList
//         data={chats}
//         keyExtractor={(item) => item.id}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//         renderItem={({ item }) => {
//           const displayName = item.actual_name || item.username || "User";
//           const avatarLetter = displayName.charAt(0).toUpperCase();

//           return (
//             <TouchableOpacity
//               style={Styles.chatCard}
//               onPress={() =>
//                 navigation.navigate("IndividualChats", { recipient: item })
//               }
//             >
//               <View style={Styles.avatar}>
//                 <Text style={Styles.avatarText}>{avatarLetter}</Text>
//               </View>

//               <View style={Styles.chatInfo}>
//                 <View style={Styles.row}>
//                   <Text style={Styles.userName}>{displayName}</Text>
//                   <Text style={Styles.time}>
//                     {formatTime(item.lastTimestamp)}
//                   </Text>
//                 </View>

//                 <Text style={Styles.lastMsg} numberOfLines={1}>
//                   {item.lastMessageType === "text"
//                     ? item.lastMessage
//                     : `📷 Sent an ${item.lastMessageType}`}
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           );
//         }}
//         ListEmptyComponent={
//           <Text style={Styles.empty}>
//             No active chats. Use search to find friends!
//           </Text>
//         }
//       />
//     </SafeAreaView>
//   );
// }

// const Styles = StyleSheet.create({
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
//   header: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
//   headerTitle: { fontSize: 24, fontWeight: "bold" },
//   searchBarTrigger: {
//     flexDirection: "row",
//     backgroundColor: "#f1f5f9",
//     margin: 15,
//     padding: 12,
//     borderRadius: 25,
//     alignItems: "center",
//     gap: 10,
//   },
//   chatCard: { flexDirection: "row", padding: 15, alignItems: "center" },
//   avatar: {
//     width: 55,
//     height: 55,
//     borderRadius: 27.5,
//     backgroundColor: "#6366f1",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   avatarText: { color: "white", fontSize: 20, fontWeight: "bold" },
//   chatInfo: {
//     flex: 1,
//     marginLeft: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f1f5f9",
//     paddingBottom: 10,
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   userName: { fontSize: 17, fontWeight: "600" },
//   time: { fontSize: 12, color: "gray" },
//   lastMsg: { fontSize: 14, color: "#64748b", marginTop: 3 },
//   empty: { textAlign: "center", marginTop: 100, color: "gray" },
// });



import React, { useState, useEffect, useCallback } from "react";
import { 
  SafeAreaView, View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, ActivityIndicator, RefreshControl 
} from "react-native";
import * as Contacts from 'expo-contacts';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchRecentChats, syncContactsApi, API_BASE_URL } from "../../utils/api";
import { Ionicons } from "@expo/vector-icons";

export default function AllChatScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // 👈 State for pull-to-refresh
  const [currentUserId, setCurrentUserId] = useState(null);

  // --- 1. INITIAL STARTUP ---
  useEffect(() => {
    const startup = async () => {
      try {
        const stored = await AsyncStorage.getItem("userDetails");
        if (stored) {
          const user = JSON.parse(stored);
          setCurrentUserId(user.id);
          await loadChats(user.id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    startup();
  }, []);

  // --- 2. AUTO-REFRESH ON FOCUS ---
  // This triggers every time you come back to this screen (e.g., from Chat or Search)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (currentUserId) {
        loadChats(currentUserId);
      }
    });
    return unsubscribe;
  }, [navigation, currentUserId]);

  const resolveUri = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL.replace("/api", "")}/${path.replace(/^\/+/, "")}`;
  };

  const loadChats = async (userId) => {
    try {
      const targetId = userId || currentUserId;
      if (!targetId) return;

      const data = await fetchRecentChats(targetId);

      const updatedData = data.map(chat => ({
        ...chat,
        profile_image: resolveUri(chat.profile_image),
      }));

      // console.log("Loaded chats:", updatedData);
      
      if (data && data.length > 0) {
        setChats(updatedData);
        setSuggestions([]); // Clear suggestions if active chats exist
      } else {
        setChats([]);
        handleContactSync(targetId);
      }
    } catch (err) {
      console.log("Error loading chats", err);
    }
  };

  // --- 3. MANUAL PULL-TO-REFRESH ---
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  }, [currentUserId]);

  const handleContactSync = async (myId) => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        if (data.length > 0) {
          const phoneNumbers = data
            .flatMap(contact => contact.phoneNumbers || [])
            .map(p => p.number)
            .filter(n => n != null);

          const matchedUsers = await syncContactsApi(myId, phoneNumbers);
          setSuggestions(matchedUsers);
        }
      }
    } catch (err) {
      console.log("Contact Sync Error:", err);
    }
  };

  const renderItem = ({ item, isSuggestion }) => {
    const displayName = item.actual_name || item.username || "User";
    const avatarLetter = displayName.charAt(0).toUpperCase();

    return (
      <TouchableOpacity 
        style={Styles.chatCard}
        onPress={() => navigation.navigate("IndividualChats", { recipient: item })}
      >
        <View style={[Styles.avatar, isSuggestion && { backgroundColor: '#10b981' }]}>
          {item.profile_image ? (
            <Image source={{ uri: resolveUri(item.profile_image) }} style={{ width: 55, height: 55, borderRadius: 27.5 }} />
          ) : (
            <Text style={Styles.avatarText}>{avatarLetter}</Text>
          )}
        </View>
        <View style={Styles.chatInfo}>
          <View style={Styles.row}>
            <Text style={Styles.userName}>{displayName}</Text>
            {!isSuggestion && item.lastTimestamp && (
              <Text style={Styles.time}>
                {new Date(item.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
          <Text style={Styles.lastMsg} numberOfLines={1}>
            {isSuggestion ? "Contact on SocialSafe" : (item.lastMessageType === 'text' ? item.lastMessage : `📷 ${item.lastMessageType}`)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={Styles.loader}><ActivityIndicator size="large" color="#6366f1" /></View>;

  return (
    <SafeAreaView style={{ flex: 1, marginTop: 30, backgroundColor: 'white' }}>
      <View style={Styles.header}><Text style={Styles.headerTitle}>Messages</Text></View>
      
      <TouchableOpacity style={Styles.searchBarTrigger} onPress={() => navigation.navigate("Search", { myId: currentUserId })}>
          <Ionicons name="search" size={20} color="gray" />
          <Text style={{color: 'gray'}}>Search users...</Text>
      </TouchableOpacity>

      <FlatList
        data={chats.length > 0 ? chats : suggestions}
        keyExtractor={(item) => item.id}
        // 🚨 ADD REFRESH CONTROL HERE
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={() => (
            chats.length === 0 && suggestions.length > 0 ? (
                <View style={Styles.suggestTitle}><Text style={Styles.suggestText}>PEOPLE YOU MAY KNOW</Text></View>
            ) : null
        )}
        renderItem={({ item }) => renderItem({ item, isSuggestion: chats.length === 0 })}
        ListEmptyComponent={<Text style={Styles.empty}>No messages. Try searching for users!</Text>}
      />
    </SafeAreaView>
  );
}

const Styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  searchBarTrigger: { flexDirection: "row", backgroundColor: "#f1f5f9", margin: 15, padding: 12, borderRadius: 25, alignItems: "center", gap: 10 },
  chatCard: { flexDirection: "row", padding: 15, alignItems: "center" },
  avatar: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: "#6366f1", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "white", fontSize: 20, fontWeight: "bold" },
  chatInfo: { flex: 1, marginLeft: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { fontSize: 17, fontWeight: "600" },
  time: { fontSize: 12, color: 'gray' },
  lastMsg: { fontSize: 14, color: "#64748b", marginTop: 3 },
  empty: { textAlign: "center", marginTop: 100, color: "gray" },
  suggestTitle: { padding: 15, backgroundColor: '#f0fdf4' },
  suggestText: { fontSize: 12, fontWeight: 'bold', color: '#10b981' }
});