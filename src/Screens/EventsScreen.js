import React, { Component } from 'react';
import { View, Dimensions } from 'react-native';
import { Card, Button, Text, Divider } from 'react-native-elements'; 
import {Agenda} from 'react-native-calendars';
import {NavigationApps, Waze} from "react-native-navigation-apps";
import ModalWithX from '../Components/ModalWithX';
import { getEvents, postEvent } from '../api/carelog';
import { useForm } from 'react-hook-form';
import { InputControl, EventTimeInputControl } from '../Components/InputControl';
import moment from 'moment';

const PushEvent = ({isPushEventModal, setPushEventModal, onSubmit}) => {
    const {control, handleSubmit, trigger, formState, reset, setValue} = useForm();

    React.useEffect(() => {
        return () => {
            if(formState.isSubmitSuccessful) {
                reset();
                console.log("reset2");
            }
        }
    }, [isPushEventModal]);

    return (
        <View>
            <View style={{bottom: 0, left: 0, right: 0}}>
                <Button
                    title="Add Event"
                    onPress={() => setPushEventModal(!isPushEventModal)}
                    icon={{name: "plus", type: 'feather', color: 'white'}}
                />
            </View>
            <ModalWithX
                isVisible={isPushEventModal}
                style={{flex:1}}
                onBackdropPress={() => setPushEventModal(false)}
                deviceWidth={Dimensions.get('window').width}
                deviceHeight={Dimensions.get('window').height}
                onRequestClose={() => setPushEventModal(false)}
            >
                <Text h1>Add Event</Text>
                <InputControl
                    name='Title'
                    control={control}
                    rules={{required: 'You must specify title of event'}}
                    trigger={trigger}
                />
                <InputControl
                    name='Body'
                    multiline={true}
                    numberOfLines={4}
                    control={control}
                    trigger={trigger}
                />
                <InputControl
                    name='Address'
                    control={control}
                    trigger={trigger}
                />
                <EventTimeInputControl
                    name='Time'
                    control={control}
                    rules={{required: 'You must specify time of event'}}
                    trigger={trigger}
                />
                <Button
                    title='Add Event'
                    onPress={handleSubmit(onSubmit)}
                />
            </ModalWithX>
        </View>
    );
} 

const MoreInfoModal = ({item}) => {
    const [isModalVisible, setModalVisible] = React.useState(false);

    return (
        <View>
            <Button 
                title="More Info"
                icon={{name: 'info', type: 'feather', color: 'white'}}
                onPress={() => setModalVisible(!isModalVisible)}
            />
            <ModalWithX
                isVisible={isModalVisible}
                animationInTiming={500}
                animationOutTiming={500}
                animationIn='zoomIn'
                animationOut='zoomOut'
                style={{flex:1}}
                onBackdropPress={() => setModalVisible(false)}
                deviceWidth={Dimensions.get('window').width}
                deviceHeight={Dimensions.get('window').height}
                onRequestClose={() => setModalVisible(false)}
            >
                <Text h3>{item.title}</Text>
                <Text h4>{item.time}{item.address ? ` at ${item.address}` : null}</Text>
                <Divider orientation="vertical" />
                {item.body ? <Text style={{fontSize: 16, margin: 10}}>{item.body}</Text> : null}
                {item.address ? <><Divider orientation="vertical" />
                <NavigationApps
                    iconSize={30}
                    row
                    viewMode='view'
                    address={item.address}
                /></> : null}
            </ModalWithX>
        </View>
    );
}

const EditModal = ({item}) => {
    const [isModalVisible, setModalVisible] = React.useState(false);

    return (
        <View>
            <Button 
                title="Edit"
                icon={{name: 'edit', type: 'feather', color: 'white'}}
                onPress={() => setModalVisible(!isModalVisible)}
            />
            <ModalWithX
                isVisible={isModalVisible}
                style={{flex:1}}
                onBackdropPress={() => setModalVisible(false)}
                deviceWidth={Dimensions.get('window').width}
                deviceHeight={Dimensions.get('window').height}
                onRequestClose={() => setModalVisible(false)}
            >
            </ModalWithX>
        </View>
    );
}

const EventsScreen = () => {
    const isScreenMounted = React.useRef();
    const [events, setEvents] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isPushEventModal, setPushEventModal] = React.useState(false);

    const onSubmit = (props) => {
        postEvent(props).then((res) => {
            setPushEventModal(false);
        }).catch((err) => console.log(err))
        .finally(() => setIsLoading(true));
    }

    React.useEffect(() => {
        isScreenMounted.current = true;
        if(isScreenMounted.current && isLoading) {
            getEvents().then((events) => {
                if(!isScreenMounted.current || !isLoading) return;

                const eventsFormat = {}; // format for react calendar
                const TIMEFORMAT = 'HH:mm'
                const DATEFORMAT = 'Y-MM-DD'
                const DATETIMEFORMAT = 'Y-MM-DD HH:mm';
                events.map((event) => {
                    const dateMoment = moment.utc(event.time, DATETIMEFORMAT).local();
                    const dateString = dateMoment.format(DATEFORMAT);
                    const timeString = dateMoment.format(TIMEFORMAT);
                    if(!eventsFormat[dateString]) eventsFormat[dateString] = [];
                    eventsFormat[dateString].push({
                        title: event.title, 
                        body: event.body, 
                        time: timeString, 
                        address: event.address,
                        id: event._id
                    });
                });
                console.log(eventsFormat);
                setEvents(eventsFormat);
            }).catch((err) => {
                if(!isScreenMounted.current) return;
                setEvents({});
            })
            .finally(() => {
                if(!isScreenMounted.current) return;
                setIsLoading(false);
            });
        }
        return () => {
            isScreenMounted.current = false;
        }
    }, [isLoading]);

    if(!events) return <View style={{position: "absolute", left: 0, right: 0, bottom: 0, top: 0, alignItems: "center"}}>
            <Text>Loading...</Text>
        </View>
    
    const renderItem = (item) => {
        return (
          <Card>
            <Card.Title>{item.title} - {item.time}</Card.Title>
            {item.address ? <View style={{flexDirection: 'row', justifyContent: 'space-around', marginBottom: 5}}>
                <Text style={{textAlignVertical: 'center'}}>{item.address}</Text>
                <NavigationApps
                    iconSize={30}
                    row
                    viewMode='view'
                    address={item.address}
                />
            </View> : item.body ? <Text style={{fontSize: 16, margin: 10}}>{item.body}</Text> : null}
            <Card.Divider color='black'/>
            <View style={{flexDirection: 'row', alignSelf: 'auto', justifyContent: 'space-around'}}>
                <MoreInfoModal item={item}/>
                <EditModal item={item}/>
            </View>
          </Card>
        );
      }

    return <>
            <Agenda
                    showClosingKnob 
                    items={events} 
                    renderItem={(item)=> renderItem(item)}
            />
            <PushEvent 
                isPushEventModal={isPushEventModal} 
                setPushEventModal={setPushEventModal}
                onSubmit={onSubmit}
            />
        </>
}

export default EventsScreen;