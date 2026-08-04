

// import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Fragment } from 'react';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
//npm install react-native-gesture-handler
import 'react-native-gesture-handler';
import SafeAI from "./screens/SafeAI"
import { LogBox } from 'react-native';
import StackComponent from "./screens/StackNavigations/StackComponent";

export default function App() {
LogBox.ignoreAllLogs();

  return (
    
      <Fragment style={{flex:1}} >
        <SafeAI/>
      </Fragment>
  
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
