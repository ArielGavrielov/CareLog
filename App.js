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
import SplashScreen from './src/Screens/SplashScreen';

import { Provider as AuthProvider, Context as AuthContext } from './src/Context/AuthContext';
import { navigationRef, isReadyRef } from './src/navigationRef';
import { NativeBaseProvider } from "native-base";
//import AsyncStorage from '@react-native-async-storage/async-storage';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  const { state, restoreToken } = useContext(AuthContext);

  React.useEffect(() => {
    restoreToken();
    return () => {
      isReadyRef.current = false
    };
  }, []);

  if(state.isLoading) {
    return <SplashScreen />
  }

  console.log(state);

  return (
      <NavigationContainer 
      ref={ navigationRef }
      onReady={() => {
        isReadyRef.current = true;
      }}
      >
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
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{
              headerShown: false,
              animationTypeForReplace: state.isSignout ? 'pop' : 'push'
            }}
          />
          <Stack.Screen
            name="Register"
            options={{ headerShown:false }}
            component={SignupScreen}
            options={{
              headerShown: false,
              animationTypeForReplace: 'push'
            }}
          />
        </Stack.Navigator>
        }
      </NavigationContainer>
  );
}

export default () => {
  return (
    <AuthProvider>
      <NativeBaseProvider>
        <StatusBar style="auto" />
        <App />
      </NativeBaseProvider>
    </AuthProvider>
  );
};