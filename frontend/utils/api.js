

// import axios from "axios";
// import { Platform } from "react-native";

// // const API_BASE_URL = "http://10.81.95.247:8000/api";
// // const API_BASE_URL = "http://10.27.63.247:8000/api";
// // const API_BASE_URL = "http://10.183.163.247:8000/api";
// // const API_BASE_URL = "http://192.168.0.112:8000/api";
// export const API_BASE_URL = `${process.env.EXPO_PUBLIC_BASE_URL}/api`;






// /* ---------- HEALTH ---------- */
// export const pingBackend = async () => {
//   const res = await axios.get(API_BASE_URL);
//   return res.data;
// };


// /* ---------- Authentication ---------- */

// // Login API call
// export const LogInAPi = async (formData) => {
//     try {
//         // console.log(API_BASE_URL);
//         const res = await axios.post(`${API_BASE_URL}/login`, formData);
//         console.log("Login Response:", res.data);

//         return res; 
//     } catch (error) {
//         console.error("Login Error:", error);
//         throw error;
//     }
// };

// // Signup API call
// export const SignUpAPi = async (userData) => {
//     try {
//         const res = await axios.post(`${API_BASE_URL}/signup`, userData);
//         console.log("Signup Response:", res.data);
//         return res.data;
//     } catch (error) {
//         throw error.response?.data?.detail || "Registration failed";
//         console.error("Signup Error:", error);
//     }
// };

// export const forgotPasswordSendOtp = async (email) => {
//     const res = await axios.post(`${API_BASE_URL}/forgot-password/send-otp`, { email });
//     return res.data;
// };

// export const resetPasswordApi = async (email, password) => {
//     const res = await axios.post(`${API_BASE_URL}/forgot-password/reset`, { email, password });
//     return res.data;
// };

// export const checkUsernameApi = async (username) => {
//     const res = await axios.get(`${API_BASE_URL}/check-username?username=${username}`);
//     return res.data;
// };

// export const sendEmailOtpApi = async (email) => {
//     return await axios.post(`${API_BASE_URL}/send-otp`, { email: email });
// };

// // Step 2: Send Phone OTP
// export const sendPhoneOtpApi = async (phone) => {
//     return await axios.post(`${API_BASE_URL}/send-otp`, { phone: phone });
// };

// // Verify logic (Send only the identifier being verified)
// export const verifyOtpApi = async (data) => {
//     const res = await axios.post(`${API_BASE_URL}/verify-otp`, data);
//     return res.data;
// };

// /* ---------- USER DATA ---------- */

// //fetch user data
// export const fetchUserData = async () => {
//   const res = await axios.get(`${API_BASE_URL}/user-data`);
//   return res.data;
// };



// export const fetchAllUsers = async (currentUserId) => {
//   try {
//     // We pass the currentUserId to the backend so it can filter 'me' out
//     console.log("Fetching all users excluding:", currentUserId);
//     const res = await axios.get(`${API_BASE_URL}/chat/users?exclude=${currentUserId}`);
//     return res.data; // Expected: Array of user objects
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     throw error;
//   }
// };


// export const searchUsersApi = async (query, myId) => {
//     const res = await axios.get(`${API_BASE_URL}/chat/search`, {
//         params: { query, myId }
//     });
//     return res.data;
// };


// // Get all users to start a chat with
// export const fetchChatUsers = async (myId) => {
//     try {
//         const res = await axios.get(`${API_BASE_URL}/chat/users?exclude=${myId}`);
//         return res.data;
//     } catch (error) {
//         console.error("Fetch Users Error:", error);
//         throw error;
//     }
// };

// // 2. Fetch chat history between two specific users
// // export const fetchChatHistory = async (senderId, receiverId) => {
// //   try {
// //     const res = await axios.get(`${API_BASE_URL}/chat/history`, {
// //       params: { senderId, receiverId }
// //     });
// //     return res.data; // Expected: Array of message objects
// //   } catch (error) {
// //     console.error("Error fetching chat history:", error);
// //     throw error;
// //   }
// // };

// export const fetchChatHistory = async (senderId, receiverId, skip = 0) => {
//   try {
//     const res = await axios.get(`${API_BASE_URL}/chat/history`, {
//       params: { senderId, receiverId, limit: 20, skip: skip }
//     });
//     return res.data;
//   } catch (error) {
//     return [];
//   }
// };

