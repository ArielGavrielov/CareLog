import React, { Component } from 'react';
import { View, Dimensions, Alert } from 'react-native';
import { Card, Button, Text, Divider } from 'react-native-elements'; 
import {Agenda} from 'react-native-calendars';
import {NavigationApps, Waze} from "react-native-navigation-apps";
import ModalWithX from '../Components/ModalWithX';
import { getEvents, postEvent, deleteEvent } from '../api/carelog';
import { useForm } from 'react-hook-form';
import { InputControl, EventTimeInputControl } from '../Components/InputControl';
import moment from 'moment';
import { AsyncAlert } from '../Components/AsyncAlert';

const PushEvent = ({refetchEvents}) => {
    const {control, handleSubmit, trigger, formState, reset, setValue} = useForm();
    const [isModalVisible, setModalVisible] = React.useState(false);
    const [isLoading, setLoading] = React.useState(false);
    const [messages, setMessages] = React.useState({error: null, success: null});

    const onSubmit = (values) => {
        setLoading(true);
        postEvent(values).then((success) => {
            setMessages(success);
            setTimeout(() => {
                setModalVisible(false);
                refetchEvents();
            }, 1000);
        }).catch((error) => {
            setMessages(error);
        }).finally(() => {
            setLoading(false);
        });
    }

    React.useEffect(() => {
        return () => {
            if(formState.isSubmitSuccessful)
                reset();
            setMessages({success: null, error: null});
        }
    }, [isModalVisible]);

    return (
        <View>
            <View style={{bottom: 0, left: 0, right: 0}}>
                <Button
                    title="Add Event"
                    onPress={() => setModalVisible(!isModalVisible)}
                    icon={{name: "plus", type: 'feather', color: 'white'}}
                />
            </View>
            <ModalWithX
                isVisible={isModalVisible}
                style={{flex:1}}
                onBackdropPress={() => setModalVisible(false)}
                deviceWidth={Dimensions.get('window').width}
                deviceHeight={Dimensions.get('window').height}
                onRequestClose={() => setModalVisible(false)}
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
                {messages.error && <Text style={{color: 'red'}}>{messages.error}</Text>}
                {messages.success && <Text style={{color: 'green'}}>{messages.success}</Text>}
                <Button
                    loading={isLoading}
                    disabled={isLoading}
                    title='Add Event'
                    onPress={handleSubmit(onSubmit)}
                />
            </ModalWithX>
        </View>
    );
} 

const MoreInfoModal = ({item, refetchEvents}) => {
    const [isModalVisible, setModalVisible] = React.useState(false);
    const [isLoading, setLoading] = React.useState(false);
    const [messages, setMessages] = React.useState({error: null, success: null});

    const deleteE = () => {
        setLoading(true);
        AsyncAlert('IMPORTANT',
            `Are you sure you want to delete this event?`,
            [
                {text: 'YES', resolve: true },
                {text: 'NO', resolve: false }
            ]
        ).then((isDelete) => {
            if(isDelete) {
                deleteEvent(item.id).then((success) => {
                    setModalVisible(false);
                    setTimeout(() => refetchEvents(), 500);
                }).catch((error) => {
                    Alert.alert('ERROR', error);
                }).finally(() => {
                    setLoading(false);
                });
            }
        });
    }

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
                <Button
                    disabled={isLoading}
                    loading={isLoading}
                    title='Delete event'
                    onPress={deleteE}
                />
            </ModalWithX>
        </View>
    );
}

const EditModal = ({item, refetchEvents}) => {
    const [isModalVisible, setModalVisible] = React.useState(false);
    const [isLoading, setLoading] = React.useState(false);
    const [messages, setMessages] = React.useState({error: null, success: null});
    const {control, handleSubmit, trigger, formState, reset, setValue} = useForm();

    const onSubmit = (values) => {
        setLoading(true);
        postEvent(values).then((success) => {
            setMessages(success);
            setTimeout(() => {
                setModalVisible(false);
                refetchEvents();
            }, 1000);
        }).catch((error) => {
            setMessages(error);
        }).finally(() => setLoading(false));
    }

    React.useEffect(() => {
        if(!isModalVisible) {
            reset();
            setMessages({error: null, success: null});
        } else {
            if(item) {
                const values = {...item, time: item.datetime};
                delete values.datetime;

                for(const [key, value] of Object.entries(values)) {
                    setValue(key, value);
                }
            }
        }
    }, [isModalVisible]);

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
                <Text h1>Edit Event</Text>
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
                {messages.error && <Text style={{color: 'red'}}>{messages.error}</Text>}
                {messages.success && <Text style={{color: 'green'}}>{messages.success}</Text>}
                <Button
                    disabled={isLoading}
                    loading={isLoading}
                    title='Add Event'
                    onPress={handleSubmit(onSubmit)}
                />
            </ModalWithX>
        </View>
    );
}

const EventsScreen = () => {
    const isScreenMounted = React.useRef();
    const [events, setEvents] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

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
                        datetime: dateMoment.format(DATETIMEFORMAT),
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
                <MoreInfoModal item={item} refetchEvents={() => setIsLoading(true)}/>
                <EditModal item={item} refetchEvents={() => setIsLoading(true)}/>
            </View>
          </Card>
        );
      }

    return <>
            <Agenda
                    showClosingKnob 
                    renderEmptyData={() => <Text>No Data</Text>}
                    items={events} 
                    renderItem={(item)=> renderItem(item)}
            />
            <PushEvent refetchEvents={() => setIsLoading(true)}/>
        </>
}

export default EventsScreen;