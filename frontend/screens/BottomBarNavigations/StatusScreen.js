// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Image, TextInput, Alert, ActivityIndicator } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import * as ImagePicker from 'expo-image-picker';
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { fetchStatuses, postStatus } from "../../utils/api";

// const StatusScreen = () => {
//     // --- States ---
//     const [groupedStatuses, setGroupedStatuses] = useState([]);
//     const [viewerVisible, setViewerVisible] = useState(false);
//     const [currentStorySet, setCurrentStorySet] = useState(null);
//     const [storyIndex, setStoryIndex] = useState(0);

//     // Upload States
//     const [textModalVisible, setTextModalVisible] = useState(false);
//     const [statusText, setStatusText] = useState("");
//     const [loading, setLoading] = useState(false);

//     // Replace with your PC's IP or EXPO_PUBLIC_BASE_URL from .env
//     const API_BASE = process.env.EXPO_PUBLIC_BASE_URL || "http://192.168.0.106:8000";

//     useEffect(() => {
//         loadStatuses();
//     }, []);

//     const loadStatuses = async () => {
//         try {
//             const data = await fetchStatuses();
//             setGroupedStatuses(data);
//         } catch (e) {
//             console.log("Fetch Error:", e);
//         }
//     };

//     // --- Upload Logic ---
//     const handleMediaStatus = async (mediaType) => {
//         const result = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: mediaType === 'video' ? ['videos'] : ['images'],
//             allowsEditing: true,
//             quality: 0.5,
//         });

//         if (!result.canceled) {
//             uploadStatus(mediaType, null, result.assets[0].uri);
//         }
//     };

//     const uploadStatus = async (type, text, uri) => {
//         setLoading(true);
//         try {
//             const userString = await AsyncStorage.getItem("userDetails");
//             const user = JSON.parse(userString);

//             const formData = new FormData();
//             // Use 'id' or '_id' depending on your mapped local storage logic
//             formData.append("user_id", user.id || user._id);
//             formData.append("username", user.username);
//             formData.append("status_type", type);

//             if (type === 'text') {
//                 formData.append("content", text);
//             } else {
//                 const filename = uri.split('/').pop();
//                 formData.append("file", {
//                     uri: uri,
//                     name: filename,
//                     type: type === 'video' ? 'video/mp4' : 'image/jpeg',
//                 });
//             }

//             await postStatus(formData);
//             setTextModalVisible(false);
//             setStatusText("");
//             loadStatuses(); // Refresh the list
//             Alert.alert("Success", "Status uploaded!");
//         } catch (error) {
//             console.error(error);
//             Alert.alert("Error", "Failed to upload status");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // --- Viewing Logic ---
//     const openViewer = (userStory) => {
//         setCurrentStorySet(userStory);
//         setStoryIndex(0);
//         setViewerVisible(true);
//     };

//     const nextStory = () => {
//         if (storyIndex < currentStorySet.updates.length - 1) {
//             setStoryIndex(storyIndex + 1);
//         } else {
//             setViewerVisible(false);
//         }
//     };

//     return (
//         <SafeAreaView style={styles.container}>
//             <View style={styles.header}>
//                 <Text style={styles.headerTitle}>Status</Text>
//             </View>

//             <FlatList
//                 data={groupedStatuses}
//                 keyExtractor={(item) => item._id}
//                 renderItem={({ item }) => (
//                     <TouchableOpacity style={styles.statusItem} onPress={() => openViewer(item)}>
//                         <View style={[styles.avatarCircle, { borderColor: '#25D366', borderWidth: 2 }]}>
//                             <Ionicons name="person" size={30} color="#6366f1" />
//                         </View>
//                         <View>
//                             <Text style={styles.username}>{item.username}</Text>
//                             <Text style={styles.count}>{item.updates.length} updates</Text>
//                         </View>
//                     </TouchableOpacity>
//                 )}
//                 ListEmptyComponent={<Text style={styles.emptyText}>No recent updates</Text>}
//             />

//             {/* --- UPLOAD BUTTONS (The Missing Part) --- */}
//             <View style={styles.fabColumn}>
//                 <TouchableOpacity style={styles.fabSmall} onPress={() => setTextModalVisible(true)}>
//                     <MaterialIcons name="edit" size={24} color="#6366f1" />
//                 </TouchableOpacity>

//                 <TouchableOpacity style={styles.fabLarge} onPress={() => handleMediaStatus('image')}>
//                     <MaterialIcons name="photo_camera" size={28} color="white" />
//                 </TouchableOpacity>
//             </View>

//             {/* --- TEXT STATUS MODAL --- */}
//             <Modal visible={textModalVisible} animationType="slide">
//                 <View style={[styles.modalContainer, { backgroundColor: '#6366f1' }]}>
//                     <TouchableOpacity style={styles.closeModal} onPress={() => setTextModalVisible(false)}>
//                         <Ionicons name="close" size={30} color="white" />
//                     </TouchableOpacity>

