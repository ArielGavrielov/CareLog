import React, { useContext } from 'react';
import {Context as AuthContext} from '../Context/AuthContext';
import { Text, Button, ListItem, Icon } from 'react-native-elements';
import { View } from 'react-native';

export default AccountScreen = () => {
    const { state, signout } = useContext(AuthContext);
    const list = [
        {
          title: 'Personal details',
          icon: 'av-timer',
          onPress: () => console.log("Personal details")
        },
        {
          title: 'Settings',
          icon: 'flight-takeoff',
          onPress: () => console.log("Settings")
        },
        {
          title: 'About us',
          icon: 'flight-takeoff',
          onPress: () => console.log("About")
        },
        {
            title: 'Signout',
            icon: 'flight-takeoff',
            onPress: () => {
                signout()
            }
        }
      ]

    return (
        <View>
     {
        list.map((item, i) => (
        <ListItem key={i} bottomDivider onPress={item.onPress}>
            <Icon name={item.icon} />
            <ListItem.Content>
            <ListItem.Title>{item.title}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
        </ListItem>
        ))
    }
    </View>
    )
}