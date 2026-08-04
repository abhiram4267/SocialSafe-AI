// import React, { useMemo } from "react";
// import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, Alert } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import { clearChatApi, toggleBlockApi, API_BASE_URL } from "../../utils/api";

// export default function InfoScreen({ route, navigation }) {
//   const { recipient, currentUserId, messages } = route.params;

//   // Filter messages to find only images and videos for the "Media" section
//   const sharedMedia = useMemo(() => {
//     return messages.filter(m => m.type === "image" || m.type === "video");
//   }, [messages]);

//   const resolveUri = (path) => {
//     if (!path || path.startsWith("http")) return path;
//     return `${API_BASE_URL.replace("/api", "")}/${path.replace(/^\/+/, "")}`;
//   };

//   const handleClearChat = () => {
//     Alert.alert("Clear Chat", "Delete all messages in this conversation?", [
//       { text: "Cancel", style: "cancel" },
//       { text: "Clear", style: "destructive", onPress: async () => {
//           await clearChatApi(currentUserId, recipient.id || recipient._id);
//           navigation.navigate("Home"); // Redirect to All Chats
//       }}
//     ]);
//   };

//   const handleToggleBlock = () => {
//     Alert.alert("Block User", `Are you sure you want to block ${recipient.username}?`, [
//       { text: "Cancel" },
//       { text: "Block", style: "destructive", onPress: async () => {
//           await toggleBlockApi(currentUserId, recipient.id || recipient._id, "block");
//           navigation.navigate("Home");
//       }}
//     ]);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView>
//         {/* Profile Image & Names */}
//         <View style={styles.centerSection}>
//           <Image 
//             source={recipient.profile_image ? { uri: resolveUri(recipient.profile_image) } : require('../../assets/default-avatar.webp')} 
//             style={styles.largeAvatar} 
//           />
//           <Text style={styles.actualName}>{recipient.actual_name || "No Name"}</Text>
//           <Text style={styles.userName}>@{recipient.username}</Text>
//         </View>

//         {/* Media Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Shared Media ({sharedMedia.length})</Text>
//           {sharedMedia.length > 0 ? (
//             <FlatList
//               horizontal
//               data={sharedMedia}
//               keyExtractor={(item) => item.id}
//               renderItem={({ item }) => (
//                 <Image source={{ uri: item.content }} style={styles.mediaThumb} />
//               )}
//               showsHorizontalScrollIndicator={false}
//             />
//           ) : (
//             <Text style={styles.emptyText}>No media shared yet</Text>
//           )}
//         </View>

//         {/* Settings / Actions */}
//         <View style={styles.section}>
//           <TouchableOpacity style={styles.actionRow} onPress={handleClearChat}>
//             <MaterialIcons name="delete-sweep" size={24} color="#6366f1" />
//             <Text style={styles.actionText}>Clear Chat History</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.actionRow} onPress={handleToggleBlock}>
//             <MaterialIcons name="block" size={24} color="#ef4444" />
//             <Text style={[styles.actionText, { color: "#ef4444" }]}>Block {recipient.username}</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f8fafc" },
//   centerSection: { alignItems: 'center', padding: 30, backgroundColor: '#fff' },
//   largeAvatar: { width: 150, height: 150, borderRadius: 75, marginBottom: 15 },
//   actualName: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
//   userName: { fontSize: 16, color: '#64748b' },
//   section: { backgroundColor: '#fff', marginTop: 15, padding: 15 },
//   sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#6366f1', marginBottom: 10, textTransform: 'uppercase' },
//   mediaThumb: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
//   actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
//   actionText: { fontSize: 16, marginLeft: 15, fontWeight: '500' },
//   emptyText: { color: 'gray', fontStyle: 'italic' }
// });



import React, { useMemo, useState, useEffect } from "react"; // 🚨 Added useState, useEffect
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { clearChatApi, toggleBlockApi, API_BASE_URL, getProfileApi } from "../../utils/api"; // 🚨 Added getProfileApi

