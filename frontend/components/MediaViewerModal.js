// import React from 'react';
// import { useCallback } from 'react';
// import { Modal, View, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
// import { Video } from 'expo-av';
// import { Ionicons } from '@expo/vector-icons';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { API_BASE_URL } from '../utils/api';

// const { width, height } = Dimensions.get('window');

// export default function MediaViewerModal({ visible, onClose, mediaUri, mediaType }) {
//   if (!mediaUri) return null;

//   console.log("MediaViewerModal - mediaType:", mediaType, "mediaUri:", mediaUri);

//   const resolveUri = useCallback((path) => {
//       if (!path) return null;
//       if (path.startsWith("file://") || path.startsWith("content://") || path.startsWith("http")) return path;
//       const baseUrl = API_BASE_URL.replace("/api", "");
//       return `${baseUrl}/${path.replace(/^\/+/, "")}`;
//     }, []);

//   return (
//     <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose}>
//       <View style={styles.container}>
//         {/* Close Button */}
//         {/* <SafeAreaView style={styles.header}>
//           <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//             <Ionicons name="close" size={30} color="white" />
//           </TouchableOpacity>
//         </SafeAreaView> */}

//         {/* Media Content */}
//         <View style={styles.content}>
//           {mediaType === 'image' ? (
//             <Image 
//               source={{ uri: resolveUri(mediaUri) }} 
//               style={styles.fullMedia} 
//               resizeMode="contain" 
//             />
//           ) : (
//             <Video
//               source={{ uri: resolveUri(mediaUri) }}
//               style={styles.fullMedia}
//               useNativeControls
//               shouldPlay = {true}
//               resizeMode="contain"
//               isLooping= {false}
//             />
//           )}
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: 'black' },
//   header: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 10,
//     paddingHorizontal: 20,
//   },
//   closeButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   fullMedia: { width: width, height: height },
// });



import React, { useCallback } from 'react';
import { Modal, View, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../utils/api'; // This is your current IP from .env

const { width, height } = Dimensions.get('window');

export default function MediaViewerModal({ visible, onClose, mediaUri, mediaType }) {
  if (!mediaUri) return null;

  // --- 🚀 THE IP-PROOF RESOLVER ---
  const resolveUri = useCallback((path) => {
    if (!path) return null;

    // 1. If it's a local mobile file, leave it alone
    if (path.startsWith("file://") || path.startsWith("content://")) return path;

    // 2. Get your CURRENT root URL from .env (e.g., http://172.28.158.247:8000)
    const currentBaseUrl = API_BASE_URL.replace("/api", "");

    let cleanPath = path;

    // 3. 🚨 THE IP SWAP LOGIC:
    // If the path is a full URL (possibly with an OLD IP)
    if (path.startsWith("http")) {
      // Look for the "/static/" part which is constant
      const parts = path.split("/static/");
      if (parts.length > 1) {
        // Take everything after /static/ and join it with CURRENT IP
        cleanPath = `/static/${parts[1]}`;
      } else {
        return path; // Fallback if it's a different external URL
      }
    }

    // 4. Clean up slashes for relative paths
    const finalPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
    
    // 5. Final Reconstructed URL
    return `${currentBaseUrl}${finalPath}`;
  }, []);

  const finalUri = resolveUri(mediaUri);

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* <SafeAreaView style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
        </SafeAreaView> */}

        <View style={styles.content}>
          {mediaType === 'image' ? (
            <Image 
              source={{ uri: finalUri }} 
              style={styles.fullMedia} 
              resizeMode="contain" 
              key={finalUri} // Force reload if URI changes
            />
          ) : (
            <Video
              source={{ uri: finalUri }}
              style={styles.fullMedia}
              useNativeControls
              shouldPlay={true} // 🚨 Video starts automatically
              resizeMode="contain"
              isLooping={false}
              key={finalUri} // 🚨 Prevents 'One-time watch' bug
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  header: { position: 'absolute', top: 40, left: 20, zIndex: 99 },
  closeButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fullMedia: { width: width, height: height },
});