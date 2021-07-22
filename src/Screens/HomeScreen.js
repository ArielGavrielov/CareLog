import React, { Component, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Rating, Text, Avatar, Divider, Card, ListItem, Button, Icon, CheckBox } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';

import List from '../Components/List';
import ProgressBar from '../Components/ProgressBar'

import EventCalendar from 'react-native-events-calendar'

const events = [
  { start: '2021-09-07 01:30:00', end: '2021-09-07 02:00:00', title: 'Dr. Mor Ben Shushan', summary: 'Nahariya' },
  { start: '2021-09-07 02:30:00', end: '2021-09-07 03:00:00', title: 'Dr. Ariel Gavrielov', summary: 'Akko' },
  { start: '2021-09-07 03:30:00', end: '2021-09-07 04:00:00', title: 'Dr. Shadi', summary: 'Kfar' }
]

const HomeScreen = () => {
  const items = [
    {
      title: 'Take medicine',
      checked: false
    },
    {
      title: 'Go for a examination',
      checked: true
    },
    {
      title: 'Go for a examination',
      checked: true
    },
    {
      title: 'Go for a examination',
      checked: true
    },
    {
      title: 'Go for a examination',
      checked: true
    },
    {
      title: 'Go for a examination',
      checked: true
    }
  ];

  const [rating, setRating] = useState(5);

  return (
    <ScrollView nestedScrollEnabled = {true}>
      <Card>
        <Card.Title>How do you feel?</Card.Title>
        <Card.Divider color = '#FFC0CB'/>
        <Rating
          reviews={['Terrible', 'Bad', 'Okay', 'Good', 'Great']}
          type='heart'
          imageSize={40}
          showRating
          fractions={0}
          startingValue={rating}
          onFinishRating={(v) => setRating(v)}
        />
      </Card>
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
        <List title='To-Do List' items={items}/>
        <ProgressBar
          title='Daily progress'
          data={[
            {
              title: 'Water',
              colorScheme: 'blue',
              value: 9,
              min: 0,
              max: 10
            },
            {
              title: 'Steps',
              colorScheme: 'green',
              value: 1000,
              min: 0,
              max: 5000
            }
          ]}
        />
        <EventCalendar
          events={events}
          width={400}
          initDate={'2021-09-07 08:00:00'}
        />
    </ScrollView>
         
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

