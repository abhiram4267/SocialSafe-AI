

// import React, { useState, useRef } from "react";
// import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from "react-native";
// import { LinearGradient } from 'expo-linear-gradient';

// import auth from '@react-native-firebase/auth';


// import { 
//   checkUsernameApi, 
//   sendEmailOtpApi, 
//   sendPhoneOtpApi, 
//   verifyOtpApi, 
//   SignUpAPi 
// } from "../utils/api";

// export default function Signup({ navigation }) {
//   const [step, setStep] = useState(0); 
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Verification Flags
//   const [isEmailVerified, setIsEmailVerified] = useState(false);
//   const [isPhoneVerified, setIsPhoneVerified] = useState(false);

//   // OTP Input Visibility
//   const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
//   const [showPhoneOtpInput, setShowPhoneOtpInput] = useState(false);

//   // OTP Values
//   const [emailOtp, setEmailOtp] = useState("");
//   const [phoneOtp, setPhoneOtp] = useState("");


//   const [confirmation, setConfirmation] = useState(null);


//   const [form, setForm] = useState({ 
//     username: "", actual_name: "", email: "", phone: "", password: "", confirm_password: "" 
//   });

//   // --- Step 0: Username Logic ---
//   const handleStep0Next = async () => {
//     if (!form.username || !form.actual_name) return Alert.alert("Error", "Please enter name and username");
//     setIsLoading(true);
//     try {
//       const res = await checkUsernameApi(form.username);
//       if (res.exists) {
//         Alert.alert("Unavailable", "This username is already taken.");
//       } else {
//         setStep(1);
//       }
//     } catch (e) { Alert.alert("Error", "Server Error"); }
//     finally { setIsLoading(false); }
//   };

//   // --- Step 1: Email Logic ---
//   // const requestEmailOtp = async () => {
//   //   if (!form.email.endsWith("@gmail.com")) return Alert.alert("Error", "Invalid Gmail");
//   //   setIsLoading(true);
//   //   try {
//   //     await sendEmailOtpApi(form.email);
//   //     setShowEmailOtpInput(true);
//   //     Alert.alert("Sent", "OTP sent to Gmail");
//   //   } catch (e) { Alert.alert("Error", "Email delivery failed"); }
//   //   finally { setIsLoading(false); }
//   // };

//   const requestEmailOtp = async () => {
//     if (!form.email.endsWith("@gmail.com")) return Alert.alert("Error", "Invalid Gmail");
//     setIsLoading(true);
//     try {
//       await sendEmailOtpApi(form.email);
//       setShowEmailOtpInput(true);
//       Alert.alert("Sent", "OTP sent to Gmail");
//     } catch (e) {
//       // 🚨 Handle Backend Errors (403 Blocked or 409 Existing)
//       const errorMsg = e.response?.data?.detail || "Email delivery failed";
//       Alert.alert("Request Denied", errorMsg);
//     } finally { setIsLoading(false); }
//   };

//   const verifyEmail = async () => {
//     setIsLoading(true);
//     try {
//       const res = await verifyOtpApi({ email: form.email, otp: emailOtp });
//       if (res.status === "success") {
//         setIsEmailVerified(true);
//         setShowEmailOtpInput(false);
//       }
//     } catch (e) { Alert.alert("Error", "Incorrect Email OTP"); }
//     finally { setIsLoading(false); }
//   };

//   // --- Step 1: Phone Logic ---
//   // const requestPhoneOtp = async () => {
//   //   if (form.phone.length < 10) return Alert.alert("Error", "Invalid Phone");
//   //   setIsLoading(true);
//   //   try {
//   //     await sendPhoneOtpApi(form.phone);
//   //     setShowPhoneOtpInput(true);
//   //     Alert.alert("Sent", "OTP sent to mobile (check console)");
//   //   } catch (e) { Alert.alert("Error", "Phone delivery failed"); }
//   //   finally { setIsLoading(false); }
//   // };

