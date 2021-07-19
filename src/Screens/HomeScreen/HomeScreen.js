import React, { Component } from 'react';
import { Text } from 'react-native-elements'
import { Avatar, Container } from "native-base";

const HomeScreen = () => {
  return (
      <Container>
          <Avatar
          position= 'absolute' 
          backgroundColor= "#FFC0CB"
          size="xl"
          source={{
            uri: "../../assets/logo-197X69.png",
          }}
        >
          <Text h3>Hello NAME</Text>
        </Avatar>
      </Container>
    );
}
export default HomeScreen;

