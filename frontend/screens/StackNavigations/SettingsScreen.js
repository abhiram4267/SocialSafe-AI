import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { updateProfileApi } from "../../utils/api"; // Your API helper

const SettingsScreen = ({ navigation }) => {
  const [bio, setBio] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await AsyncStorage.getItem("userDetails");
    if (data) {
        const parsed = JSON.parse(data);
        setUserData(parsed);
        setBio(parsed.bio);
    }
  };

  const handleSaveBio = async () => {
    try {
      const formData = new FormData();
      formData.append("user_id", userData._id);
      formData.append("bio", bio);
      // Include other required fields so they don't get wiped in some backends
      formData.append("username", userData.username);
      formData.append("dob", userData.dob);
      formData.append("phone", userData.phone);

      const response = await updateProfileApi(formData);
      await AsyncStorage.setItem("userDetails", JSON.stringify(response.user));
      setModalVisible(false);
      Alert.alert("Success", "About content updated!");
    } catch (error) {
      Alert.alert("Error", "Failed to update Bio");
    }
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


  const SettingRow = ({ icon, title, onPress }) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Ionicons name={icon} size={22} color="#555" />
      <Text style={styles.rowText}>{title}</Text>
      <MaterialIcons name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingRow icon="person-outline" title="Edit About / Bio" onPress={() => setModalVisible(true)} />
          <SettingRow icon="lock-closed-outline" title="Privacy" />
          <SettingRow icon="notifications-outline" title="Notifications" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <SettingRow icon="help-circle-outline" title="Help" />
          <SettingRow icon="document-text-outline" title="Terms and Conditions" />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => handleLogout()}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* --- EDIT BIO MODAL --- */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Edit About</Text>
            <TextInput
              style={styles.input}
              value={bio}
              onChangeText={setBio}
              multiline
              placeholder="Write something about yourself..."
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveBio} style={styles.saveBtn}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>Save</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 20 },
  section: { backgroundColor: '#fff', marginTop: 20, paddingVertical: 10 },
  sectionTitle: { marginLeft: 20, color: '#6366f1', fontWeight: 'bold', marginBottom: 10, fontSize: 13, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  rowText: { flex: 1, marginLeft: 15, fontSize: 16 },
  logoutBtn: { marginTop: 40, alignItems: 'center', padding: 15, backgroundColor: '#fff' },
  logoutText: { color: 'red', fontWeight: 'bold', fontSize: 16 },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 15, padding: 20 },
  modalHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { borderBottomWidth: 1, borderBottomColor: '#6366f1', paddingVertical: 10, fontSize: 16, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { padding: 10, marginRight: 10 },
  saveBtn: { backgroundColor: '#6366f1', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }
});

export default SettingsScreen;