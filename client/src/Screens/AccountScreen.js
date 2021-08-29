import React, { useContext } from 'react';
import {Context as AuthContext} from '../Context/AuthContext';
import { Text, Button, ListItem, Icon } from 'react-native-elements';
import { View } from 'react-native';

const AccountScreen = () => {
  const { state, signout } = useContext(AuthContext);
    const list = [
        {
          title: 'Personal details',
          icon: 'person',
          onPress: () => console.log("Personal details")
        },
        {
          title: 'Settings',
          icon: 'settings',
          onPress: () => console.log("Settings")
        },
        {
          title: 'About us',
          icon: 'info',
          onPress: () => console.log("About")
        },
        {
            title: 'Signout',
            icon: 'logout',
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
            <Icon name={item.icon} type='material' />
            <ListItem.Content>
            <ListItem.Title>{item.title}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
        </ListItem>
        ))
    }
    </View>
    );
}

export default AccountScreen;