export default function InfoScreen({ route, navigation }) {
  const { recipient, currentUserId, messages } = route.params;
  
  // 🚨 NEW STATE: To hold up-to-date data from backend
  const [fullDetails, setFullDetails] = useState(recipient);
  const [loading, setLoading] = useState(true);

  // Filter messages for images
  const sharedMedia = useMemo(() => {
    return messages.filter(m => m.type === "image");
  }, [messages]);

  // 🚀 API CALL: Fetch latest bio and last_seen
  useEffect(() => {
    const fetchLatestInfo = async () => {
      try {
        const userId = recipient.id || recipient._id;
        const data = await getProfileApi(userId);
        if (data) {
          setFullDetails(data);
        }
      } catch (error) {
        console.error("Error fetching latest contact info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestInfo();
  }, [recipient]);

  const resolveUri = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) {
        const currentBaseUrl = API_BASE_URL.replace("/api", "");
        const urlParts = path.split("/static/");
        return urlParts.length > 1 ? `${currentBaseUrl}/static/${urlParts[1]}` : path;
    }
    return `${API_BASE_URL.replace("/api", "")}/${path.replace(/^\/+/, "")}`;
  };

  const formatLastSeen = (dateString) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleClearChat = () => {
    Alert.alert("Clear Chat", "Delete all messages?", [
      { text: "Cancel" },
      { text: "Clear", style: "destructive", onPress: async () => {
          await clearChatApi(currentUserId, recipient.id || recipient._id);
          navigation.navigate("Home");
      }}
    ]);
  };

  const handleToggleBlock = () => {
    Alert.alert("Block User", `Block ${recipient.username}?`, [
      { text: "Cancel" },
      { text: "Block", style: "destructive", onPress: async () => {
          await toggleBlockApi(currentUserId, recipient.id || recipient._id, "block");
          navigation.navigate("Home");
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>Contact Info</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Image & Names */}
        <View style={styles.centerSection}>
          <Image 
            source={fullDetails.profile_image ? { uri: resolveUri(fullDetails.profile_image) } : require('../../assets/default-avatar.webp')} 
            style={styles.largeAvatar} 
          />
          <Text style={styles.actualName}>{fullDetails.actual_name || "SocialSafe User"}</Text>
          <Text style={styles.userName}>@{fullDetails.username}</Text>
        </View>

        {/* 🆕 BIO & LAST SEEN SECTION - Now uses fullDetails */}
        <View style={styles.section}>
            <View style={styles.infoBlock}>
                <Text style={styles.sectionTitle}>About / Bio</Text>
                {loading ? (
                    <ActivityIndicator size="small" color="#6366f1" style={{ alignSelf: 'flex-start' }} />
                ) : (
                    <Text style={styles.bioContent}>{fullDetails.bio || "No bio set"}</Text>
                )}
            </View>
            <View style={[styles.divider, { marginVertical: 15 }]} />
            <View style={styles.infoBlock}>
                <Text style={styles.sectionTitle}>Last Seen</Text>
                <Text style={styles.infoContent}>
                    {fullDetails.is_online ? <Text style={{color: '#22c55e', fontWeight: 'bold'}}>Online</Text> : formatLastSeen(fullDetails.last_seen)}
                </Text>
            </View>
        </View>

        {/* Media Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shared Media ({sharedMedia.length})</Text>
          {sharedMedia.length > 0 ? (
            <FlatList
              horizontal
              data={sharedMedia}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Image source={{ uri: resolveUri(item.content || item.text) }} style={styles.mediaThumb} />
              )}
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.emptyText}>No media shared yet</Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionRow} onPress={handleClearChat}>
            <MaterialIcons name="delete-sweep" size={24} color="#6366f1" />
            <Text style={styles.actionText}>Clear Chat History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleToggleBlock}>
            <MaterialIcons name="block" size={24} color="#ef4444" />
            <Text style={[styles.actionText, { color: "#ef4444" }]}>Block {fullDetails.username}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  topNav: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff' },
  topNavTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 20 },
  centerSection: { alignItems: 'center', padding: 30, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  largeAvatar: { width: 140, height: 140, borderRadius: 70, marginBottom: 15 },
  actualName: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  userName: { fontSize: 16, color: '#64748b' },
  section: { backgroundColor: '#fff', marginTop: 12, padding: 15 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#6366f1', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  bioContent: { fontSize: 16, color: '#333', lineHeight: 22 },
  infoContent: { fontSize: 15, color: '#475569' },
  mediaThumb: { width: 90, height: 90, borderRadius: 10, marginRight: 12, backgroundColor: '#f1f5f9' },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  actionText: { fontSize: 16, marginLeft: 15, fontWeight: '600' },
  emptyText: { color: 'gray', fontStyle: 'italic', marginTop: 5 },
  divider: { height: 1, backgroundColor: '#f1f5f9' }
});