// // 3. Update User Status (for the 24-hour status feature)
// export const uploadUserStatus = async (userId, statusData) => {
//   // statusData would be your FormData for image/video
//   try {
//     const res = await axios.post(`${API_BASE_URL}/status/upload`, statusData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return res.data;
//   } catch (error) {
//     console.error("Status Upload Error:", error);
//     throw error;
//   }
// };

// export const deleteStatusApi = async (statusId, userId) => {
//     const res = await axios.delete(`${API_BASE_URL}/status/${statusId}?user_id=${userId}`);
//     return res.data;
// };


// export const uploadImage = async (imageUri) => {
//   const formData = new FormData();
//   const filename = imageUri.split('/').pop();
  
//   formData.append("file", {
//     uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
//     name: filename,
//     type: 'image/jpeg',
//   });

//   try {
//     const res = await axios.post(
//         `${API_BASE_URL}/test-image`, 
//         formData, 
//         {
//             headers: { "Content-Type": "multipart/form-data" },
//             timeout: 60000,
//         }
//     );
//     return res.data;
//   } catch (error) {
//     // Detailed logging to find the cause
//     if (error.response) {
//         console.error("Backend Error:", error.response.data);
//     } else if (error.request) {
//         console.error("Network Error: Check if Backend is running or IP changed.");
//     }
//     throw error;
//   }
// };


// export const getProfileApi = async (userId) => {
//     // Hits the @router.get("/{user_id}") route in your profile_routes.py
//     const res = await axios.get(`${API_BASE_URL}/profile/${userId}`);
//     return res.data;
// };

// /* ---------- AUDIO ---------- */

// export const uploadAudio = async (audioUri) => {
//   const formData = new FormData();
//   formData.append("file", {
//     uri: audioUri,
//     name: "voice.m4a",
//     type: "audio/m4a",
//   });

//   try {
//     const res = await axios.post(
//       `${API_BASE_URL}/test-audio`,
//       formData,
//       {
//         headers: { "Content-Type": "multipart/form-data" },
//         timeout: 90000, // 🚨 INCREASED TO 90 SECONDS
//       }
//     );
//     return res.data;
//   } catch (error) {
//     console.error("Audio API Error:", error);
//     throw error;
//   }
// };


// export const uploadVideo = async (videoUri) => {
//   const formData = new FormData();
//   const filename = videoUri.split('/').pop();
//   formData.append("file", {
//     uri: Platform.OS === 'android' ? videoUri : videoUri.replace('file://', ''),
//     name: filename,
//     type: 'video/mp4',
//   });

//   console.log("Uploading video:", filename);
//   try {
//     const res = await axios.post(
//         `${API_BASE_URL}/test-video`, 
//         formData, 
//         {
//             headers: { "Content-Type": "multipart/form-data" },
//             timeout: 60000,
//         }
//     );
//     return res.data;
//   } catch (error) {
//     // Detailed logging to find the cause
//     if (error.response) {
//         console.error("Backend Error:", error.response.data);
//     } else if (error.request) {
//         console.error("Network Error: Check if Backend is running or IP changed.");
//     }
//     throw error;
//   }
// }



// export const sendChatMessage = async (senderId, receiverId, type, content) => {
//   const formData = new FormData();
//   formData.append("senderId", senderId);
//   formData.append("receiverId", receiverId);
//   formData.append("msgType", type); // Use 'msgType' to match backend Form(...)

//   if (type === "text") {
//     formData.append("text", content);
//   } else {
//     const filename = content.split('/').pop();
//     const ext = filename.split('.').pop();
//     formData.append("file", {
//       uri: content,
//       name: filename,
//       type: type === "image" ? `image/${ext}` : type === "video" ? `video/${ext}` : `audio/${ext}`,
//     });
//   }

//   // Use the '/send' endpoint we created in chat_routes.py
//   const res = await axios.post(`${API_BASE_URL}/chat/send`, formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return res.data;
// };


// export const deleteBulkMessagesApi = async (messageIds, userId) => {
//   const res = await axios.delete(`${API_BASE_URL}/chat/delete-bulk`, {
//     data: { messageIds, userId } // Axios delete with body uses 'data' key
//   });
//   return res.data;
// };

// export const forwardMessagesApi = async (messageIds, senderId, receiverIds) => {
//     const res = await axios.post(`${API_BASE_URL}/chat/forward`, {
//         messageIds,
//         senderId,
//         receiverIds
//     });
//     return res.data;
// };

