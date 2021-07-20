import React, { useContext } from 'react';
import { ScrollView } from 'react-native';
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/Screens/HomeScreen';
import SecondScreen from './src/Screens/SecondScreen';
import LoginScreen from './src/Screens/LoginScreen';
import AccountScreen from './src/Screens/AccountScreen';
import StatisticsScreen from './src/Screens/StatisticsScreen';
import { Icon } from 'react-native-elements';
import SignupScreen from './src/Screens/SignupScreen';
import Questionnaire from './src/Screens/Questionnaire';

import { Provider as AuthProvider, Context as AuthContext } from './src/Context/AuthContext';
import { setNavigator } from './src/navigationRef';
import { NativeBaseProvider } from "native-base";
import AuthLoadingScreen from './src/Screens/AuthLoadingScreen';
//import AsyncStorage from '@react-native-async-storage/async-storage';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const logged = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name=""></Stack.Screen>
    </Stack.Navigator>
  )
}

const App = () => {
  //let token = await AsyncStorage.getItem("token");
  //if()
  const { state, isLoading } = useContext(AuthContext);
  //if(!state.token)
  //  tryLocalSignin();
  console.log(isLoading);
  return (
      <NavigationContainer 
      ref={ (navigator) => setNavigator(navigator) }>
        {state.token !== null ?
        <Drawer.Navigator
        initialRouteName="Home"
        screenOptions={({route, navigation}) => ({
          headerRight: () => (
            <Icon 
              style={{marginRight: 15}}
              onPress={() => navigation.navigate('Profile')}
              name='user'
              type='feather'
              color='pink'
            />
          ),
          headerShown: true,
          headerTintColor: "pink"
      })}>
          <Drawer.Screen name="Home" options={{title: "Home"}} component={HomeScreen} />
          <Drawer.Screen name="Files" options={{title: "Files"}} component={SecondScreen} />
          <Drawer.Screen name="Profile" options={{title: "Profile"}} component={AccountScreen} />
          <Drawer.Screen name="Statistics" options={{title: "Statistics"}} component={StatisticsScreen} />
          <Drawer.Screen name="Questionnaire" options={{title: "Questionnaire"}} component={Questionnaire} />
        </Drawer.Navigator>
        :
        <Stack.Navigator initialRouteName="AuthLoading">
          <Stack.Screen name="AuthLoading" options={{ headerShown:false }} component={AuthLoadingScreen} />
          <Stack.Screen name="Login" options={{ headerShown:false }} component={LoginScreen} />
          <Stack.Screen name="Register" options={{ headerShown:false }} component={SignupScreen} />
        </Stack.Navigator>
        }
      </NavigationContainer>
  );
}

export default () => {
  return (
    <NativeBaseProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <App />
      </AuthProvider>
    </NativeBaseProvider>
  );
};