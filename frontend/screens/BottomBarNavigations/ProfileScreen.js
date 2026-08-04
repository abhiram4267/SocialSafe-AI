// import React from "react";
// import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { MaterialIcons } from "@expo/vector-icons";

// const ProfileScreen = () => {
//     const navigation = useNavigation();

//     const handleLogout = async () => {
//         Alert.alert(
//             "Logout",
//             "Are you sure you want to log out?",
//             [
//                 {
//                     text: "Cancel",
//                     style: "cancel"
//                 },
//                 {
//                     text: "Logout",
//                     style: "destructive",
//                     onPress: async () => {
//                         try {
//                             // 1. Remove the stored data
//                             await AsyncStorage.multiRemove(["isLoggedIn", "userDetails"]);

//                             // 2. Reset the navigation to the Login screen
//                             // We use reset so the user cannot press the back button to return to the app
//                             navigation.reset({
//                                 index: 0,
//                                 routes: [{ name: "Login" }],
//                             });
//                         } catch (error) {
//                             console.error("Error during logout:", error);
//                             Alert.alert("Error", "Could not log out. Please try again.");
//                         }
//                     }
//                 }
//             ]
//         );
//     };

//     return (
//         <SafeAreaView style={styles.container}>
//             <View style={styles.header}>
//                 <Text style={styles.headerTitle}>Status</Text>
//             </View>

//             <View style={styles.content}>
//                 <Text style={styles.text}>Status features coming soon...</Text>
//             </View>

//             {/* Logout Button */}
//             <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//                 <MaterialIcons name="logout" size={24} color="white" />
//                 <Text style={styles.logoutText}>Logout</Text>
//             </TouchableOpacity>
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "#f8fafc",
//     },
//     header: {
//         padding: 20,
//         backgroundColor: "#fff",
//         borderBottomWidth: 1,
//         borderBottomColor: "#eee",
//     },
//     headerTitle: {
//         fontSize: 24,
//         fontWeight: "bold",
//         color: "#333",
//     },
//     content: {
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//     },
//     text: {
//         fontSize: 16,
//         color: "#64748b",
//     },
//     logoutButton: {
//         flexDirection: "row",
//         backgroundColor: "#ef4444", // Red color
//         margin: 20,
//         padding: 15,
//         borderRadius: 12,
//         justifyContent: "center",
//         alignItems: "center",
//         elevation: 2,
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//     },
//     logoutText: {
//         color: "white",
//         fontWeight: "bold",
//         fontSize: 16,
//         marginLeft: 10,
//     }
// });

// export default ProfileScreen;







// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   Image,
//   ScrollView,
//   TextInput,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
// import * as ImagePicker from 'expo-image-picker';

// const ProfileScreen = () => {
//   const navigation = useNavigation();
//   const [userData, setUserData] = useState({
//     username: "User Name",
//     email: "user@gmail.com",
//     phone: "+91 98765 43210",
//     bio: "Hey there! I am using SocialSafe-AI",
//     dob: "01-01-2000",
//     profile_image: null,
//   });

//   useEffect(() => {
//     loadUserData();
//   }, []);

//   const loadUserData = async () => {
//     try {
//       const savedData = await AsyncStorage.getItem("userDetails");
//       if (savedData) {
//         const parsed = JSON.parse(savedData);
//         setUserData(prev => ({ ...prev, ...parsed }));
//       }
//     } catch (e) {
//       console.log("Failed to load user data");
//     }
//   };

//   const pickImage = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.5,
//     });

//     if (!result.canceled) {
//       setUserData({ ...userData, profileImage: result.assets[0].uri });
//       // In a real app, you would upload this to your backend here
//     }
//   };

//   const saveProfile = async () => {
//     const user = JSON.parse(await AsyncStorage.getItem("userDetails"));
//     const formData = new FormData();