//   // const requestPhoneOtp = async () => {
//   //   if (form.phone.length < 10) return Alert.alert("Error", "Invalid Phone");
//   //   setIsLoading(true);
//   //   try {
//   //     await sendPhoneOtpApi(form.phone);
//   //     setShowPhoneOtpInput(true);
//   //     Alert.alert("Sent", "OTP sent to mobile");
//   //   } catch (e) {
//   //     // 🚨 Handle Backend Errors (403 Blocked or 409 Existing)
//   //     const errorMsg = e.response?.data?.detail || "Phone delivery failed";
//   //     Alert.alert("Request Denied", errorMsg);
//   //   } finally { setIsLoading(false); }
//   // };

//  const requestPhoneOtp = async () => {
//   if (!/^[6-9]\d{9}$/.test(form.phone)) {
//     return Alert.alert("Error", "Enter valid Indian mobile number");
//   }

//   if (confirmation) {
//     return Alert.alert("OTP already sent. Please verify.");
//   }

//   try {
//     setIsLoading(true);

//     const confirmationResult = await auth().signInWithPhoneNumber(
//       "+91" + form.phone
//     );

//     setConfirmation(confirmationResult);
//     setShowPhoneOtpInput(true);

//     Alert.alert("OTP Sent Successfully");

//   } catch (error) {
//     console.log("OTP SEND ERROR:", error);
//     Alert.alert("Error", error.message || "Try again later");
//   }

//   setIsLoading(false);
// };





//   // const verifyPhone = async () => {
//   //   setIsLoading(true);
//   //   try {
//   //     const res = await verifyOtpApi({ phone: form.phone, otp: phoneOtp });
//   //     if (res.status === "success") {
//   //       setIsPhoneVerified(true);
//   //       setShowPhoneOtpInput(false);
//   //     }
//   //   } catch (e) { Alert.alert("Error", "Incorrect Phone OTP"); }
//   //   finally { setIsLoading(false); }
//   // };


// //   const verifyPhone = async () => {
// //   try {
// //     setIsLoading(true);

// //     const credential = PhoneAuthProvider.credential(
// //       verificationId,
// //       phoneOtp
// //     );

// //     await signInWithCredential(auth, credential);

// //     setIsPhoneVerified(true);
// //     setShowPhoneOtpInput(false);

// //     Alert.alert("Phone Verified ✅");

// //   } catch (error) {
// //     Alert.alert("Error", "Invalid Phone OTP");
// //   }

// //   setIsLoading(false);
// // };

// const verifyPhone = async () => {
//   if (!confirmation) {
//     return Alert.alert("Error", "Send OTP first");
//   }

//   try {
//     setIsLoading(true);

//     await confirmation.confirm(phoneOtp);

//     setIsPhoneVerified(true);
//     setShowPhoneOtpInput(false);

//     Alert.alert("Phone Verified Successfully");

//   } catch (error) {
//     console.log("VERIFY ERROR:", error);
//     Alert.alert("Invalid OTP");
//   }

//   setIsLoading(false);
// };




//   // --- Step 2: Final Registration ---
//   const handleFinalSignup = async () => {
//     if (form.password !== form.confirm_password) return Alert.alert("Error", "Passwords do not match");
    
//     setIsLoading(true);
//     try {
//       const firebaseUser = auth().currentUser;

// const response = await SignUpAPi({
//   ...form,
//   firebase_uid: firebaseUser?.uid,
//   firebase_phone: firebaseUser?.phoneNumber
// });
      
//       // FIX: Check the new status key we added to the backend
//       if (response.status === "error") {
//           Alert.alert("Registration Failed", response.message);
//       } else {
//           Alert.alert("Success", "Account created successfully!", [
//               { text: "Login", onPress: () => navigation.navigate("Login") }
//           ]);
//       }
//     } catch (e) {
//       Alert.alert("Error", "Server side error. Check backend logs.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
      
