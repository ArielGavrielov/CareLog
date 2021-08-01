import React, { useContext } from 'react';
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
import { Icon, Header } from 'react-native-elements';
import SignupScreen from './src/Screens/SignupScreen';
import Questionnaire from './src/Screens/Questionnaire';
import SplashScreen from './src/Screens/SplashScreen';

import { Provider as AuthProvider, Context as AuthContext } from './src/Context/AuthContext';
import { navigationRef, isReadyRef } from './src/navigationRef';
import { NativeBaseProvider } from "native-base";
import ForgotScreen from './src/Screens/ForgotScreen';

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
  
  if(state.isLoading || !state.userDetails && !state.isSignout) {
    return <SplashScreen />
  }

  return (
      <NavigationContainer 
      ref={ navigationRef }
      onReady={() => {
        isReadyRef.current = true;
      }}
      >
        {state.token !== null ?
        <>
          <Header backgroundColor='white'
          leftComponent={{ icon: 'menu', color: '#000', iconStyle: { color: '#fff' } }}
          centerComponent={{ text:"Hello " + state.userDetails.fname, style: { color: '#000' } }}
          rightComponent={{ icon: 'home', color: '#fff' }}
          />
        <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({route, navigation}) => ({
          headerTitle: 'TEST',
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
          <Tab.Screen name="Home" options={{title: "Home"}} component={HomeScreen} />
          <Tab.Screen name="Files" options={{title: "Files"}} component={SecondScreen} />
          <Tab.Screen name="Profile" options={{title: "Profile"}} component={AccountScreen} />
          <Tab.Screen name="Statistics" options={{title: "Statistics"}} component={StatisticsScreen} />
          <Tab.Screen name="Questionnaire" options={{title: "Questionnaire"}} component={Questionnaire} />
        </Tab.Navigator>
        </>
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
          <Stack.Screen
            name="Forgot"
            options={{ headerShown:false }}
            component={ForgotScreen}
            options={{
              headerShown: false,
              animationTypeForReplace: 'pop'
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