//     formData.append("user_id", user._id);
//     formData.append("username", userData.username);
//     formData.append("bio", userData.bio);
//     formData.append("dob", userData.dob);
//     formData.append("phone", userData.phone);

//     if (userData.profile_image && userData.profile_image.startsWith('file ://')) {
//         formData.append("file", {
//             uri: userData.profile_image,
//             name: "profile.jpg",
//             type: "image/jpeg"
//         });
//     }

//     try {
//         const response = await updateProfileApi(formData);
//         // Save new details to storage
//         await AsyncStorage.setItem("userDetails", JSON.stringify(response.user));
//         Alert.alert("Success", "Profile updated!");
//     } catch (err) {
//         Alert.alert("Error", err);
//     }
// };

//   const handleLogout = async () => {
//     Alert.alert("Logout", "Are you sure you want to log out?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Logout",
//         style: "destructive",
//         onPress: async () => {
//           await AsyncStorage.multiRemove(["isLoggedIn", "userDetails"]);
//           navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//         },
//       },
//     ]);
//   };

//   const SettingItem = ({ icon, title, subtitle, onPress, color = "#64748b" }) => (
//     <TouchableOpacity style={styles.settingRow} onPress={onPress}>
//       <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
//         <MaterialIcons name={icon} size={22} color={color} />
//       </View>
//       <View style={styles.settingTextContainer}>
//         <Text style={styles.settingTitle}>{title}</Text>
//         {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
//       </View>
//       <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Settings</Text>
//         <TouchableOpacity>
//           <Ionicons name="settings-outline" size={24} color="#333" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Profile Card */}
//         <View style={styles.profileCard}>
//           <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
//             {userData.profile_image ? (
//               <Image source={{ uri: userData.profile_image }} style={styles.avatar} />
//             ) : (
//               <View style={styles.defaultAvatar}>
//                 <FontAwesome5 name="user" size={40} color="#94a3b8" />
//               </View>
//             )}
//             <View style={styles.cameraIcon}>
//               <MaterialIcons name="camera-alt" size={18} color="white" />
//             </View>
//           </TouchableOpacity>

//           <View style={styles.profileInfo}>
//             <Text style={styles.userNameText}>{userData.username}</Text>
//             <Text style={styles.userBioText} numberOfLines={1}>{userData.bio}</Text>
//           </View>
//         </View>

//         {/* Personal Information Group */}
//         <View style={styles.section}>
//           <Text style={styles.sectionHeader}>Personal Information</Text>
//           <SettingItem
//             icon="person-outline"
//             title="Username"
//             subtitle={userData.username}
//             color="#6366f1"
//             onPress={() => Alert.alert("Edit Username", "Navigate to edit screen")}
//           />
//           <SettingItem
//             icon="info-outline"
//             title="About"
//             subtitle={userData.bio}
//             color="#0ea5e9"
//             onPress={() => {}}
//           />
//           <SettingItem
//             icon="cake"
//             title="Date of Birth"
//             subtitle={userData.dob}
//             color="#f43f5e"
//             onPress={() => {}}
//           />
//           <SettingItem
//             icon="phone"
//             title="Phone"
//             subtitle={userData.phone}
//             color="#22c55e"
//             onPress={() => {}}
//           />
//         </View>

//         {/* Settings Group */}
//         <View style={styles.section}>
//           <Text style={styles.sectionHeader}>App Settings</Text>
//           <SettingItem icon="lock-outline" title="Account & Privacy" color="#64748b" />
//           <SettingItem icon="notifications-none" title="Notifications" color="#f59e0b" />
//           <SettingItem icon="data-usage" title="Storage and Data" color="#8b5cf6" />
//           <SettingItem icon="help-outline" title="Help & Support" color="#10b981" />
//         </View>

//         {/* Logout */}
//         <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//           <MaterialIcons name="logout" size={22} color="#ef4444" />
//           <Text style={styles.logoutText}>Log Out</Text>
//         </TouchableOpacity>