// export const clearChatApi = async (senderId, receiverId) => {
//     const res = await axios.delete(`${API_BASE_URL}/chat/history/clear`, {
//         params: { senderId, receiverId }
//     });
//     return res.data;
// };

// export const toggleBlockApi = async (myId, targetId, action) => {
//     const res = await axios.post(`${API_BASE_URL}/chat/block`, { myId, targetId, action });
//     return res.data;
// };


// export const fetchRecentChats = async (myId) => {

//   // console.log("Fetching recent chats for user ID:", myId);
//     const res = await axios.get(`${API_BASE_URL}/chat/recent`, {
//         params: { myId }
//     });
//     // console.log("Fetched recent chats:", res.data);
//     return res.data;
// };

// export const syncContactsApi = async (myId, phones) => {
//     const res = await axios.post(`${API_BASE_URL}/chat/sync-contacts`, { myId, phones });
//     return res.data;
// };



// /* ---------- MESSAGES ---------- */
// export const fetchMessages = async () => {
//   const res = await axios.get(`${API_BASE_URL}/messages`);
//   console.log("Fetched messages:", res.data);
//   return res.data;
// };

// export const sendMessage = async (text) => {
//   const res = await axios.post(`${API_BASE_URL}/messages`, {
//     text: text,
//   });

//   console.log("Sent message:", text);
//   console.log("Model response:", res.data);

//   return {
//     id: Date.now(),
//     type: "text",
//     isUser: false,
//     prediction: res.data.prediction,
//     confidence: res.data.confidence,
//   };
// };


// /* ---------- Survellince Mode ---------- */

// export const getMutualSurveillanceStatus = async (myId, targetId) => {
//     const res = await axios.get(`${API_BASE_URL}/chat/surveillance/status`, {
//         params: { myId, targetId }
//     });
//     return res.data;
// };


// export const toggleSurveillanceAPI = async (userId, recipientId, action) => {
//   // Ensure we use the keys 'userId' and 'targetId' to match the router
//   console.log("Toggling surveillance:", { userId, recipientId, action });
  
//   const res = await axios.post(`${API_BASE_URL}/chat/surveillance/toggle`, {
//     userId: userId,     // Becomes data.get("userId") in Python
//     targetId: recipientId, // Becomes data.get("targetId") in Python
//     action: action
//   });
//   return res.data;
// };


// // ---------- STATUS ---------- //
// export const postStatus = async (formData) => {
//     const res = await axios.post(`${API_BASE_URL}/status/upload`, formData, {
//         headers: { "Content-Type": "multipart/form-data" }
//     });
//     return res.data;
// };

// export const fetchStatuses = async () => {
//     const res = await axios.get(`${API_BASE_URL}/status`);
//     return res.data;
// };

// //Profile Update API Call
// export const updateProfileApi = async (formData) => {
//   const res = await axios.put(`${API_BASE_URL}/profile/update`, formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });
//   return res.data;
// };








import axios from "axios";
import { Platform } from "react-native";

// const API_BASE_URL = "http://10.81.95.247:8000/api";
// const API_BASE_URL = "http://10.27.63.247:8000/api";
// const API_BASE_URL = "http://10.183.163.247:8000/api";
// const API_BASE_URL = "http://192.168.0.112:8000/api";
export const API_BASE_URL = `${process.env.EXPO_PUBLIC_BASE_URL}/api`;






/* ---------- HEALTH ---------- */
export const pingBackend = async () => {
  const res = await axios.get(API_BASE_URL);
  return res.data;
};


/* ---------- Authentication ---------- */

// Login API call
export const LogInAPi = async (formData) => {
    try {
        // console.log(API_BASE_URL);
        const res = await axios.post(`${API_BASE_URL}/login`, formData);
        console.log("Login Response:", res.data);

        return res; 
    } catch (error) {
        console.error("Login Error:", error);
        throw error;
    }
};

