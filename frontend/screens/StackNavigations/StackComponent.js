
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import BottomBar from "../BottomBarNavigations/BottomBar";
import chartScreen from './ChatScreen';
import SearchScreen from '../BottomBarNavigations/SearchScreen';
import SettingsScreen from './SettingsScreen';
import InfoScreen from './InfoScreen';

const Stack = createStackNavigator();

const StackComponent = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={BottomBar}
        options={{ headerShown: false }}
      />
      <Stack.Screen name= 'IndividualChats' component={chartScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="InfoScreen" component={InfoScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
    
  );
};

export default StackComponent;