//         <Text style={styles.versionText}>SocialSafe-AI v1.0.2</Text>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8fafc",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     backgroundColor: "#fff",
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#1e293b",
//   },
//   profileCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "#fff",
//     marginBottom: 10,
//   },
//   imageWrapper: {
//     position: "relative",
//   },
//   avatar: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//   },
//   defaultAvatar: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: "#f1f5f9",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   cameraIcon: {
//     position: "absolute",
//     bottom: 0,
//     right: 0,
//     backgroundColor: "#6366f1",
//     padding: 6,
//     borderRadius: 15,
//     borderWidth: 2,
//     borderColor: "#fff",
//   },
//   profileInfo: {
//     marginLeft: 20,
//     flex: 1,
//   },
//   userNameText: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#1e293b",
//   },
//   userBioText: {
//     fontSize: 14,
//     color: "#64748b",
//     marginTop: 4,
//   },
//   section: {
//     backgroundColor: "#fff",
//     marginBottom: 10,
//     paddingVertical: 10,
//   },
//   sectionHeader: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#6366f1",
//     textTransform: "uppercase",
//     paddingHorizontal: 20,
//     marginBottom: 10,
//     letterSpacing: 1,
//   },
//   settingRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//   },
//   iconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 10,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   settingTextContainer: {
//     flex: 1,
//     marginLeft: 15,
//   },
//   settingTitle: {
//     fontSize: 16,
//     fontWeight: "500",
//     color: "#1e293b",
//   },
//   settingSubtitle: {
//     fontSize: 13,
//     color: "#94a3b8",
//     marginTop: 2,
//   },
//   logoutButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#fff",
//     paddingVertical: 15,
//     marginTop: 10,
//     borderTopWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: "#f1f5f9",
//   },
//   logoutText: {
//     color: "#ef4444",
//     fontWeight: "600",
//     fontSize: 16,
//     marginLeft: 10,
//   },
//   versionText: {
//     textAlign: "center",
//     color: "#cbd5e1",
//     fontSize: 12,
//     marginVertical: 20,
//   }
// });

// export default ProfileScreen;






// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
// import * as ImagePicker from "expo-image-picker";
// import { updateProfileApi, API_BASE_URL } from "../../utils/api"; // Ensure this matches your path

// const ProfileScreen = () => {
//   const navigation = useNavigation();
//   const [uploading, setUploading] = useState(false);
//   const [userData, setUserData] = useState({
//     _id: "",
//     username: "User Name",
//     email: "user@gmail.com",
//     phone: "",
//     bio: "Hey there!",
//     dob: "",
//     profile_image: null,
//   });

//   // Your Backend Base URL for images
//   const API_BASE = API_BASE_URL.replace("/api", "");

//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadUserData();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const loadUserData = async () => {
//     const savedData = await AsyncStorage.getItem("userDetails");
//     if (savedData) setUserData(JSON.parse(savedData));
//   };

//   // --- IMAGE PICKER LOGIC ---
//   const pickImage = async () => {
//     // Request permission
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "Permission Denied",
//         "We need access to your gallery to change your picture.",
//       );
//       return;
//     }

//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ["images"],
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.5,
//     });

//     if (!result.canceled) {
//       uploadProfileImage(result.assets[0].uri);
//     }
//   };

//   // --- UPLOAD TO BACKEND ---
//   const uploadProfileImage = async (uri) => {
//     setUploading(true);
//     try {
//       const formData = new FormData();

//       // Ensure _id exists. If using MongoDB, it is usually ._id
//       const uid = userData._id || userData.id;
//       if (!uid) {
//         Alert.alert("Error", "User ID not found. Please log in again.");
//         return;
//       }

//       formData.append("user_id", String(uid));
//       formData.append("username", String(userData.username || ""));
//       formData.append("bio", String(userData.bio || ""));
//       formData.append("dob", String(userData.dob || ""));
//       formData.append("phone", String(userData.phone || ""));

