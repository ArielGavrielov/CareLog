import React, { Component } from 'react';
import { Container, Content } from 'native-base';
import { Text } from 'react-native-elements'

export default class HomeScreen extends Component {
  render() {
    return (
      <Container >
        <Content>
          <Text h1>Hello NAME</Text>
        </Content>
      </Container>
      );
  }
}