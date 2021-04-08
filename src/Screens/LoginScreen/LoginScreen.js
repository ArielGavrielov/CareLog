import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Input, Text, Button } from 'react-native-elements';
import { Center, Container, Heading } from 'native-base';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
      <Center flex={1} marginBottom={250}>
        <Heading color="emerald.900">Sign In</Heading>
        <Input 
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize='none'
          autoCorrect={false}
        />
        <Input 
          label="Password"
          value={password}
          onChangeText={setPassword}
          autoCapitalize='none'
          autoCorrect={false}
          secureTextEntry
        />
        <Button title="Sign in"/>
        <Button title="Sign up" onPress={() => navigation.navigate('Register')} />
      </Center>
  );
}

export default LoginScreen;