//       if (uri) {
//         const filename = uri.split("/").pop();
//         const match = /\.(\w+)$/.exec(filename);
//         const type = match ? `image/${match[1]}` : `image/jpeg`;

//         formData.append("file", {
//           uri: uri,
//           name: filename,
//           type: type,
//         });
//       }

//       console.log("Sending FormData:", formData); // Debug line

//       const response = await updateProfileApi(formData);
//       console.log("Backend Response User Object:", response.user);

//       if (response.user) {

//         const formattedUser = {
//         ...response.user,
//         id: response.user._id, // 👈 Explicitly map _id to id
//     };

//         // Save new user details (including the new image path) to AsyncStorage
//         await AsyncStorage.setItem(
//           "userDetails",
//           JSON.stringify(formattedUser),
//         );
//         setUserData(formattedUser);
//         Alert.alert("Success", "Profile picture updated!");
//       }
//     } catch (error) {
//       console.error(error);
//       Alert.alert("Upload Failed", "Could not update profile image.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const InfoRow = ({ icon, label, value }) => (
//     <View style={styles.infoRow}>
//       <Ionicons name={icon} size={22} color="#6366f1" style={styles.infoIcon} />
//       <View>
//         <Text style={styles.infoLabel}>{label}</Text>
//         <Text style={styles.infoValue}>{value || "Not Set"}</Text>
//       </View>
//     </View>
//   );

//   // Helper to determine image source
//   const getImageSource = () => {
//   if (userData.profile_image) {
//     let imagePath = userData.profile_image;

//     // 1. Convert backslashes (Windows) to forward slashes
//     imagePath = imagePath.replace(/\\/g, "/");

//     // 2. Ensure leading slash
//     const relativePath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    
//     // 3. Construct URL with a Cache Buster (Timestamp)
//     // This tells React Native: "This is a new image, don't use the old cached one"
//     const finalUri = `${API_BASE}${relativePath}?t=${new Date().getTime()}`;
    
//     console.log("📸 Attempting to load URI:", finalUri);
    
//     return { uri: finalUri };
//   }
//   // Fallback to default
//   return require("../../assets/default-avatar.webp");
// };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Profile</Text>
//         <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
//           <Ionicons name="settings-outline" size={26} color="#333" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollBody}>
//         <View style={styles.imageContainer}>
//           <TouchableOpacity onPress={pickImage} disabled={uploading}>
//             <Image source={getImageSource()} style={styles.avatar} />
//             {uploading ? (
//               <View style={styles.loaderOverlay}>
//                 <ActivityIndicator color="#fff" />
//               </View>
//             ) : (
//               <View style={styles.cameraBadge}>
//                 <Ionicons name="camera" size={18} color="white" />
//               </View>
//             )}
//           </TouchableOpacity>
//           <Text style={styles.nameText}>{userData.username}</Text>
//           <Text style={styles.bioText}>{userData.bio}</Text>
//         </View>

//         <View style={styles.infoSection}>
//           <InfoRow icon="mail-outline" label="Email" value={userData.email} />
//           <InfoRow icon="call-outline" label="Phone" value={userData.phone} />
//           <InfoRow
//             icon="calendar-outline"
//             label="Date of Birth"
//             value={userData.dob}
//           />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 20,
//   },
//   headerTitle: { fontSize: 24, fontWeight: "bold" },
//   scrollBody: { alignItems: "center", paddingBottom: 30 },
//   imageContainer: { alignItems: "center", marginVertical: 20 },
//   avatar: {
//     width: 130,
//     height: 130,
//     borderRadius: 65,
//     backgroundColor: "#f0f0f0",
//   },
//   cameraBadge: {
//     position: "absolute",
//     bottom: 5,
//     right: 5,
//     backgroundColor: "#6366f1",
//     padding: 8,
//     borderRadius: 20,
//     borderWidth: 3,
//     borderColor: "#fff",
//   },
//   loaderOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.4)",
//     borderRadius: 65,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   nameText: { fontSize: 22, fontWeight: "bold", marginTop: 15 },
//   bioText: {
//     fontSize: 16,
//     color: "gray",
//     marginTop: 5,
//     paddingHorizontal: 40,
//     textAlign: "center",
//   },
//   infoSection: { width: "100%", paddingHorizontal: 25, marginTop: 20 },
//   infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
//   infoIcon: { marginRight: 20 },
//   infoLabel: { fontSize: 12, color: "gray", textTransform: "uppercase" },
//   infoValue: { fontSize: 16, color: "#333", fontWeight: "500" },
// });