//       <LinearGradient colors={['#6366f1', '#a855f7']} style={styles.header}>
//          <Text style={styles.headerTitle}>Registration</Text>
//          <Text style={styles.stepText}>Step {step + 1} of 3</Text>
//       </LinearGradient>

//       <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
//         {/* STEP 0: NAME & USERNAME */}
//         {step === 0 && (
//           <View style={styles.card}>
//             <TextInput placeholder="Full Name" placeholderTextColor="#000" style={styles.input} onChangeText={(v) => setForm({...form, actual_name: v})} />
//             <TextInput placeholder="Username" placeholderTextColor="#000" style={styles.input} onChangeText={(v) => setForm({...form, username: v})} />
//             <TouchableOpacity style={styles.btn} onPress={handleStep0Next}>
//               {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Next</Text>}
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* STEP 1: DUAL VERIFICATION */}
//         {step === 1 && (
//           <View style={styles.card}>
//             <Text style={styles.label}>Email Address</Text>
//             <View style={styles.row}>
//                 <TextInput placeholder="Gmail" placeholderTextColor="#000" editable={!isEmailVerified} style={[styles.input, {flex:1}]} onChangeText={(v) => setForm({...form, email: v})} />
//                 <TouchableOpacity onPress={requestEmailOtp} disabled={isEmailVerified} style={[styles.miniBtn, isEmailVerified && {backgroundColor: '#ccc'}]}>
//                     <Text style={{color: 'white'}}>{isEmailVerified ? "Verified" : "Send"}</Text>
//                 </TouchableOpacity>
//             </View>
//             {showEmailOtpInput && (
//                 <View style={styles.otpSection}>
//                     <TextInput placeholder="Enter Email OTP" placeholderTextColor="#000" keyboardType="number-pad" style={styles.input} onChangeText={setEmailOtp} />
//                     <TouchableOpacity onPress={verifyEmail} style={styles.verifyBtn}><Text style={styles.btnText}>Verify Email</Text></TouchableOpacity>
//                 </View>
//             )}

//             <Text style={[styles.label, {marginTop: 15}]}>Phone Number</Text>
//             <View style={styles.row}>
//                 <TextInput placeholder="Mobile" placeholderTextColor="#000" editable={!isPhoneVerified} keyboardType="phone-pad" style={[styles.input, {flex:1}]} onChangeText={(v) => setForm({...form, phone: v})} />
//                 <TouchableOpacity onPress={requestPhoneOtp} disabled={isPhoneVerified} style={[styles.miniBtn, isPhoneVerified && {backgroundColor: '#ccc'}]}>
//                     <Text style={{color: 'white'}}>{isPhoneVerified ? "Verified" : "Send"}</Text>
//                 </TouchableOpacity>
//             </View>
//             {showPhoneOtpInput && (
//                 <View style={styles.otpSection}>
//                     <TextInput placeholder="Enter Phone OTP" placeholderTextColor="#000" keyboardType="number-pad" style={styles.input} onChangeText={setPhoneOtp} />
//                     <TouchableOpacity onPress={verifyPhone} style={styles.verifyBtn}><Text style={styles.btnText}>Verify Phone</Text></TouchableOpacity>
//                 </View>
//             )}

//             {/* 🚨 THE FIX: Button only appears when BOTH are verified */}
//             {isEmailVerified && isPhoneVerified && (
//                 <TouchableOpacity style={[styles.btn, {marginTop: 20}]} onPress={() => setStep(2)}>
//                     <Text style={styles.btnText}>Set Password</Text>
//                 </TouchableOpacity>
//             )}
//           </View>
//         )}

