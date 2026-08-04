// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   SafeAreaView,
//   Alert,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { MaterialIcons, Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { LogInAPi } from "../utils/api";

// export default function Login() {
//   const navigation = useNavigation();
//   const [secureSet, setsecureSet] = useState(true);
//   const [isLoading, setIsLoading] = useState(false);
//   const [form, setForm] = useState({ Email: "", Password: "" });
//   const [errors, setErrors] = useState({});

//   const handleChange = (field, value) => {
//     setForm((prev) => ({ ...prev, [field]: value }));
//     if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
//   };

//   const validate = () => {
//     const { Email, Password } = form;
//     const newErrors = {};
//     if (!Email.trim()) newErrors.Email = "Email/Username is required";
//     if (!Password) newErrors.Password = "Password is required";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const NavToHome = async () => {
//     if (!validate()) return;
//     setIsLoading(true);
//     try {
//       const response = await LogInAPi(form);
//       const res = response.data;

//       if (res.status === 200) {
//         setErrors({ Email: res.data.message });
//       } else if (res.status === 201) {
//         setErrors({ Password: res.data.message });
//       } else if (res.status === 202) {
//         // Success logic
//         await AsyncStorage.setItem("isLoggedIn", "true");
//         await AsyncStorage.setItem("userDetails", JSON.stringify(res.data.result));
        
//         // RESET to "Home". 
//         // "Home" triggers StackComponent -> BottomBar -> Chat Tab automatically.
//         navigation.reset({
//           index: 0,
//           routes: [{ name: "Home" }], 
//         });
//       }
//     } catch (error) {
//       Alert.alert("Error", "Connection failed.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <LinearGradient colors={['#667eea', '#764ba2']} style={styles.headerGradient}>
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>SocialSafe-AI</Text>
//           <Text style={styles.headerSubtitle}>Login with your Gmail Account</Text>
//         </View>
//       </LinearGradient>

//       <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
//         <View style={styles.mainContent}>
//           <View style={styles.inputContainer}>
//             <View style={styles.inputWrapper}>
//               <Ionicons name="mail" size={20} color="#6366f1" style={styles.inputIcon} />
//               <TextInput
//                 placeholder="Gmail or Username"
//                 value={form.Email}
//                 onChangeText={(t) => handleChange("Email", t)}
//                 style={[styles.inputField, errors.Email && styles.errorBorder]}
//                 autoCapitalize="none"
//               />
//             </View>
//             {errors.Email && <Text style={styles.errorText}>{errors.Email}</Text>}
//           </View>

//           <View style={styles.inputContainer}>
//             <View style={styles.inputWrapper}>
//               <Ionicons name="lock-closed" size={20} color="#6366f1" style={styles.inputIcon} />
//               <TextInput
//                 placeholder="Password"
//                 value={form.Password}
//                 onChangeText={(t) => handleChange("Password", t)}
//                 secureTextEntry={secureSet}
//                 style={[styles.inputField, errors.Password && styles.errorBorder]}
//               />
//               <TouchableOpacity onPress={() => setsecureSet(!secureSet)}>
//                 <MaterialIcons name={secureSet ? 'visibility-off' : 'visibility'} size={24} color="#94a3b8" />
//               </TouchableOpacity>
//             </View>
//             {errors.Password && <Text style={styles.errorText}>{errors.Password}</Text>}
//           </View>

//           <TouchableOpacity style={styles.loginButton} onPress={NavToHome} disabled={isLoading}>
//             {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Sign In</Text>}
//           </TouchableOpacity>

//           <View style={styles.divider}>
//             <Text style={styles.dividerText}>Don't have an account?</Text>
//           </View>

//           <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate("Signup")}>
//             <Text style={styles.signupButtonText}>Create Account</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: '#f8fafc' },
//   headerGradient: { paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
//   headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
//   headerSubtitle: { color: '#e2e8f0', marginTop: 5 },
//   container: { paddingHorizontal: 20, marginTop: -30 },
//   mainContent: { backgroundColor: '#fff', borderRadius: 25, padding: 25, elevation: 5 },
//   inputContainer: { marginBottom: 15 },
//   inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 15 },
//   inputIcon: { marginRight: 10 },
//   inputField: { flex: 1, paddingVertical: 14, fontSize: 16 },
//   errorBorder: { borderColor: 'red' },
//   errorText: { color: 'red', fontSize: 12, marginTop: 5 },
//   loginButton: { backgroundColor: '#6366f1', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
//   loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
//   divider: { marginVertical: 20, alignItems: 'center' },
//   dividerText: { color: '#94a3b8' },
//   signupButton: { paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#6366f1', alignItems: 'center' },
//   signupButtonText: { color: '#6366f1', fontWeight: 'bold' }
// });



import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LogInAPi } from "../utils/api";