// export default ProfileScreen;




//My last working code all perfect
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { updateProfileApi, API_BASE_URL } from "../../utils/api";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [editType, setEditType] = useState(null); 
  const [tempValue, setTempValue] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);

  const [userData, setUserData] = useState({
    id: "",
    username: "User Name",
    email: "user@gmail.com",
    phone: "",
    bio: "Hey there!",
    dob: "",
    profile_image: null,
  });

  const API_BASE = API_BASE_URL.replace("/api", "");

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadUserData);
    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    const savedData = await AsyncStorage.getItem("userDetails");
    if (savedData) setUserData(JSON.parse(savedData));
  };

  const getImageSource = () => {
    if (userData.profile_image) {
      const path = userData.profile_image.replace(/\\/g, "/");
      const cleanPath = path.startsWith("/") ? path : `/${path}`;
      return { uri: `${API_BASE}${cleanPath}?t=${new Date().getTime()}` };
    }
    return require("../../assets/default-avatar.webp");
  };

  const performUpdate = async (type, value) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", userData.id || userData._id);
      formData.append("username", userData.username);
      formData.append("phone", userData.phone);
      formData.append("bio", type === "bio" ? value : userData.bio || "");
      formData.append("dob", type === "dob" ? value : userData.dob || "");

      if (type === "image") {
        formData.append("file", {
          uri: value,
          name: "profile.jpg",
          type: "image/jpeg",
        });
      }

      const response = await updateProfileApi(formData);
      const updatedUser = { ...response.user, id: response.user._id };
      await AsyncStorage.setItem("userDetails", JSON.stringify(updatedUser));
      setUserData(updatedUser);
      setModalVisible(false);
      if (type !== 'image') Alert.alert("Success", "Profile updated!");
    } catch (err) {
      Alert.alert("Error", "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (type, currentVal) => {
    setEditType(type);
    setTempValue(currentVal || "");
    setModalVisible(true);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) performUpdate("image", result.assets[0].uri);
  };

  const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // 1. Remove the stored data
                            await AsyncStorage.multiRemove(["isLoggedIn", "userDetails", "recent_searches"]);

                            // 2. Reset the navigation to the Login screen
                            // We use reset so the user cannot press the back button to return to the app
                            navigation.reset({
                                index: 0,
                                routes: [{ name: "Login" }],
                            });
                        } catch (error) {
                            console.error("Error during logout:", error);
                            Alert.alert("Error", "Could not log out. Please try again.");
                        }
                    }
                }
            ]
        );
    };

  // 🚨 MODIFIED Component: Added isEditable prop
  const SettingItem = ({ icon, title, subtitle, onPress, color = "#64748b", isEditable = false }) => (
    <TouchableOpacity 
      style={styles.settingRow} 
      onPress={isEditable ? onPress : null} // Clickable ONLY if editable
      activeOpacity={isEditable ? 0.7 : 1}   // No click feedback if not editable
    >
      <View style={[styles.iconContainer, { backgroundColor: color + "15" }]}>
        <MaterialIcons name={icon} size={22} color={color} />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle || "Not set"}</Text>
      </View>
      {/* 🚨 ICON shows ONLY if editable is true */}
      {isEditable && <MaterialIcons name="edit" size={18} color="#cbd5e1" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => handleLogout()}>
          <MaterialIcons name="logout" size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
            <Image source={getImageSource()} style={styles.avatar} />
            <View style={styles.cameraIcon}>
              <MaterialIcons name="camera-alt" size={14} color="white" />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.userNameText}>{userData.username}</Text>
            <Text style={styles.userBioText}>{userData.bio}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Personal Information</Text>
          
          {/* ❌ NON-EDITABLE (isEditable={false}) */}
          <SettingItem icon="person" title="Username" subtitle={userData.username} color="#6366f1" isEditable={false} />
          
          {/* ✅ EDITABLE (isEditable={true}) */}
          <SettingItem 
            icon="info" 
            title="About" 
            subtitle={userData.bio} 
            color="#0ea5e9"
            isEditable={true}
            onPress={() => openEditModal('bio', userData.bio)}
          />
          
          {/* ✅ EDITABLE (isEditable={true}) */}
          <SettingItem 
            icon="cake" 
            title="Date of Birth" 
            subtitle={userData.dob} 
            color="#f43f5e" 
            isEditable={true}
            onPress={() => openEditModal('dob', userData.dob)}
          />
          
          {/* ❌ NON-EDITABLE (isEditable={false}) */}
          <SettingItem icon="phone" title="Phone" subtitle={userData.phone} color="#22c55e" isEditable={false} />
        </View>

        <View style={styles.section}>
           <Text style={styles.sectionHeader}>App Settings</Text>
           <SettingItem icon="lock-outline" title="Account & Privacy" color="#64748b" isEditable={false} />
           <SettingItem icon="notifications-none" title="Notifications" color="#f59e0b" isEditable={false} />
           <SettingItem icon="data-usage" title="Storage and Data" color="#8b5cf6" />
           <SettingItem icon="help-outline" title="Help & Support" color="#10b981" isEditable={false} />
        </View>
      </ScrollView>

      {/* --- EDIT MODAL --- */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update {editType === 'bio' ? 'About' : 'Birthday'}</Text>
            <TextInput
              style={styles.input}
              value={tempValue}
              onChangeText={setTempValue}
              placeholder={editType === 'bio' ? "Write about yourself..." : "DD-MM-YYYY"}
              placeholderTextColor="#000"
              keyboardType={editType === 'dob' ? 'numeric' : 'default'}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => performUpdate(editType, tempValue)} 
                style={styles.saveBtn}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={{color:'white', fontWeight:'bold'}}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, backgroundColor: "#fff" },
  headerTitle: { fontSize: 22, fontWeight: "bold" },
  profileCard: { flexDirection: "row", alignItems: "center", padding: 20, backgroundColor: "#fff", marginBottom: 10 },
  imageWrapper: { position: "relative" },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eee' },
  cameraIcon: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#6366f1", padding: 6, borderRadius: 15, borderWidth: 2, borderColor: "#fff" },
  profileInfo: { marginLeft: 20, flex: 1 },
  userNameText: { fontSize: 20, fontWeight: "bold", color: "#1e293b" },
  userBioText: { fontSize: 14, color: "#64748b" },
  section: { backgroundColor: "#fff", paddingVertical: 10, marginBottom: 10 },
  sectionHeader: { fontSize: 13, fontWeight: "bold", color: "#6366f1", paddingHorizontal: 20, marginBottom: 10 },
  settingRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 20 },
  iconContainer: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  settingTextContainer: { flex: 1, marginLeft: 15 },
  settingTitle: { fontSize: 16, fontWeight: "500" },
  settingSubtitle: { fontSize: 13, color: "#94a3b8" },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 25 },
  modalContent: { backgroundColor: 'white', borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { borderBottomWidth: 1, borderBottomColor: '#6366f1', padding: 10, fontSize: 16, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { padding: 10, marginRight: 20 },
  saveBtn: { backgroundColor: '#6366f1', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }
});

export default ProfileScreen;