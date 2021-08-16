import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Rating, Text, Avatar, Divider, Card, ListItem, Button, Icon } from 'react-native-elements';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { InputControl } from '../Components/InputControl';
import { useForm } from "react-hook-form";
import { postIndices } from '../api/carelog';
import { Indice } from '../Components/Indice';

import List from '../Components/List';
import ProgressBar from '../Components/ProgressBar'
import { getStepsBetween } from '../Components/getSteps';

const events = [
  { start: '07-09-2021 13:30:00', end: '2021-09-07 02:00:00', title: 'Dr. Mor Ben Shushan', summary: 'Nahariya' },
  { start: '07-09-2021 14:30:00', end: '2021-09-07 03:00:00', title: 'Dr. Ariel Gavrielov', summary: 'Akko' },
  { start: '07-09-2021 15:30:00', end: '2021-09-07 04:00:00', title: 'Dr. Shadi', summary: 'Kfar' }
]

const HomeScreen = () => {
  const [selected, setSelected] = useState(0);

  console.log("steps", getStepsBetween(new Date().setHours(0), new Date()));

  const indices = [
    {
        route: 'blood',
        title: 'Blood pressure',
        inputs: [
            {
                name: 'Systolic',
                rules: {
                    min: {
                    value: 100,
                    message: 'Minimum value is 100.'
                    },
                    max: {
                    value: 200,
                    message: 'Maximum value is 200.'
                    },
                    required: "Systolic is required."
                },
            },
            {
                name: 'Diastolic',
                rules: {
                    min: {
                    value: 70,
                    message: 'Minimum value is 70.'
                    },
                    max: {
                    value: 140,
                    message: 'Maximum value is 140.'
                    },
                    required: "Diastolic is required."
                }
            }
        ]
    },
    {
        route: 'pulse',
        title: 'Pulse',
        inputs: [
            {
                name: 'Pulse',
                rules: {
                    min: {
                    value: 50,
                    message: 'Minimum value is 50.'
                    },
                    max: {
                    value: 200,
                    message: 'Maximum value is 200.'
                    },
                    required: "Pulse is required."
                }
            }
        ]
    },
    {
        route: 'bodyheat',
        title: 'Body heat',
        inputs: [
            {
                name: 'Body heat',
                rules: {
                    min: {
                    value: 31,
                    message: 'Minimum value is 31.'
                    },
                    max: {
                    value: 43,
                    message: 'Maximum value is 43.'
                    },
                    required: "Body Heat is required."
                }
            }
        ]
    },
    {
        route: 'oxygen',
        title: 'Oxygen Saturation',
        inputs: [
            {
                name: 'Oxygen saturation',
                rules: {
                    min: {
                    value: 60,
                    message: 'Minimum value is 60.'
                    },
                    max: {
                    value: 100,
                    message: 'Maximum value is 100.'
                    },
                    required: "Oxygen Saturation is required."
                }
            }
        ]
    }];
  const items = [
    {
      title: 'Take medicine',
      checked: false,
    },
    {
      title: 'Go for a examination',
      checked: true
    },
    {
      title: 'Enter indices',
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
        <Card.Title>Indices</Card.Title>
        <Card.Divider color = '#FFC0CB' />
        <View style={{flex:1, flexDirection: 'row', justifyContent:'space-between', marginBottom: 10, borderBottomColor: 'black', borderBottomWidth: 1}}>
          {
            indices.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.border}
                onPress={() => {
                  setSelected(i);
                }}
              >
                <Text style={(i === selected ? {fontWeight: 'bold'} : null)}>{item.title}</Text>
              </TouchableOpacity>

            ))
          }
        </View>
        <Indice
          route={indices[selected].route}
          title={indices[selected].title}
          inputs={indices[selected].inputs}
          withoutCard
        />
      </Card>
        <Card>
            <Card.Title>Upcomming Events</Card.Title>
            <Card.Divider color='#FFC0CB'/>
            {events.map((event, i) => (
        <ListItem key={i} bottomDivider >
            <ListItem.Content>
            <ListItem.Title>{event.title}</ListItem.Title>
            <ListItem.Subtitle>{event.summary}</ListItem.Subtitle>
            <ListItem.Subtitle>{event.start}</ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
        </ListItem>
            ))}
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
  },
  border: {
    paddingRight: 5,
    paddingLeft: 5,
    borderEndWidth: 1,
    borderEndColor: '#FFC0CB'
  },
  selected: {
    fontWeight: "bold"
  }
});
export default HomeScreen;

