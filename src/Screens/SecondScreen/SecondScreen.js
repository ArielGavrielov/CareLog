import * as React from 'react';
import { View, Text, Button } from 'react-native';

const SecondScreen = ({navigation}) => {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Second Screen</Text>
          <Button title="Go back" onPress={() => navigation.goBack()} />
        </View>
      );
}

export default SecondScreen;