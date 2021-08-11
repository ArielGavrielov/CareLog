import React, { useContext } from 'react';
import { useColorScheme, StatusBar, SafeAreaView } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
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
import SplashScreen from './src/Screens/SplashScreen';
import IndicesScreen from './src/Screens/IndicesScreen';

import { Provider as AuthProvider, Context as AuthContext } from './src/Context/AuthContext';
import { navigationRef, isReadyRef } from './src/navigationRef';
import { NativeBaseProvider } from "native-base";
import ForgotScreen from './src/Screens/ForgotScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  const { state, restoreToken } = useContext(AuthContext);
  const [headerText, setHeaderText] = React.useState('');
  const scheme = useColorScheme();

  React.useEffect(() => {
    restoreToken();

    return () => {
      isReadyRef.current = false
    };
  }, []);

  React.useEffect(() => {
    if(isReadyRef.current && state.userDetails)
      setHeaderText(state.userDetails.firstname);
  }, [isReadyRef]);

  if(state.isLoading || !state.userDetails && !state.isSignout) {
    return <SplashScreen />
  }

  return (
      <NavigationContainer 
      onStateChange={(s) => {
        setHeaderText(s.routes[s.index].name == 'Home' ? "Hello " + state.userDetails.firstname : s.routes[s.index].name);
      }}
      theme={scheme === 'dark' ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: 'rgb(255,255,255)',
          background:'#000'
        },
      } : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: 'rgb(0,0,0)',
          background:'#fff'
        },
      }}
      ref={ navigationRef }
      onReady={() => {
        setHeaderText("Hello " + state.userDetails.firstname);
        isReadyRef.current = true;
      }}
      >
        {state.token !== null ?
        <>
          <Header backgroundColor='white'
          leftComponent={{ icon: 'menu', color: '#000', iconStyle: { color: '#fff' } }}
          centerComponent={{ text: headerText, style: { color: '#000' } }}
          rightComponent={{ icon: 'home', color: '#fff' }}
          />
        <Tab.Navigator
        initialRouteName="Home">
          <Tab.Screen
            name="Home"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Icon 
                  name='home'
                  type='feather'
                  color={color}
                  size={size}
                />
              )
            }}
            component={HomeScreen}
          />
          <Tab.Screen 
            name="Files"
            options={{
              title: "Files",
              tabBarIcon: ({ color, size }) => (
                <Icon 
                  name='file'
                  type='feather'
                  color={color}
                  size={size}
                />
              )
            }} 
            component={SecondScreen} 
          />
          <Tab.Screen 
            name="Statistics" 
            options={{
              title: "Statistics",
              tabBarIcon: ({color, size}) => (
                <Icon 
                    name='pie-chart'
                    type='feather'
                    color={color}
                    size={size}
                />
              )
            }} 
            component={StatisticsScreen} 
          />
          <Tab.Screen 
            name="Indices" 
            options={{
              title: "Indices",
              tabBarIcon: ({color, size}) => (
                <Icon 
                    name='list'
                    type='feather'
                    color={color}
                    size={size}
                />
              )
            }} 
            component={IndicesScreen} 
          />
          <Tab.Screen 
            name="Profile" 
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }) => (
                <Icon 
                  name='user'
                  type='feather'
                  color={color}
                  size={size}
                />
              )
            }} 
            component={AccountScreen} 
          />
        </Tab.Navigator>
        </>
        :
        <SafeAreaView>
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
        </SafeAreaView>
        }
      </NavigationContainer>
  );
}

export default () => {
  return (
    <AuthProvider>
      <NativeBaseProvider>
          <App />
      </NativeBaseProvider>
    </AuthProvider>
  );
};