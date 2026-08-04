// import React from "react";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { NavigationContainer } from "@react-navigation/native";
// import { Ionicons } from "@expo/vector-icons"; // for icons
// import AllChatScreen from "./AllCharts";
// import StatusScreen from "./StatusScreen";
// import SearchScreen from "./SearchScreen";


// const BottomBar = () => {
//     const Tab = createBottomTabNavigator();
//   return (
//       <Tab.Navigator
//         screenOptions={({ route }) => ({
//           headerShown: false,
//           tabBarActiveTintColor: "#007AFF",
//           tabBarInactiveTintColor: "gray",
//           tabBarStyle: {
//             backgroundColor: "#fff",
//             borderTopColor: "#ccc",
//             borderTopWidth: 1,
//             height: 60,
//             paddingBottom: 5,
//           },
//           tabBarIcon: ({ color, size }) => {
//             let iconName;

//             if (route.name === "Chat") {
//               iconName = "chatbubble-ellipses";
//             } else if (route.name === "Status") {
//               iconName = "albums";
//             } else if (route.name === "Search") {
//               iconName = "search";
//             }

//             return <Ionicons name={iconName} size={size} color={color} />;
//           },
//         })}
//       >
//         <Tab.Screen name="Chat" component={AllChatScreen} />
//         <Tab.Screen name="Search" component={SearchScreen} />
//         <Tab.Screen name="Status" component={StatusScreen} />
//       </Tab.Navigator>
//   );
// }


// export default BottomBar;


import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons"; 
import AllChatScreen from "./AllCharts";
import StatusScreen from "./StatusScreen";
import SearchScreen from "./SearchScreen";
import ProfileScreen from "./ProfileScreen";

const Tab = createBottomTabNavigator(); // Define outside or inside, but no Container

const BottomBar = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#ccc",
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 5,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Chat") {
            iconName = "chatbubble-ellipses";
          } else if (route.name === "Status") {
            iconName = "albums";
          } else if (route.name === "Search") {
            iconName = "search";
          } else if (route.name === "Profile") {
            iconName = "person-circle";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Chat" component={AllChatScreen} />
      {/* <Tab.Screen name="Search" component={SearchScreen} /> */}
      <Tab.Screen name="Status" component={StatusScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default BottomBar;