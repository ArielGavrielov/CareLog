import React, { useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, SafeAreaView, Text, View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import { Button } from 'react-native-elements';
import Modal from 'react-native-modal';

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
import { navigationRef, isReadyRef, navigate } from './src/navigationRef';
import { NativeBaseProvider } from "native-base";
import ForgotScreen from './src/Screens/ForgotScreen';
import MedicinesScreen from './src/Screens/MedicinesScreen';
import EventsScreen from './src/Screens/EventsScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  const [isOffline, setOfflineStatus] = React.useState(false);
  const { state, restoreToken } = useContext(AuthContext);
  const [headerText, setHeaderText] = React.useState('');
  const scheme = useColorScheme();

  React.useEffect(() => {
    const removeNetInfoSubscription = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable);
      console.log(offline);
      setOfflineStatus(offline);
    });

    restoreToken();

    return () => {
      isReadyRef.current = false
      removeNetInfoSubscription();
    };
  }, []);

  const NoInternetModal = ({show, onRetry, isRetrying}) => (
    <Modal isVisible={show} style={styles.modal} animationInTiming={600}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Connection Error</Text>
        <Text style={styles.modalText}>
          Oops! Looks like your device is not connected to the Internet.
        </Text>
        <Button title='Try Again' onPress={onRetry} disabled={isRetrying} />
      </View>
    </Modal>
  );
  
  /*if(!useNetInfo().isInternetReachable) 
    return <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Check your internet connection...</Text>
    </View>*/

  if(state.isLoading) {
    return <SplashScreen />
  }

  const tabNav = () => {
    return (
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
            name="Events"
            options={{
              title: "Events",
              tabBarIcon: ({ color, size }) => (
                <Icon 
                  name='calendar'
                  type='feather'
                  color={color}
                  size={size}
                />
              )
            }} 
            component={EventsScreen} 
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
            name="Medicines" 
            options={{
              title: "Medicines",
              tabBarIcon: ({ color, size }) => (
                <Icon 
                  name='capsules'
                  type='font-awesome-5'
                  color={color}
                  size={size}
                />
              )
            }} 
            component={MedicinesScreen} 
          />
        </Tab.Navigator>
    );
  };

  return (
      <NavigationContainer 
      onStateChange={(s) => {
        let screenState = s.routes[s.index].state;
        if(screenState) {
          let screenIndex = screenState.index;
          let screenName = screenState.routeNames[screenIndex];
          if(state.userDetails !== null)
            setHeaderText(screenName == 'Home' ? "Hello " + state.userDetails.firstname : screenName);
          else
            setHeaderText(screenName);
        } else
          setHeaderText(s.routeNames[s.index]);
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
        if(state.userDetails !== null)
          setHeaderText("Hello " + state.userDetails.firstname);
        else
          setHeaderText("Home");
        isReadyRef.current = true;
      }}
      >
        {state.token !== null ?
        <>
          <Header backgroundColor='white'
          leftComponent={{ icon: 'menu', color: '#000', iconStyle: { color: '#fff' } }}
          centerComponent={{ text: headerText, style: { color: '#000' } }}
          rightComponent={<Icon 
            name='user'
            type='feather'
            onPress={() => {if(isReadyRef.current) navigate('Profile');}}
          />}
          />
          <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Home" component={tabNav} />
            <Stack.Screen name="Profile" component={AccountScreen} />
          </Stack.Navigator>
        </>
        :
        <SafeAreaView style={{flex: 1}}>
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
        <NoInternetModal
            show={isOffline}
            onRetry={() => restoreToken()}
            isRetrying={state.isLoading}
        />
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

const styles = StyleSheet.create({
  // ...
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  modalText: {
    fontSize: 18,
    color: '#555',
    marginTop: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
  },
});