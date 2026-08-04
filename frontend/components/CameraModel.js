// import React, { useState, useRef } from 'react';
// import { StyleSheet, Text, View, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
// import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// export default function CameraModal({ visible, onClose, onMediaCaptured }) {
//   const [facing, setFacing] = useState('back');
//   const [isRecording, setIsRecording] = useState(false);
//   const [cameraPermission, requestCameraPermission] = useCameraPermissions();
//   const [micPermission, requestMicPermission] = useMicrophonePermissions();
//   const cameraRef = useRef(null);

//   if (!visible) return null;

//   if (!cameraPermission || !micPermission) {
//     // Permissions are still loading
//     return <View />;
//   }

//   if (!cameraPermission.granted || !micPermission.granted) {
//     return (
//       <Modal visible={visible} animationType="slide">
//         <View style={styles.container}>
//           <Text style={{ textAlign: 'center', marginBottom: 20 }}>We need your permission to show the camera and record audio</Text>
//           <TouchableOpacity onPress={() => { requestCameraPermission(); requestMicPermission(); }} style={styles.btn}>
//             <Text style={{color: 'white'}}>Grant Permissions</Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={onClose} style={[styles.btn, {backgroundColor: 'gray', marginTop: 10}]}>
//             <Text style={{color: 'white'}}>Cancel</Text>
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     );
//   }

//   const toggleCameraFacing = () => {
//     setFacing(current => (current === 'back' ? 'front' : 'back'));
//   };

//   const takePicture = async () => {
//     if (cameraRef.current) {
//       const photo = await cameraRef.current.takePictureAsync();
//       onMediaCaptured(photo.uri, 'image');
//       onClose();
//     }
//   };

//   const startVideoRecording = async () => {
//     if (cameraRef.current) {
//       setIsRecording(true);
//       const video = await cameraRef.current.recordAsync();
//       onMediaCaptured(video.uri, 'video');
//       onClose();
//     }
//   };

//   const stopVideoRecording = () => {
//     if (cameraRef.current && isRecording) {
//       cameraRef.current.stopRecording();
//       setIsRecording(false);
//     }
//   };

//   return (
//     <Modal visible={visible} animationType="fade">
//       <View style={styles.container}>
//         <CameraView
//             style={styles.camera}
//             facing={facing}
//             ref={cameraRef}
//             mode={isRecording ? "video" : "picture"}
//         >
//           <SafeAreaView style={styles.buttonContainer}>
//             <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
//               <Ionicons name="close" size={30} color="white" />
//             </TouchableOpacity>

//             <View style={styles.controls}>
//               <TouchableOpacity onPress={toggleCameraFacing}>
//                 <MaterialIcons name="flip-camera-android" size={35} color="white" />
//               </TouchableOpacity>

//               {/* ACTION BUTTON: Tap for Photo, Hold for Video */}
//               <TouchableOpacity
//                 onPress={takePicture}
//                 onLongPress={startVideoRecording}
//                 onPressOut={stopVideoRecording}
//                 style={[styles.shutter, isRecording && { backgroundColor: 'red', transform: [{scale: 1.2}] }]}
//               />

//               <TouchableOpacity onPress={() => {/* Add Flash Toggle Logic if needed */}}>
//                 <Ionicons name="flash-outline" size={30} color="white" />
//               </TouchableOpacity>
//             </View>

//             <Text style={styles.hintText}>
//                 {isRecording ? "Recording..." : "Tap for photo, Hold for video"}
//             </Text>
//           </SafeAreaView>
//         </CameraView>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', backgroundColor: 'black' },
//   camera: { flex: 1 },
//   buttonContainer: { flex: 1, justifyContent: 'space-between', padding: 20 },
//   closeBtn: { alignSelf: 'flex-start' },
//   controls: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 30 },
//   shutter: { width: 70, height: 70, borderRadius: 35, borderWidth: 5, borderColor: 'white', backgroundColor: 'transparent' },
//   hintText: { color: 'white', textAlign: 'center', marginBottom: 10, fontSize: 12 },
//   btn: { backgroundColor: '#6366f1', padding: 15, borderRadius: 10, alignSelf: 'center' }
// });

// import React, { useState, useRef } from 'react';
// import { StyleSheet, Text, View, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
// import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// export default function CameraModal({ visible, onClose, onMediaCaptured }) {
//   const [facing, setFacing] = useState('back');
//   const [isRecording, setIsRecording] = useState(false);
//   const [cameraPermission, requestCameraPermission] = useCameraPermissions();
//   const [micPermission, requestMicPermission] = useMicrophonePermissions();
//   const cameraRef = useRef(null);

//   if (!visible) return null;

//   if (!cameraPermission?.granted || !micPermission?.granted) {
//     return (
//       <Modal visible={visible}>
//         <View style={styles.permissionContainer}>
//           <Text style={styles.text}>Camera & Mic access needed</Text>
//           <TouchableOpacity onPress={() => { requestCameraPermission(); requestMicPermission(); }} style={styles.btn}>
//             <Text style={{color: 'white'}}>Grant</Text>
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     );
//   }

//   const takePicture = async () => {
//     if (cameraRef.current) {
//       const photo = await cameraRef.current.takePictureAsync();
//       onMediaCaptured(photo.uri, 'image');
//       onClose();
//     }
//   };

//   const startVideo = async () => {
//     if (cameraRef.current) {
//       setIsRecording(true);
//       const video = await cameraRef.current.recordAsync();
//       onMediaCaptured(video.uri, 'video');
//       onClose();
//     }
//   };