//         {/* STEP 2: PASSWORD */}
//         {step === 2 && (
//           <View style={styles.card}>
//             <TextInput placeholder="Password" placeholderTextColor="#000" secureTextEntry style={styles.input} onChangeText={(v) => setForm({...form, password: v})} />
//             <TextInput placeholder="Confirm Password" placeholderTextColor="#000" secureTextEntry style={styles.input} onChangeText={(v) => setForm({...form, confirm_password: v})} />
//             <TouchableOpacity style={styles.btn} onPress={handleFinalSignup}>
//               <Text style={styles.btnText}>Create Account</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: '#f8fafc' },
//   header: { padding: 30, alignItems: 'center' },
//   headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
//   stepText: { color: '#fff', opacity: 0.8 },
//   container: { padding: 20 },
//   card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 5 },
//   label: { fontWeight: 'bold', color: '#64748b', marginBottom: 5 },
//   input: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10, color: '#000' },
//   row: { flexDirection: 'row', alignItems: 'center' },
//   miniBtn: { backgroundColor: '#6366f1', padding: 12, borderRadius: 10, marginLeft: 10, marginBottom: 10 },
//   verifyBtn: { backgroundColor: '#10b981', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
//   btn: { backgroundColor: '#6366f1', padding: 15, borderRadius: 10, alignItems: 'center' },
//   btnText: { color: '#fff', fontWeight: 'bold' },
//   otpSection: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 10, marginBottom: 10 }
// });




import React, { useState, useRef } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

import auth from '@react-native-firebase/auth';


import { 
  checkUsernameApi, 
  sendEmailOtpApi,
  verifyEmailOtpApi, 
  sendPhoneOtpApi, 
  verifyOtpApi, 
  SignUpAPi 
} from "../utils/api";

