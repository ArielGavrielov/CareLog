import React, { useState } from 'react';
import { Button, Input } from 'react-native-elements'
import { Center, Heading } from "native-base";

const RegisterScreen = ({navigation}) => {
    return (
    <Center flex={1} marginBottom={250}>
        <Heading color="emerald.900">Sign Up</Heading>
        <Input label="Email"/>
        <Input label="Password"/>
        <Button title="Sign Up"/>
        <Button title="Sign in" onPress={() => navigation.navigate('Login')} />
      </Center>
    );
};

export default RegisterScreen;