//   return (
//     <Modal visible={visible} animationType="slide">
//       <CameraView style={styles.camera} facing={facing} ref={cameraRef} mode={isRecording ? "video" : "picture"}>
//         <SafeAreaView style={styles.overlay}>
//           <TouchableOpacity onPress={onClose} style={styles.close}>
//             <Ionicons name="close" size={30} color="white" />
//           </TouchableOpacity>
//           <View style={styles.footer}>
//             <TouchableOpacity onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}>
//               <MaterialIcons name="flip-camera-ios" size={30} color="white" />
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={takePicture}
//               onLongPress={startVideo}
//               onPressOut={() => cameraRef.current?.stopRecording()}
//               style={[styles.shutter, isRecording && {backgroundColor: 'red'}]}
//             />

//             <View style={{width: 30}} />
//           </View>
//           <Text style={styles.hint}>{isRecording ? "RECORDING" : "Tap for Photo, Hold for Video"}</Text>
//         </SafeAreaView>
//       </CameraView>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   camera: { flex: 1 },
//   overlay: { flex: 1, justifyContent: 'space-between', padding: 20 },
//   footer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 20 },
//   shutter: { width: 70, height: 70, borderRadius: 35, borderWidth: 5, borderColor: 'white' },
//   close: { alignSelf: 'flex-start' },
//   hint: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
//   permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   btn: { backgroundColor: '#6366f1', padding: 15, borderRadius: 10, marginTop: 10 }
// });

import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Video } from "expo-av";

const { width, height } = Dimensions.get("window");

export default function CameraModal({ visible, onClose, onMediaCaptured }) {
  const [facing, setFacing] = useState("back");
  const [mode, setMode] = useState("picture");
  const [previewMedia, setPreviewMedia] = useState(null); // Stores {uri, type}

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const cameraRef = useRef(null);
  const isRecordingRef = useRef(false);

  if (!visible) return null;

  // Permission Guard
  if (!cameraPermission?.granted || !micPermission?.granted) {
    return (
      <Modal visible={visible}>
        <SafeAreaView style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera and Microphone access are required to proceed.
          </Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => {
              requestCameraPermission();
              requestMicPermission();
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Grant Permissions
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    );
  }

  const handleTakePhoto = async () => {
    if (cameraRef.current && !isRecordingRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          exif: true, // Captures rotation data
        });
        setPreviewMedia({ uri: photo.uri, type: "image" });
      } catch (e) {
        console.error("Photo Error", e);
      }
    }
  };

  const handleStartRecording = async () => {
    if (cameraRef.current && !isRecordingRef.current) {
      try {
        setMode("video");
        isRecordingRef.current = true;

        // Short delay for hardware mode switch
        setTimeout(async () => {
          if (cameraRef.current) {
            const video = await cameraRef.current.recordAsync({
              maxDuration: 60,
            });
            setPreviewMedia({ uri: video.uri, type: "video" });
            setMode("picture");
            isRecordingRef.current = false;
          }
        }, 500);
      } catch (err) {
        console.error("Recording error:", err);
        isRecordingRef.current = false;
        setMode("picture");
      }
    }
  };

  const handleStopRecording = () => {
    if (isRecordingRef.current) {
      cameraRef.current?.stopRecording();
    }
  };

  const sendMedia = () => {
    onMediaCaptured(previewMedia.uri, previewMedia.type);
    setPreviewMedia(null);
    onClose();
  };

  // --- 1. PREVIEW SCREEN (Confirmation Before Sending) ---
  if (previewMedia) {
    return (
      <Modal visible={visible} animationType="fade">
        <View style={styles.container}>
          {previewMedia.type === "image" ? (
            <Image
              source={{ uri: previewMedia.uri }}
              style={styles.fullMedia}
              resizeMode="contain" // Handles landscape/portrait rotation properly
            />
          ) : (
            <Video
              source={{ uri: previewMedia.uri }}
              style={styles.fullMedia}
              useNativeControls
              shouldPlay
              isLooping
              resizeMode="contain"
            />
          )}

          {/* Overlays */}
          <SafeAreaView style={styles.previewHeader}>
            <TouchableOpacity
              style={styles.actionCircle}
              onPress={() => setPreviewMedia(null)}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
          </SafeAreaView>

          <TouchableOpacity style={styles.sendFab} onPress={sendMedia}>
            <Ionicons name="send" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  // --- 2. CAMERA INTERFACE ---
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing={facing}
          ref={cameraRef}
          mode={mode}
        />

        <SafeAreaView style={styles.overlay}>
          <TouchableOpacity style={styles.actionCircle} onPress={onClose}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>

          <View style={styles.bottomContainer}>
            <View style={styles.bottomControls}>
              <TouchableOpacity
                onPress={() =>
                  setFacing((f) => (f === "back" ? "front" : "back"))
                }
              >
                <MaterialIcons name="flip-camera-ios" size={35} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleTakePhoto}
                onLongPress={handleStartRecording}
                onPressOut={handleStopRecording}
                delayLongPress={400}
                style={[
                  styles.shutter,
                  mode === "video" && {
                    backgroundColor: "red",
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                ]}
              />

              <View style={{ width: 35 }} />
            </View>

            <Text style={styles.hint}>
              {mode === "video"
                ? "RECORDING..."
                : "Tap for Photo, Hold for Video"}
            </Text>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  fullMedia: { flex: 1, width: width, height: height },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  permissionText: {
    textAlign: "center",
    fontSize: 16,
    color: "white",
    marginBottom: 20,
  },
  overlay: { ...StyleSheet.absoluteFillObject },
  previewHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  actionCircle: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  shutter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: "white",
  },
  hint: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 15,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  sendFab: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 40,
    right: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  btn: { backgroundColor: "#6366f1", padding: 15, borderRadius: 10 },
});
