import React, { useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { SafeAreaView, Text, View, StyleSheet, NativeModules } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack';
import NetInfo from '@react-native-community/netinfo';
import { Pedometer } from 'expo-sensors';
import { Button } from 'react-native-elements';
import Modal from 'react-native-modal';
import moment from 'moment';

import { postSteps } from './src/api/carelog';
import HomeScreen from './src/Screens/HomeScreen';
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

import registerForPushNotifications from './src/api/registerForPushNotifications';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const stepsFetch = async () => {
  try {
      let isAvailable = await Pedometer.isAvailableAsync();
      if(isAvailable) {
          const start = moment().utc().startOf('day').toDate();
          const end = moment().utc().endOf('day').toDate();
          console.log(start, end, moment(), moment.utc());

          const stepsFetched = await Pedometer.getStepCountAsync(start, end);
          await postSteps({steps: stepsFetched.steps});
          console.log(stepsFetched);
      }
  } catch(err) {
      console.log(err);
  }
}

const UnAuthApp = ({state}) => {

  return (
    <NavigationContainer 
      ref={ navigationRef }
    >
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
          component={SignupScreen}
          options={{
            headerShown: false,
            animationTypeForReplace: 'push'
          }}
        />
        <Stack.Screen
          name="Forgot"
          component={ForgotScreen}
          options={{
            headerShown: false,
            animationTypeForReplace: 'pop'
          }}
        />
      </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
);
}

const generateGreetings = () => {
  var currentHour = moment().format("HH");

  if (currentHour >= 3 && currentHour < 12) {
      return "Good Morning";
  } else if (currentHour >= 12 && currentHour < 18) {
      return "Good Afternoon";
  }   else if (currentHour >= 18 && currentHour < 21) {
      return "Good Evening";
  } else {
      return "Good Night";
  }

}

const AuthApp = ({state}) => {
  React.useEffect(() => {
    stepsFetch();
  }, []);

  React.useEffect(() => {
    console.log(Constants.isDevice);
    if(Constants.isDevice)
      registerForPushNotifications();
  }, []);

  const tabNav = () => {
    return (
      <Tab.Navigator
        initialRouteName="Home">
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
  return ( <>
    <Header backgroundColor='white'
      centerComponent={{ text: `${generateGreetings()} ${state.userDetails.firstname}`, style: { color: '#000' } }}
      rightComponent={<Icon 
        name='user'
        type='feather'
        onPress={() => {if(isReadyRef.current) navigate('Profile');}}
      />}
    />
    <NavigationContainer 
      ref={ navigationRef }
    >
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={tabNav} />
        <Stack.Screen name="Profile" component={AccountScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  </>)
}

const App = () => {
  const [isOffline, setOfflineStatus] = React.useState(false);
  const { state, restoreToken } = useContext(AuthContext);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(({ isInternetReachable }) => {
      if (typeof isInternetReachable !== 'boolean') return;
      setOfflineStatus(!isInternetReachable);
    });
    
    restoreToken();

    return () => {
      isReadyRef.current = false;
      unsubscribe();
    };
  }, []);

  const NoInternetModal = ({show, onRetry, isRetrying}) => (
    <Modal isVisible={isOffline} style={styles.modal} animationInTiming={600}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Connection Error</Text>
        <Text style={styles.modalText}>
          Oops! Looks like your device is not connected to the Internet.
        </Text>
        <Button title='Try Again' onPress={onRetry} disabled={isRetrying} />
      </View>
    </Modal>
  );

  if(state.isLoading) {
    return <SplashScreen />
  }

  return (
    <>
      {state.token !== null ? <AuthApp state={state} /> : <UnAuthApp state={state} />}
      <NoInternetModal
        show={isOffline}
        onRetry={() => NativeModules.DevSettings.reload()}
        isRetrying={state.isLoading}
      />
    </>
  );
}

export default () => {
  return (
      <NativeBaseProvider>
        <AuthProvider>
          <StatusBar style="white" />
          <App />
        </AuthProvider>
      </NativeBaseProvider>
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