//                     <TextInput
//                         style={styles.statusInput}
//                         placeholder="Type a status..."
//                         placeholderTextColor="rgba(255,255,255,0.6)"
//                         multiline
//                         value={statusText}
//                         onChangeText={setStatusText}
//                         autoFocus
//                     />

//                     <TouchableOpacity
//                         style={styles.sendButton}
//                         onPress={() => uploadStatus('text', statusText)}
//                         disabled={loading || !statusText.trim()}
//                     >
//                         {loading ? <ActivityIndicator color="white" /> : <Ionicons name="send" size={32} color="white" />}
//                     </TouchableOpacity>
//                 </View>
//             </Modal>

//             {/* --- STORY VIEWER MODAL --- */}
//             <Modal visible={viewerVisible} animationType="fade">
//                 <View style={styles.viewerContainer}>
//                     {currentStorySet && (
//                         <>
//                             <View style={styles.progressBarContainer}>
//                                 {currentStorySet.updates.map((_, i) => (
//                                     <View key={i} style={[styles.progressBar, { backgroundColor: i <= storyIndex ? 'white' : 'rgba(255,255,255,0.3)' }]} />
//                                 ))}
//                             </View>

//                             <TouchableOpacity style={styles.fullScreenTouch} onPress={nextStory}>
//                                 {currentStorySet.updates[storyIndex].type === 'text' ? (
//                                     <View style={styles.textStoryContainer}>
//                                         <Text style={styles.storyText}>{currentStorySet.updates[storyIndex].content}</Text>
//                                     </View>
//                                 ) : (
//                                     <Image
//                                         source={{ uri: `${API_BASE}${currentStorySet.updates[storyIndex].content}` }}
//                                         style={styles.fullImage}
//                                         resizeMode="contain"
//                                     />
//                                 )}
//                             </TouchableOpacity>

//                             <View style={styles.viewerHeader}>
//                                 <Text style={styles.viewerUser}>{currentStorySet.username}</Text>
//                                 <TouchableOpacity onPress={() => setViewerVisible(false)}>
//                                     <Ionicons name="close" size={30} color="white" />
//                                 </TouchableOpacity>
//                             </View>
//                         </>
//                     )}
//                 </View>
//             </Modal>
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: "#fff" },
//     header: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#eee", backgroundColor: '#fff' },
//     headerTitle: { fontSize: 24, fontWeight: "bold" },
//     statusItem: { flexDirection: "row", padding: 15, alignItems: "center" },
//     avatarCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', marginRight: 15 },
//     username: { fontSize: 16, fontWeight: "bold" },
//     count: { color: "gray", fontSize: 12 },
//     emptyText: { textAlign: 'center', marginTop: 50, color: 'gray' },

//     // FAB Styles
//     fabColumn: { position: "absolute", bottom: 30, right: 20, alignItems: "center" },
//     fabLarge: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#6366f1", justifyContent: "center", alignItems: "center", elevation: 5 },
//     fabSmall: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: "#e2e8f0", justifyContent: "center", alignItems: "center", marginBottom: 15, elevation: 3 },

//     // Modal / Viewer Styles
//     viewerContainer: { flex: 1, backgroundColor: 'black' },
//     viewerHeader: { position: 'absolute', top: 60, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//     viewerUser: { color: 'white', fontSize: 18, fontWeight: 'bold' },
//     fullScreenTouch: { flex: 1 },
//     fullImage: { width: '100%', height: '100%' },
//     textStoryContainer: { flex: 1, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', padding: 20 },
//     storyText: { color: 'white', fontSize: 28, textAlign: 'center' },
//     progressBarContainer: { position: 'absolute', top: 50, left: 10, right: 10, flexDirection: 'row', height: 3 },
//     progressBar: { flex: 1, marginHorizontal: 2, borderRadius: 2 },

//     modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
//     statusInput: { fontSize: 28, color: 'white', textAlign: 'center', width: '100%' },
//     sendButton: { position: 'absolute', bottom: 40, right: 30 },
//     closeModal: { position: 'absolute', top: 50, left: 20 }
// });

// export default StatusScreen;

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchStatuses, postStatus, deleteStatusApi } from "../../utils/api";