export default function Signup({ navigation }) {
  const [step, setStep] = useState(0); 
  const [isLoading, setIsLoading] = useState(false);
  
  // Verification Flags
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  // OTP Input Visibility
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [showPhoneOtpInput, setShowPhoneOtpInput] = useState(false);

  // OTP Values
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");


  const [confirmation, setConfirmation] = useState(null);


  const [form, setForm] = useState({ 
    username: "", actual_name: "", email: "", phone: "", password: "", confirm_password: "" 
  });

  // --- Step 0: Username Logic ---
  const handleStep0Next = async () => {
    if (!form.username || !form.actual_name) return Alert.alert("Error", "Please enter name and username");
    setIsLoading(true);
    try {
      const res = await checkUsernameApi(form.username);
      if (res.exists) {
        Alert.alert("Unavailable", "This username is already taken.");
      } else {
        setStep(1);
      }
    } catch (e) { Alert.alert("Error", "Server Error"); }
    finally { setIsLoading(false); }
  };

  // --- Step 1: Email Logic ---
  // const requestEmailOtp = async () => {
  //   if (!form.email.endsWith("@gmail.com")) return Alert.alert("Error", "Invalid Gmail");
  //   setIsLoading(true);
  //   try {
  //     await sendEmailOtpApi(form.email);
  //     setShowEmailOtpInput(true);
  //     Alert.alert("Sent", "OTP sent to Gmail");
  //   } catch (e) { Alert.alert("Error", "Email delivery failed"); }
  //   finally { setIsLoading(false); }
  // };

  const requestEmailOtp = async () => {
    if (!form.email.endsWith("@gmail.com")) return Alert.alert("Error", "Invalid Gmail");
    setIsLoading(true);
    try {
      await sendEmailOtpApi(form.email);
      setShowEmailOtpInput(true);
      Alert.alert("Sent", "OTP sent to Gmail");
    } catch (e) {
      // 🚨 Handle Backend Errors (403 Blocked or 409 Existing)
      const errorMsg = e.response?.data?.detail || "Email delivery failed";
      Alert.alert("Request Denied", errorMsg);
    } finally { setIsLoading(false); }
  };

  const verifyEmail = async () => {
    setIsLoading(true);
    try {
      const res = await verifyEmailOtpApi({ email: form.email, otp: emailOtp });
      if (res.status === "success") {
        setIsEmailVerified(true);
        setShowEmailOtpInput(false);
      }
    } catch (e) { Alert.alert("Error", "Incorrect Email OTP"); }
    finally { setIsLoading(false); }
  };

  // --- Step 1: Phone Logic ---
  // const requestPhoneOtp = async () => {
  //   if (form.phone.length < 10) return Alert.alert("Error", "Invalid Phone");
  //   setIsLoading(true);
  //   try {
  //     await sendPhoneOtpApi(form.phone);
  //     setShowPhoneOtpInput(true);
  //     Alert.alert("Sent", "OTP sent to mobile (check console)");
  //   } catch (e) { Alert.alert("Error", "Phone delivery failed"); }
  //   finally { setIsLoading(false); }
  // };

  // const requestPhoneOtp = async () => {
  //   if (form.phone.length < 10) return Alert.alert("Error", "Invalid Phone");
  //   setIsLoading(true);
  //   try {
  //     await sendPhoneOtpApi(form.phone);
  //     setShowPhoneOtpInput(true);
  //     Alert.alert("Sent", "OTP sent to mobile");
  //   } catch (e) {
  //     // 🚨 Handle Backend Errors (403 Blocked or 409 Existing)
  //     const errorMsg = e.response?.data?.detail || "Phone delivery failed";
  //     Alert.alert("Request Denied", errorMsg);
  //   } finally { setIsLoading(false); }
  // };

 const requestPhoneOtp = async () => {
  if (!/^[6-9]\d{9}$/.test(form.phone)) {
    return Alert.alert("Error", "Enter valid Indian mobile number");
  }

  try {
    setIsLoading(true);

    await sendPhoneOtpApi(form.phone); // call backend

    setShowPhoneOtpInput(true);
    Alert.alert("OTP Sent Successfully");

  } catch (error) {
    console.log("OTP SEND ERROR:", error);
    Alert.alert("Error", error.response?.data?.detail || "Try again later");
  } finally {
    setIsLoading(false);
  }
};



const verifyPhone = async () => {
  if (!phoneOtp) {
    return Alert.alert("Error", "Enter OTP");
  }

  try {
    setIsLoading(true);

    const res = await verifyOtpApi({
      phone: form.phone,
      otp: phoneOtp
    });

    if (res.status === "success") {
      setIsPhoneVerified(true);
      setShowPhoneOtpInput(false);
      Alert.alert("Phone Verified Successfully");
    }

  } catch (error) {
    console.log("VERIFY ERROR:", error);
    Alert.alert("Invalid OTP");
  } finally {
    setIsLoading(false);
  }
};




  // --- Step 2: Final Registration ---
  const handleFinalSignup = async () => {
    if (form.password !== form.confirm_password) return Alert.alert("Error", "Passwords do not match");
    
    setIsLoading(true);
    try {
      const firebaseUser = auth().currentUser;

const response = await SignUpAPi({
  ...form,
  firebase_uid: firebaseUser?.uid,
  firebase_phone: firebaseUser?.phoneNumber
});
      
      // FIX: Check the new status key we added to the backend
      if (response.status === "error") {
          Alert.alert("Registration Failed", response.message);
      } else {
          Alert.alert("Success", "Account created successfully!", [
              { text: "Login", onPress: () => navigation.navigate("Login") }
          ]);
      }
    } catch (e) {
      Alert.alert("Error", "Server side error. Check backend logs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      <LinearGradient colors={['#6366f1', '#a855f7']} style={styles.header}>
         <Text style={styles.headerTitle}>Registration</Text>
         <Text style={styles.stepText}>Step {step + 1} of 3</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* STEP 0: NAME & USERNAME */}
        {step === 0 && (
          <View style={styles.card}>
            <TextInput placeholder="Full Name" placeholderTextColor="#000" style={styles.input} onChangeText={(v) => setForm({...form, actual_name: v})} />
            <TextInput placeholder="Username" placeholderTextColor="#000" style={styles.input} onChangeText={(v) => setForm({...form, username: v})} />
            <TouchableOpacity style={styles.btn} onPress={handleStep0Next}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Next</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 1: DUAL VERIFICATION */}
        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.row}>
                <TextInput placeholder="Gmail" placeholderTextColor="#000" editable={!isEmailVerified} style={[styles.input, {flex:1}]} onChangeText={(v) => setForm({...form, email: v})} />
                <TouchableOpacity onPress={requestEmailOtp} disabled={isEmailVerified} style={[styles.miniBtn, isEmailVerified && {backgroundColor: '#ccc'}]}>
                    <Text style={{color: 'white'}}>{isEmailVerified ? "Verified" : "Send"}</Text>
                </TouchableOpacity>
            </View>
            {showEmailOtpInput && (
                <View style={styles.otpSection}>
                    <TextInput placeholder="Enter Email OTP" placeholderTextColor="#000" keyboardType="number-pad" style={styles.input} onChangeText={setEmailOtp} />
                    <TouchableOpacity onPress={verifyEmail} style={styles.verifyBtn}><Text style={styles.btnText}>Verify Email</Text></TouchableOpacity>
                </View>
            )}

            <Text style={[styles.label, {marginTop: 15}]}>Phone Number</Text>
            <View style={styles.row}>
                <TextInput placeholder="Mobile" placeholderTextColor="#000" editable={!isPhoneVerified} keyboardType="phone-pad" style={[styles.input, {flex:1}]} onChangeText={(v) => setForm({...form, phone: v})} />
                <TouchableOpacity onPress={requestPhoneOtp} disabled={isPhoneVerified} style={[styles.miniBtn, isPhoneVerified && {backgroundColor: '#ccc'}]}>
                    <Text style={{color: 'white'}}>{isPhoneVerified ? "Verified" : "Send"}</Text>
                </TouchableOpacity>
            </View>
            {showPhoneOtpInput && (
                <View style={styles.otpSection}>
                    <TextInput placeholder="Enter Phone OTP" placeholderTextColor="#000" keyboardType="number-pad" style={styles.input} onChangeText={setPhoneOtp} />
                    <TouchableOpacity onPress={verifyPhone} style={styles.verifyBtn}><Text style={styles.btnText}>Verify Phone</Text></TouchableOpacity>
                </View>
            )}

            {/* 🚨 THE FIX: Button only appears when BOTH are verified */}
            {isEmailVerified && isPhoneVerified && (
                <TouchableOpacity style={[styles.btn, {marginTop: 20}]} onPress={() => setStep(2)}>
                    <Text style={styles.btnText}>Set Password</Text>
                </TouchableOpacity>
            )}
          </View>
        )}

        {/* STEP 2: PASSWORD */}
        {step === 2 && (
          <View style={styles.card}>
            <TextInput placeholder="Password" placeholderTextColor="#000" secureTextEntry style={styles.input} onChangeText={(v) => setForm({...form, password: v})} />
            <TextInput placeholder="Confirm Password" placeholderTextColor="#000" secureTextEntry style={styles.input} onChangeText={(v) => setForm({...form, confirm_password: v})} />
            <TouchableOpacity style={styles.btn} onPress={handleFinalSignup}>
              <Text style={styles.btnText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 30, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  stepText: { color: '#fff', opacity: 0.8 },
  container: { padding: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 5 },
  label: { fontWeight: 'bold', color: '#64748b', marginBottom: 5 },
  input: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10, color: '#000' },
  row: { flexDirection: 'row', alignItems: 'center' },
  miniBtn: { backgroundColor: '#6366f1', padding: 12, borderRadius: 10, marginLeft: 10, marginBottom: 10 },
  verifyBtn: { backgroundColor: '#10b981', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  btn: { backgroundColor: '#6366f1', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  otpSection: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 10, marginBottom: 10 }
});