// In App.js in a new project

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './src/Screens/HomeScreen/HomeScreen';
import SecondScreen from './src/Screens/SecondScreen/SecondScreen';
import LoginScreen from './src/Screens/LoginScreen/LoginScreen';
import { NativeBaseProvider } from 'native-base';
import RegisterScreen from './src/Screens/RegisterScreen/RegisterScreen';
import { Provider as AuthProvider } from './src/Context/AuthContext';


const Drawer = createDrawerNavigator();

const App = () => {
  return (
    <NativeBaseProvider>
      <NavigationContainer>
        <Drawer.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerShown: true,
            headerTintColor: "pink"
        }}>
          <Drawer.Screen name="Home" component={HomeScreen} />
          <Drawer.Screen name="Second" component={SecondScreen} />
          <Drawer.Screen name="Login" options={{ headerShown:false }} component={LoginScreen} />
          <Drawer.Screen name="Register" options={{ headerShown:false }} component={RegisterScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
}

export default () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};