// Signup API call
export const SignUpAPi = async (userData) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/signup`, userData);
        console.log("Signup Response:", res.data);
        return res.data;
    } catch (error) {
        throw error.response?.data?.detail || "Registration failed";
        console.error("Signup Error:", error);
    }
};

export const forgotPasswordSendOtp = async (email) => {
    const res = await axios.post(`${API_BASE_URL}/forgot-password/send-otp`, { email });
    return res.data;
};

export const resetPasswordApi = async (email, password) => {
    const res = await axios.post(`${API_BASE_URL}/forgot-password/reset`, { email, password });
    return res.data;
};

export const checkUsernameApi = async (username) => {
    const res = await axios.get(`${API_BASE_URL}/check-username?username=${username}`);
    return res.data;
};

export const sendEmailOtpApi = async (email) => {
    return await axios.post(`${API_BASE_URL}/send-otp`, { email: email });
};

export const verifyEmailOtpApi = async ({ email, otp }) => {
  const res = await axios.post(`${API_BASE_URL}/verify-otp`, {
    email,
    otp
  });
  return res.data;
};

// Step 2: Send Phone OTP
// SEND OTP
export const sendPhoneOtpApi = async (phone) => {
  const res = await axios.post(`${API_BASE_URL}/send-phone-otp`, {
    phone
  });
  return res.data;
};

// VERIFY OTP
export const verifyOtpApi = async ({ phone, otp }) => {
  const res = await axios.post(`${API_BASE_URL}/verify-phone-otp`, {
    phone,
    otp
  });
  return res.data;
};

/* ---------- USER DATA ---------- */

//fetch user data
export const fetchUserData = async () => {
  const res = await axios.get(`${API_BASE_URL}/user-data`);
  return res.data;
};



export const fetchAllUsers = async (currentUserId) => {
  try {
    // We pass the currentUserId to the backend so it can filter 'me' out
    console.log("Fetching all users excluding:", currentUserId);
    const res = await axios.get(`${API_BASE_URL}/chat/users?exclude=${currentUserId}`);
    return res.data; // Expected: Array of user objects
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};


export const searchUsersApi = async (query, myId) => {
    const res = await axios.get(`${API_BASE_URL}/chat/search`, {
        params: { query, myId }
    });
    return res.data;
};


// Get all users to start a chat with
export const fetchChatUsers = async (myId) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/chat/users?exclude=${myId}`);
        return res.data;
    } catch (error) {
        console.error("Fetch Users Error:", error);
        throw error;
    }
};

// 2. Fetch chat history between two specific users
// export const fetchChatHistory = async (senderId, receiverId) => {
//   try {
//     const res = await axios.get(`${API_BASE_URL}/chat/history`, {
//       params: { senderId, receiverId }
//     });
//     return res.data; // Expected: Array of message objects
//   } catch (error) {
//     console.error("Error fetching chat history:", error);
//     throw error;
//   }
// };

