import React, { Component, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar, Divider, Card, ListItem, Button, Icon, CheckBox, Rating, AirbnbRating } from 'react-native-elements'

import List from '../Components/List';

const HomeScreen = () => {
  const items = [
    {
      title: 'test1',
      checked: false
    },
    {
      title: 'test2',
      checked: true
    }
  ]
  const [checkBox, setCheckBox] = useState(true);
  const [rating, setRating] = useState(5);

  return (
    <View>
      <Card>
        <Card.Title>How do you feel?</Card.Title>
        <Card.Divider color = '#FFC0CB'/>
        <AirbnbRating
          reviews={['Terrible', 'Bad', 'Okay', 'Good', 'Great']}
          type='star'
          ratingCount={5}
          imageSize={40}
          fractions="{0}"
          showRating
          startingValue={rating}
          onFinishRating={(v) => setRating(v)}
        />
      </Card>
        <Text h4>Daily Health Index</Text>
        <Divider orientation="horizontal" color='#FFC0CB' width='5'/>
        <Card>
            <Card.Title>Upcomming Events</Card.Title>
            <Card.Divider color = '#FFC0CB'/>
            <Text style={styles.cardText}>
              here we put the upcoming events of the patient
            </Text>
            <Button
              icon={<Icon name='code' color='#ffffff' />}
              buttonStyle={styles.buttonS}
              title='SEE ALL EVENTS  BUTTON' />
        </Card>
        <Card>
            <Card.Title>To Do list</Card.Title>
            <Card.Divider color = '#FFC0CB'/>
              <CheckBox
                  title='Click Here'
                  checked={checkBox}
                  onPress={() => setCheckBox(!checkBox)}
                />
            <CheckBox
                  center
                  title='Click Here'
                  checked={checkBox}
                  onPress={() => setCheckBox(!checkBox)}
                />
        </Card>
        <List title='test' items={items}/>
    </View>
         
    );
}
const styles = StyleSheet.create({
  cardText: {
    marginBottom: 10
  },
  buttonS: {
    borderRadius: 5,
   backgroundColor: '#FFC0CB'
  }
});
export default HomeScreen;

