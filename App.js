// In App.js in a new project

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './src/Screens/HomeScreen/HomeScreen';
import SecondScreen from './src/Screens/SecondScreen/SecondScreen';
import LoginScreen from './src/Screens/LoginScreen/LoginScreen';

const Drawer = createDrawerNavigator();

function App() {
  return (
      <NavigationContainer>
        <Drawer.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerShown: true
        }}>
          <Drawer.Screen name="Home" component={HomeScreen} />
          <Drawer.Screen name="Second" component={SecondScreen} />
          <Drawer.Screen name="Login" component={LoginScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
  );
}

export default App;