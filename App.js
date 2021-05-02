// In App.js in a new project

import React, { useContext } from 'react';
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/Screens/HomeScreen/HomeScreen';
import SecondScreen from './src/Screens/SecondScreen/SecondScreen';
import LoginScreen from './src/Screens/LoginScreen/LoginScreen';
import { NativeBaseProvider } from 'native-base';
import { Icon } from 'react-native-elements';
import RegisterScreen from './src/Screens/RegisterScreen/RegisterScreen';
import { Provider as AuthProvider, Context as AuthContext } from './src/Context/AuthContext';
import { setNavigator } from './src/navigationRef';
import AccountScreen from './src/Screens/AccountScreen/AccountScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const App = () => {
  const { state } = useContext(AuthContext);
  console.log(state.token);
  return (
    <NativeBaseProvider>
      <NavigationContainer ref={(navigator) => setNavigator(navigator)}>
        {state.token ?
          <Drawer.Navigator
          initialRouteName="Home"
          screenOptions={({route, navigation}) => ({
            headerRight: () => (
              <Icon 
                style={{marginRight: 15}}
                onPress={() => navigation.navigate('Account')}
                name='user'
                type='feather'
                color='pink'
              />
            ),
            headerShown: true,
            headerTintColor: "pink"
        })}>
          <Drawer.Screen name="Home" component={HomeScreen} />
          <Drawer.Screen name="Second" component={SecondScreen} />
          <Drawer.Screen name="Account" component={AccountScreen} />
        </Drawer.Navigator>
        :
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" options={{ headerShown:false }} component={LoginScreen} />
          <Stack.Screen name="Register" options={{ headerShown:false }} component={RegisterScreen} />
        </Stack.Navigator>
        }
      </NavigationContainer>
    </NativeBaseProvider>
  );
}

export default () => {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <App/>
    </AuthProvider>
  );
};