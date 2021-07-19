import React, { useContext } from 'react';
import {Context as AuthContext} from '../../Context/AuthContext';
import { Text, Button } from 'react-native-elements';
import { View } from 'react-native';

export default AccountScreen = () => {
    const { state, signout } = useContext(AuthContext);
    console.log("ASD");
    return (
        <View>
            <Text h1>Account Screen</Text>
            <Button
                type="clear"
                title="Sign out"
                onPress={() => signout()}
            />
        </View>
    )
}