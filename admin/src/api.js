// import axios from 'axios';

// // Replace this with your Python Backend IP
// const BASE_URL = "http://10.192.254.247:8000/api/admin";

// export const getDashboardData = async () => {
//     try {
//         const response = await axios.get(`${BASE_URL}/stats`);

//         console.log(response.data);
//         return response.data;
//     } catch (error) {
//         console.error("Error fetching data:", error);
//     }
// };



import axios from 'axios';

export const BASE_URL = "http://10.166.200.223:8000/api/admin";
// export const BASE_URL = "http://192.168.1.8:8000/api/admin";


export const getDashboardData = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/stats`);
        // response.data is the actual JSON: { totalUsers: 8, totalMessages: 98, ... }
        return response.data; 
    } catch (error) {
        console.error("Error fetching data:", error);
        return null; 
    }
};

export const getUserTrendAPI = async (period) => {
    try {
        const res = await axios.get(`${BASE_URL}/user-stats`, {
            params: { period } // Sends as ?period=1week
        });
        return res.data;
    } catch (error) {
        console.error("Trend API Error:", error);
        throw error;
    }
};

export const reportUsersAPI = async (usernames) => {
    try {
        const res = await axios.post(`${BASE_URL}/report`, { usernames });
        return res.data;
    } catch (error) {
        console.error("Report API Error:", error);
        throw error;
    }
};

export const getFlaggedLogs = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/flagged`);
        return response.data;
    } catch (error) {
        console.error("Error fetching surveillance logs:", error);
        return [];
    }
};

export const getFullConversation = async (userA, userB) => {
    // Sends: ?u1=username1&u2=username2
    const res = await axios.get(`${BASE_URL}/history`, {
        params: { u1: userA, u2: userB }
    });
    return res.data;
};

export const getAllUsers = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/users/all`);
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};

export const blockUserAPI = async (username) => {
    try {
        const response = await axios.get(`${BASE_URL}/users/block`);
        return response.data;
    } catch (error) {
        console.error("Error blocking user:", error);
        return null;
    }
};