import React, { useState } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import { AirbnbRating, Text, Avatar, Divider, Card, ListItem, Button, Icon } from 'react-native-elements';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { Indice } from '../Components/Indice';
import ModalWithX from '../Components/ModalWithX';
import { getFeeling, postFeeling } from '../api/carelog';
import moment from 'moment';

import List from '../Components/List';
import ProgressBar from '../Components/ProgressBar'
import { getStepsBetween } from '../Components/getSteps';
import { useForm } from 'react-hook-form';
import { InputControl } from '../Components/InputControl';
import { AsyncAlert } from '../Components/AsyncAlert';

const BadFeelingModal = ({isModalVisible, setModalVisible, rating, setRating}) => {
  const {control, handleSubmit} = useForm();
  const [isLoading, setLoading] = React.useState(false);

  const postWithReason = ({reason}) => {
    setLoading(true);
    postFeeling(rating, reason).then((data) => {
      console.log(data);
      if(data.success) {
        setRating({lastChange: moment().format('HH:mm:ss'), value: rating});
        setLoading(false);
        setModalVisible(false);
      } else
        AsyncAlert('ERROR', 'Please try again later.', [{text: 'OK'}]).finally(() => {
          setLoading(false);
          setModalVisible(false);
        });
      
    }).catch((error) => {
      console.log(error);
      if(!error)
        AsyncAlert('ERROR', 'Something went wrong. Please try again later.', [{text: 'OK'}]).finally(() => {
          setLoading(false);
          setModalVisible(false);
        });
    });
  }

  return (
    <>
    <ModalWithX
      isVisible={isModalVisible}
      style={{flex:1}}
      onBackdropPress={handleSubmit(postWithReason)}
      deviceWidth={Dimensions.get('window').width}
      deviceHeight={Dimensions.get('window').height}
      onRequestClose={handleSubmit(postWithReason)}
    >
      <Text h3>Bad feeling prompt</Text>
      <Text>sorry for that you feeling bad, We hope that you'll feel better.</Text>
      <Text>You can add a reason to inform the doctor. (optional)</Text>
      <InputControl
        name='Reason'
        control={control}
        defaultValue={''}
      />
      <Button
        title='Send'
        loading={isLoading}
        disabled={isLoading}
        onPress={handleSubmit(postWithReason)}
      />
    </ModalWithX>
    </>
  )
}

const HomeScreen = () => {
  const [selected, setSelected] = useState(0);
  const [rating, setRating] = useState(null);
  const [choosenRating, setChoosenRating] = React.useState(0);
  const [isModalVisible, setModalVisible] = React.useState(false);
  const isScreenMounted = React.useRef();

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

  React.useEffect(() => {
    isScreenMounted.current = true;
    if(!rating) {
      if(!isScreenMounted.current) return;
      getFeeling(moment.utc().format('Y-MM-DD'))
        .then((res) => {
          if(!isScreenMounted.current) return;
          console.log(res);
          setRating({lastChange: moment.utc(res.lastChange, 'HH:mm:ss').local().format('HH:mm:ss'), value: res.feeling});
        }).catch(({error}) => {
          if(!isScreenMounted.current) return;
          setRating({lastChange: 'No change today yet.', value: 3});
          if(!error)
            Alert.alert('ERROR', 'Please try again later.', [{text: 'ok'}]);
        });
    }
    return () => {
      isScreenMounted.current = false;
    }
  }, []);

  return (
    <ScrollView nestedScrollEnabled = {true}>
      <Card>
        <Card.Title>How do you feel today?</Card.Title>
        <Card.Divider color = '#FFC0CB'/>
        { rating ? 
        <View>
          <Text>Last change: {rating.lastChange}</Text>
          <AirbnbRating
            reviews={['Terrible', 'Bad', 'Okay', 'Good', 'Great']}
            defaultRating={rating.value}
            onFinishRating={(v) => {
              setChoosenRating(v);
              if(v < 3) {
                setModalVisible(true);
              } else {
                postFeeling(v).then((data) => {
                  if(data.success) {
                    setRating({lastChange: moment().format('HH:mm:ss'), value: v});
                  } else {
                    Alert.alert('ERROR', 'Please try again later.', [{text: 'ok'}]);
                  }
                }).catch(({error}) => {
                  if(!error)
                    Alert.alert('ERROR', 'Something went wrong. Please try again later.', [{text: 'ok'}])
                });
              }
            }}
          />
        </View> : null}
        <BadFeelingModal
            isModalVisible={isModalVisible}
            setModalVisible={setModalVisible}
            rating={choosenRating}
            setRating={setRating}
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
        {/*<Card>
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
        </Card>*/}
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