const StatusScreen = () => {
  const [myId, setMyId] = useState(null);
  const [groupedStatuses, setGroupedStatuses] = useState([]);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [currentStorySet, setCurrentStorySet] = useState(null);
  const [storyIndex, setStoryIndex] = useState(0);

  const [textModalVisible, setTextModalVisible] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE =
    process.env.EXPO_PUBLIC_BASE_URL || "http://192.168.0.106:8000";

  useEffect(() => {
    setupUser();
    loadStatuses();
  }, []);

  const setupUser = async () => {
    const userString = await AsyncStorage.getItem("userDetails");
    if (userString) {
      const user = JSON.parse(userString);
      setMyId(user.id || user._id);
    }
  };

  const loadStatuses = async () => {
    try {
      const data = await fetchStatuses();
      setGroupedStatuses(data);
    } catch (e) {
      console.log("Fetch Error:", e);
    }
  };

  // --- Logical Separation of "Me" vs "Others" ---
  const { myStatus, othersStatuses } = useMemo(() => {
    const me = groupedStatuses.find((item) => item._id === myId);
    const others = groupedStatuses.filter((item) => item._id !== myId);
    return { myStatus: me, othersStatuses: others };
  }, [groupedStatuses, myId]);

  // --- Upload Logic ---
  const triggerUploadMenu = () => {
    Alert.alert("Add Status", "What would you like to share?", [
      { text: "Text Status", onPress: () => setTextModalVisible(true) },
      { text: "Photo / Video", onPress: () => handleMediaStatus() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleMediaStatus = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      const type = result.assets[0].type === "video" ? "video" : "image";
      uploadStatus(type, null, result.assets[0].uri);
    }
  };

  const uploadStatus = async (type, text, uri) => {
    setLoading(true);
    try {
      const userString = await AsyncStorage.getItem("userDetails");
      const user = JSON.parse(userString);
      const formData = new FormData();
      formData.append("user_id", user.id || user._id);
      formData.append("username", user.username);
      formData.append("status_type", type);

      if (type === "text") {
        formData.append("content", text);
      } else {
        const filename = uri.split("/").pop();
        formData.append("file", {
          uri,
          name: filename,
          type: type === "video" ? "video/mp4" : "image/jpeg",
        });
      }

      await postStatus(formData);
      setTextModalVisible(false);
      setStatusText("");
      loadStatuses();
      Alert.alert("Success", "Status posted!");
    } catch (error) {
      Alert.alert("Error", "Failed to upload status");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStatus = async () => {
    const currentStatusId = currentStorySet.updates[storyIndex].id;

    Alert.alert(
      "Delete Status",
      "Are you sure you want to delete this update?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteStatusApi(currentStatusId, myId);

              // If it was the last update in the set, close viewer
              if (currentStorySet.updates.length === 1) {
                setViewerVisible(false);
              } else {
                // Otherwise, move to previous or next slide
                nextStory();
              }
              loadStatuses(); // Refresh list
            } catch (e) {
              Alert.alert("Error", "Could not delete status");
            }
          },
        },
      ],
    );
  };

  // --- Story Viewing ---
  const openViewer = (userStory) => {
    setCurrentStorySet(userStory);
    setStoryIndex(0);
    setViewerVisible(true);
  };

  const nextStory = () => {
    if (storyIndex < currentStorySet.updates.length - 1) {
      setStoryIndex(storyIndex + 1);
    } else {
      setViewerVisible(false);
    }
  };

  // --- Components ---
  const MyStatusHeader = () => (
    <View style={styles.myStatusSection}>
      <TouchableOpacity
        style={styles.statusItem}
        onPress={myStatus ? () => openViewer(myStatus) : triggerUploadMenu}
      >
        <View style={styles.avatarWrapper}>
          <View style={[styles.avatarCircle, myStatus && styles.activeRing]}>
            <Ionicons name="person" size={30} color="#6366f1" />
          </View>
          {!myStatus && (
            <View style={styles.plusIcon}>
              <Ionicons name="add-circle" size={22} color="#25D366" />
            </View>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.username}>My Status</Text>
          <Text style={styles.subtitle}>
            {myStatus ? "Tap to view your updates" : "Tap to add status update"}
          </Text>
        </View>
        {/* Secondary button to add more even if status exists */}
        {myStatus && (
          <TouchableOpacity
            onPress={triggerUploadMenu}
            style={styles.addIconSide}
          >
            <MaterialIcons
              name="add-photo-alternate"
              size={26}
              color="#6366f1"
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      <Text style={styles.sectionLabel}>Recent updates</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Status</Text>
      </View>

      <FlatList
        data={othersStatuses}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={MyStatusHeader}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.statusItem}
            onPress={() => openViewer(item)}
          >
            <View style={[styles.avatarCircle, styles.activeRing]}>
              <Ionicons name="person" size={30} color="#64748b" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.subtitle}>{item.updates.length} updates</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !othersStatuses.length && (
            <Text style={styles.emptyText}>No status updates from friends</Text>
          )
        }
      />

      {/* TEXT MODAL */}
      <Modal visible={textModalVisible} animationType="slide">
        <View style={[styles.modalContainer, { backgroundColor: "#6366f1" }]}>
          <TouchableOpacity
            style={styles.closeModal}
            onPress={() => setTextModalVisible(false)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <TextInput
            style={styles.statusInput}
            placeholder="Type a status..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            multiline
            value={statusText}
            onChangeText={setStatusText}
            autoFocus
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => uploadStatus("text", statusText)}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name="send" size={32} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </Modal>

      {/* VIEWER MODAL */}
      <Modal visible={viewerVisible} animationType="fade">
        <View style={styles.viewerContainer}>
          {currentStorySet && (
            <>
              {/* Progress Bars */}
              <View style={styles.progressBarContainer}>
                {currentStorySet.updates.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.progressBar,
                      {
                        backgroundColor:
                          i <= storyIndex ? "white" : "rgba(255,255,255,0.3)",
                      },
                    ]}
                  />
                ))}
              </View>

              {/* Main Content Area */}
              <TouchableOpacity
                style={styles.fullScreenTouch}
                onPress={nextStory}
                activeOpacity={1}
              >
                {currentStorySet.updates[storyIndex].type === "text" ? (
                  <View style={styles.textStoryContainer}>
                    <Text style={styles.storyText}>
                      {currentStorySet.updates[storyIndex].content}
                    </Text>
                  </View>
                ) : currentStorySet.updates[storyIndex].type === "video" ? (
                  <Video
                    source={{
                      uri: `${API_BASE}${currentStorySet.updates[storyIndex].content}`,
                    }}
                    style={styles.fullImage}
                    resizeMode="contain"
                    shouldPlay={true}
                    isLooping={false}
                    useNativeControls={false}
                    onPlaybackStatusUpdate={(status) => {
                      // 🚨 Auto-advance to next status when video ends
                      if (status.didJustFinish) {
                        nextStory();
                      }
                    }}
                  />
                ) : (
                  <Image
                    source={{
                      uri: `${API_BASE}${currentStorySet.updates[storyIndex].content}`,
                    }}
                    style={styles.fullImage}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>

              {/* Header Overlay */}
              <View style={styles.viewerHeader}>
                <View>
                  <Text style={styles.viewerUser}>
                    {currentStorySet.username}
                  </Text>
                  <Text style={styles.viewerTime}>
                    {new Date(
                      currentStorySet.updates[storyIndex].created_at,
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>

                <View style={styles.headerActions}>
                  {currentStorySet._id === myId && (
                    <TouchableOpacity
                      onPress={handleDeleteStatus}
                      style={styles.iconGap}
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={28}
                        color="white"
                      />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => setViewerVisible(false)}>
                    <Ionicons name="close" size={32} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#1e293b" },
  myStatusSection: { backgroundColor: "#fff" },
  statusItem: { flexDirection: "row", padding: 15, alignItems: "center" },
  avatarWrapper: { position: "relative" },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    marginRight: 15,
  },
  activeRing: { borderColor: "#25D366", borderWidth: 2.5 },
  plusIcon: {
    position: "absolute",
    bottom: 0,
    right: 12,
    backgroundColor: "white",
    borderRadius: 12,
  },
  textContainer: { flex: 1 },
  username: { fontSize: 16, fontWeight: "bold", color: "#1e293b" },
  subtitle: { color: "gray", fontSize: 13, marginTop: 2 },
  addIconSide: { padding: 5 },
  sectionLabel: {
    padding: 12,
    fontSize: 13,
    fontWeight: "bold",
    color: "#6366f1",
    backgroundColor: "#f8fafc",
  },
  emptyText: { textAlign: "center", marginTop: 30, color: "gray" },

  // Story Viewer
  viewerContainer: { flex: 1, backgroundColor: "black" },
  viewerHeader: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  viewerUser: { color: "white", fontSize: 18, fontWeight: "bold" },
  fullScreenTouch: { flex: 1 },
  fullImage: { width: "100%", height: "100%" },
  textStoryContainer: {
    flex: 1,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  storyText: {
    color: "white",
    fontSize: 28,
    textAlign: "center",
    fontWeight: "bold",
  },
  progressBarContainer: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    flexDirection: "row",
    height: 3,
    zIndex: 10,
  },
  progressBar: { flex: 1, marginHorizontal: 2, borderRadius: 2 },

  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  statusInput: {
    fontSize: 28,
    color: "white",
    textAlign: "center",
    width: "100%",
  },
  sendButton: { position: "absolute", bottom: 40, right: 30 },
  closeModal: { position: "absolute", top: 50, left: 20 },
  viewerHeader: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  headerActions: { flexDirection: "row", alignItems: "center" },
  iconGap: { marginRight: 20 },
  viewerTime: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
});

export default StatusScreen;
