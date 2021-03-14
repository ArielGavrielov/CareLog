import { registerRootComponent } from 'expo';
import React, { Component } from 'react';
import { AppRegistry, Dimensions } from 'react-native';
import { DrawerNavigator } from 'react-navigation';
import App from './App';
import SideMenu from './src/components/SideMenu/SideMenu'
import stackNav from './src/components/SideMenu/stacknav';


const drawernav = DrawerNavigator({
    Item1: {
        screen: stackNav,
      }
    }, {
      contentComponent: SideMenu,
      drawerWidth: Dimensions.get('window').width - 120,  
  });
  
  AppRegistry.registerComponent('Demo', () => drawernav);
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
//registerRootComponent(App);