export const fetchChatHistory = async (senderId, receiverId, skip = 0) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/chat/history`, {
      params: { senderId, receiverId, limit: 20, skip: skip }
    });
    return res.data;
  } catch (error) {
    return [];
  }
};

// 3. Update User Status (for the 24-hour status feature)
export const uploadUserStatus = async (userId, statusData) => {
  // statusData would be your FormData for image/video
  try {
    const res = await axios.post(`${API_BASE_URL}/status/upload`, statusData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error("Status Upload Error:", error);
    throw error;
  }
};

export const deleteStatusApi = async (statusId, userId) => {
    const res = await axios.delete(`${API_BASE_URL}/status/${statusId}?user_id=${userId}`);
    return res.data;
};


export const uploadImage = async (imageUri) => {
  const formData = new FormData();
  const filename = imageUri.split('/').pop();
  
  formData.append("file", {
    uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
    name: filename,
    type: 'image/jpeg',
  });

  try {
    const res = await axios.post(
        `${API_BASE_URL}/test-image`, 
        formData, 
        {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 60000,
        }
    );
    return res.data;
  } catch (error) {
    // Detailed logging to find the cause
    if (error.response) {
        console.error("Backend Error:", error.response.data);
    } else if (error.request) {
        console.error("Network Error: Check if Backend is running or IP changed.");
    }
    throw error;
  }
};


export const getProfileApi = async (userId) => {
    // Hits the @router.get("/{user_id}") route in your profile_routes.py
    const res = await axios.get(`${API_BASE_URL}/profile/${userId}`);
    return res.data;
};

/* ---------- AUDIO ---------- */

export const uploadAudio = async (audioUri) => {
  const formData = new FormData();
  formData.append("file", {
    uri: audioUri,
    name: "voice.m4a",
    type: "audio/m4a",
  });

  try {
    const res = await axios.post(
      `${API_BASE_URL}/test-audio`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 90000, // 🚨 INCREASED TO 90 SECONDS
      }
    );
    return res.data;
  } catch (error) {
    console.error("Audio API Error:", error);
    throw error;
  }
};


export const uploadVideo = async (videoUri) => {
  const formData = new FormData();
  const filename = videoUri.split('/').pop();
  formData.append("file", {
    uri: Platform.OS === 'android' ? videoUri : videoUri.replace('file://', ''),
    name: filename,
    type: 'video/mp4',
  });

  console.log("Uploading video:", filename);
  try {
    const res = await axios.post(
        `${API_BASE_URL}/test-video`, 
        formData, 
        {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 60000,
        }
    );
    return res.data;
  } catch (error) {
    // Detailed logging to find the cause
    if (error.response) {
        console.error("Backend Error:", error.response.data);
    } else if (error.request) {
        console.error("Network Error: Check if Backend is running or IP changed.");
    }
    throw error;
  }
}



export const sendChatMessage = async (senderId, receiverId, type, content) => {
  const formData = new FormData();
  formData.append("senderId", senderId);
  formData.append("receiverId", receiverId);
  formData.append("msgType", type); // Use 'msgType' to match backend Form(...)

  if (type === "text") {
    formData.append("text", content);
  } else {
    const filename = content.split('/').pop();
    const ext = filename.split('.').pop();
    formData.append("file", {
      uri: content,
      name: filename,
      type: type === "image" ? `image/${ext}` : type === "video" ? `video/${ext}` : `audio/${ext}`,
    });
  }

  // Use the '/send' endpoint we created in chat_routes.py
  const res = await axios.post(`${API_BASE_URL}/chat/send`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};


export const deleteBulkMessagesApi = async (messageIds, userId) => {
  const res = await axios.delete(`${API_BASE_URL}/chat/delete-bulk`, {
    data: { messageIds, userId } // Axios delete with body uses 'data' key
  });
  return res.data;
};

export const forwardMessagesApi = async (messageIds, senderId, receiverIds) => {
    const res = await axios.post(`${API_BASE_URL}/chat/forward`, {
        messageIds,
        senderId,
        receiverIds
    });
    return res.data;
};

export const clearChatApi = async (senderId, receiverId) => {
    const res = await axios.delete(`${API_BASE_URL}/chat/history/clear`, {
        params: { senderId, receiverId }
    });
    return res.data;
};

export const toggleBlockApi = async (myId, targetId, action) => {
    const res = await axios.post(`${API_BASE_URL}/chat/block`, { myId, targetId, action });
    return res.data;
};


export const fetchRecentChats = async (myId) => {

  // console.log("Fetching recent chats for user ID:", myId);
    const res = await axios.get(`${API_BASE_URL}/chat/recent`, {
        params: { myId }
    });
    // console.log("Fetched recent chats:", res.data);
    return res.data;
};

export const syncContactsApi = async (myId, phones) => {
    const res = await axios.post(`${API_BASE_URL}/chat/sync-contacts`, { myId, phones });
    return res.data;
};



/* ---------- MESSAGES ---------- */
export const fetchMessages = async () => {
  const res = await axios.get(`${API_BASE_URL}/messages`);
  console.log("Fetched messages:", res.data);
  return res.data;
};

export const sendMessage = async (text) => {
  const res = await axios.post(`${API_BASE_URL}/messages`, {
    text: text,
  });

  console.log("Sent message:", text);
  console.log("Model response:", res.data);

  return {
    id: Date.now(),
    type: "text",
    isUser: false,
    prediction: res.data.prediction,
    confidence: res.data.confidence,
  };
};


/* ---------- Survellince Mode ---------- */

export const getMutualSurveillanceStatus = async (myId, targetId) => {
    const res = await axios.get(`${API_BASE_URL}/chat/surveillance/status`, {
        params: { myId, targetId }
    });
    return res.data;
};


export const toggleSurveillanceAPI = async (userId, recipientId, action) => {
  // Ensure we use the keys 'userId' and 'targetId' to match the router
  console.log("Toggling surveillance:", { userId, recipientId, action });
  
  const res = await axios.post(`${API_BASE_URL}/chat/surveillance/toggle`, {
    userId: userId,     // Becomes data.get("userId") in Python
    targetId: recipientId, // Becomes data.get("targetId") in Python
    action: action
  });
  return res.data;
};


// ---------- STATUS ---------- //
export const postStatus = async (formData) => {
    const res = await axios.post(`${API_BASE_URL}/status/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
};

export const fetchStatuses = async () => {
    const res = await axios.get(`${API_BASE_URL}/status`);
    return res.data;
};

//Profile Update API Call
export const updateProfileApi = async (formData) => {
  const res = await axios.put(`${API_BASE_URL}/profile/update`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};