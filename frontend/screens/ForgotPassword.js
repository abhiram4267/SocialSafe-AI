import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { forgotPasswordSendOtp, verifyOtpApi, resetPasswordApi } from "../utils/api";

export default function ForgotPassword({ navigation }) {
  const [step, setStep] = useState(0); // 0: Email, 1: OTP, 2: New Password
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRequestOtp = async () => {
    if (!email.endsWith("@gmail.com")) return Alert.alert("Error", "Enter a valid Gmail");
    setIsLoading(true);
    try {
      await forgotPasswordSendOtp(email);
      setStep(1);
    } catch (e) {
      Alert.alert("Error", e.response?.data?.detail || "Email not found");
    } finally { setIsLoading(false); }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      const res = await verifyOtpApi({ email, otp });
      if (res.status === "success") setStep(2);
    } catch (e) { Alert.alert("Error", "Invalid Code"); }
    finally { setIsLoading(false); }
  };

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await resetPasswordApi(email, password);
      
      if (response.status === "success") {
        Alert.alert("Success", "Your password has been updated!", [
          { text: "Login", onPress: () => navigation.reset({ index: 0, routes: [{ name: "Login" }] }) }
        ]);
      }
    } catch (e) {
      // 🚨 THE FIX: Get the specific error message from the backend detail field
      const errorMessage = e.response?.data?.detail || "Failed to update password. Try again.";
      
      console.log("Detailed Error:", errorMessage);
      Alert.alert("Reset Error", errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <Text style={styles.headerSub}>Step {step + 1} of 3</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          {step === 0 && (
            <>
              <Text style={styles.label}>Enter your registered Gmail</Text>
              <TextInput 
                placeholder="example@gmail.com" 
                style={styles.input} 
                autoCapitalize="none"
                onChangeText={setEmail} 
              />
              <TouchableOpacity style={styles.btn} onPress={handleRequestOtp}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Reset Code</Text>}
              </TouchableOpacity>
            </>
          )}

          {step === 1 && (
            <>
              <Text style={styles.label}>Enter the code sent to {email}</Text>
              <TextInput 
                placeholder="6-digit code" 
                style={styles.input} 
                keyboardType="number-pad"
                onChangeText={setOtp} 
              />
              <TouchableOpacity style={styles.btn} onPress={handleVerifyOtp}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify Code</Text>}
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.label}>Create a new password</Text>
              <TextInput placeholder="New Password" secureTextEntry style={styles.input} onChangeText={setPassword} />
              <TextInput placeholder="Confirm New Password" secureTextEntry style={styles.input} onChangeText={setConfirmPassword} />
              <TouchableOpacity style={styles.btn} onPress={handleResetPassword}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Update Password</Text>}
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20, alignItems: 'center'}}>
            <Text style={{color: '#667eea'}}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 40, alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: '#fff', opacity: 0.8, marginTop: 5 },
  container: { padding: 20 },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 20, elevation: 5 },
  label: { fontSize: 14, color: '#64748b', marginBottom: 15, textAlign: 'center' },
  input: { backgroundColor: '#f1f5f9', padding: 15, borderRadius: 12, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  btn: { backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});