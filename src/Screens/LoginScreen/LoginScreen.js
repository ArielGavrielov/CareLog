import React, { Component } from 'react';
import { Container, Header, Content, Form, Item, Input } from 'native-base';

export default class LoginScreen extends Component {
    render() {
      return (
        <Container>
          <Header />
          <Content>
            <Form>
              <Item>
                <Input placeholder="Username" />
              </Item>
              <Item last>
                <Input placeholder="Password" secureTextEntry={true} />
              </Item>
            </Form>
          </Content>
        </Container>
      );
    }
  }