export default function Login() {
  const navigation = useNavigation();
  const [secureSet, setsecureSet] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialChecking, setIsInitialChecking] = useState(true); // Loader for auto-login
  const [form, setForm] = useState({ Email: "", Password: "" });
  const [errors, setErrors] = useState({});

  // --- AUTO LOGIN LOGIC ---
  useEffect(() => {
    checkLocalSession();
  }, []);

  const checkLocalSession = async () => {
    try {
      const loggedIn = await AsyncStorage.getItem("isLoggedIn");
      const details = await AsyncStorage.getItem("userDetails");

      if (loggedIn === "true" && details) {
        const user = JSON.parse(details);
        // Attempt login with saved credentials
        await performLogin(user.email, user.password, true);
      } else {
        setIsInitialChecking(false);
      }
    } catch (e) {
      setIsInitialChecking(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const { Email, Password } = form;
    const newErrors = {};
    if (!Email.trim()) newErrors.Email = "Email/Username is required";
    if (!Password) newErrors.Password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const performLogin = async (email, password, isAuto = false) => {
  //   if (!isAuto) setIsLoading(true);
    
  //   try {
  //     // Backend expects Email and Password (matching your form state keys)
  //     const response = await LogInAPi({ Email: email, Password: password });

  //     const res = response.data;

  //     if (res.status === 200) {
  //       if (!isAuto) setErrors({ Email: res.data.message });
  //       setIsInitialChecking(false);
  //     } else if (res.status === 201) {
  //       if (!isAuto) setErrors({ Password: res.data.message });
  //       setIsInitialChecking(false);
  //     } else if (res.status === 202) {
  //       // SUCCESS: Save to storage
  //       console.log(res.result);
  //       await AsyncStorage.setItem("isLoggedIn", "true");
  //       await AsyncStorage.setItem("userDetails", JSON.stringify(res.result));
        
  //       navigation.reset({
  //         index: 0,
  //         routes: [{ name: "Home" }], 
  //       });
  //     }
  //   } catch (error) {
  //     if (!isAuto) Alert.alert("Error", "Connection failed.");
  //     setIsInitialChecking(false);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  const performLogin = async (email, password, isAuto = false) => {
    if (!isAuto) setIsLoading(true);
    
    try {
      const response = await LogInAPi({ Email: email, Password: password });
      const res = response.data;

      if (res.status === 200) {
        if (!isAuto) setErrors({ Email: res.error });
        setIsInitialChecking(false);
      } 
      else if (res.status === 201) {
        if (!isAuto) setErrors({ Password: res.error });
        setIsInitialChecking(false);
      } 
      // 🚨 NEW STATUS: BLOCKED
      else if (res.status === 203) {
        if (isAuto) {
          // If auto-login fails because they just got blocked, clear storage
          await AsyncStorage.multiRemove(["isLoggedIn", "userDetails"]);
        }
        Alert.alert("Access Denied", res.error);
        setIsInitialChecking(false);
      } 
      else if (res.status === 202) {
        // SUCCESS
        await AsyncStorage.setItem("isLoggedIn", "true");
        await AsyncStorage.setItem("userDetails", JSON.stringify(res.result));
        
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }], 
        });
      }
    } catch (error) {
      if (!isAuto) Alert.alert("Error", "Connection failed.");
      setIsInitialChecking(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLogin = () => {
    if (!validate()) return;
    performLogin(form.Email, form.Password, false);
  };

  // Show a full-screen loader while checking session
  if (isInitialChecking) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loaderText}>Securely connecting...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.headerGradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SocialSafe-AI</Text>
          <Text style={styles.headerSubtitle}>Login with your Gmail Account / Username</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.mainContent}>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail" size={20} color="#6366f1" style={styles.inputIcon} />
              <TextInput
                placeholder="Gmail or Username"
                placeholderTextColor="#000"
                value={form.Email}
                onChangeText={(t) => handleChange("Email", t)}
                style={[styles.inputField, errors.Email && styles.errorBorder]}
                autoCapitalize="none"
              />
            </View>
            {errors.Email && <Text style={styles.errorText}>{errors.Email}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed" size={20} color="#6366f1" style={styles.inputIcon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#000"
                value={form.Password}
                onChangeText={(t) => handleChange("Password", t)}
                secureTextEntry={secureSet}
                style={[styles.inputField, errors.Password && styles.errorBorder]}
              />
              <TouchableOpacity onPress={() => setsecureSet(!secureSet)}>
                <MaterialIcons name={secureSet ? 'visibility-off' : 'visibility'} size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            {errors.Password && <Text style={styles.errorText}>{errors.Password}</Text>}
          </View>

          <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleManualLogin} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Sign In</Text>}
          </TouchableOpacity>

          <View style={styles.divider}>
            <Text style={styles.dividerText}>Don't have an account?</Text>
          </View>

          <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loaderText: { marginTop: 15, fontSize: 16, color: '#6366f1', fontWeight: '500' },
  headerGradient: { paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  headerSubtitle: { color: '#e2e8f0', marginTop: 5 },
  container: { paddingHorizontal: 20, marginTop: 30 },
  mainContent: { backgroundColor: '#fff', borderRadius: 25, padding: 25, elevation: 5 },
  inputContainer: { marginBottom: 15 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 15 },
  inputIcon: { marginRight: 10 },
  inputField: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#000' },
  errorBorder: { borderColor: 'red' },
  errorText: { color: 'red', fontSize: 12, marginTop: 5 },
  loginButton: { backgroundColor: '#6366f1', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  divider: { marginVertical: 20, alignItems: 'center' },
  dividerText: { color: '#94a3b8' },
  signupButton: { paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#6366f1', alignItems: 'center' },
  signupButtonText: { color: '#6366f1', fontWeight: 'bold' },
  
});