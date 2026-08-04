import { useEffect, useState } from "react";
import { View,Text, Image, ActivityIndicator  } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
// import LottieView from 'lottie-react-native';


import Signup from "./SignUp";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import StackComponent from "./StackNavigations/StackComponent";
import { LogInAPi } from "../utils/api";




const SafeAI = ()=>{
  const Stack = createStackNavigator();
  // const [Logined,SetLogined] =useState(false);
  // useEffect(()=>{
  //   const get_Login_Status = async()=>{
  //     const Login_Status = await AsyncStorage.getItem("isLoggedIn");
  //     console.log(Login_Status,"Login_Status");
  //     if(Login_Status)SetLogined(true);
  //   }
  //   get_Login_Status();
  // })
  return(
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown : false}}>
        <Stack.Screen name="Loader" component={Loader} />
        {/* {Logined?<></>:<Stack.Screen name="Login" component={Login} /> }
        {Logined?<></>:<Stack.Screen name="Signup" component={Signup} /> } */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="Home" component={StackComponent} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default SafeAI;















// Loader Page
// export const Loader =()=>{
//   const navigation = useNavigation();
//   const get_Login_Status = async()=>{
//     // console.log("get_Login_Status");
//     const Login_Status = await AsyncStorage.getItem("isLoggedIn");
//     if(Login_Status){
//       // const Email = await AsyncStorage.getItem("Email");
//       // const Password = await AsyncStorage.getItem("Password");

//       const userDetails = await AsyncStorage.getItem('userDetails');
//       const userDetailsJson = JSON.parse(userDetails);
//       const Email = userDetailsJson.email || userDetailsJson.Email;
//       const Password = userDetailsJson.password || userDetailsJson.Password;

//       if(Email && Password){
//           const data={Email:Email,Password:Password};
//           const res = await LogInAPi(data);
//           if(res.status==202)navigation.reset({index: 0,routes: [{ name: "Chat" }],});
//           else{navigation.reset({index: 0,routes: [{ name: "Login" }],});}
//       }else{navigation.reset({index: 0,routes: [{ name: "Login" }],});}
//     }else{navigation.reset({index: 0,routes: [{ name: "Login" }],});}
//   }
//   setTimeout(()=>{get_Login_Status()},5000)
  
//  return(
//   <View style={{flex:1,}}>
//     {/* <View style={{width:"200px",height:"200px",justifyContent:"center",alignItems:"center", borderRadius: '50%', overflow: 'hidden'}}>
//       <Image source={require("../assets/AppLogo.jpg")} style={{width:200,height:200, resizeMode:"contain" }}/>
//     </View> */}
//     {/* <LottieView source={require("../assets/LottieLoadingAnimation.json")} autoPlay loop style={{width:200,height:200}}/> */}
//     {/* <LottieView source={require("../assets/JobPath_Animation_Final.json")} autoPlay loop style={{width:200,height:200}}/> */}
//     <View style= {{flex : 1}}>
      
//     </View>
//   </View>
//  )
// }


// Inside Loader Component
export const Loader = () => {
  const navigation = useNavigation();

  const get_Login_Status = async () => {
    try {
      const Login_Status = await AsyncStorage.getItem("isLoggedIn");
      
      if (Login_Status === "true") {
        const userDetails = await AsyncStorage.getItem('userDetails');
        if (userDetails) {
          const userDetailsJson = JSON.parse(userDetails);
          const Email = userDetailsJson.email || userDetailsJson.Email;
          const Password = userDetailsJson.password || userDetailsJson.Password;

          const data = { Email, Password };
          const res = await LogInAPi(data);

          if (res.status === 200 || res.status === 201) {
            navigation.reset({ index: 0, routes: [{ name: "Home" }] });
            return;
          }
        }
      }
      // If not logged in or API fails, go to Login
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (err) {
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    }
  };

  useEffect(() => {
    const timer = setTimeout(get_Login_Status, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
};