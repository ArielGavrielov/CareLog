import React, { Component } from 'react';
import { View, Dimensions, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card, Button, Text, Divider } from 'react-native-elements'; 
import {Agenda} from 'react-native-calendars';
import {NavigationApps} from "react-native-navigation-apps";
import ModalWithX from '../Components/ModalWithX';
import { getEvents, postEvent, deleteEvent, getDoctors, getFreetimeOfDoctor, postNewMeeting } from '../api/carelog';
import { useForm } from 'react-hook-form';
import { InputControl, EventTimeInputControl, DateInputControl } from '../Components/InputControl';
import moment from 'moment';
import { AsyncAlert } from '../Components/AsyncAlert';
import DropDownPicker from 'react-native-dropdown-picker';

const Appointment = ({refetchEvents}) => {
    const {control, handleSubmit, trigger, formState: {isSubmitting, isValid, errors, isDirty}, reset, register, getValues, setError, clearErrors} = useForm();
    const [isModalVisible, setModalVisible] = React.useState(false);
    const [messages, setMessages] = React.useState({error: null, success: null});
    const [state, setState] = React.useState({
        doctors: {
            isOpen: false,
            items: null
        },
        freetime: {
            isOpen: false,
            items: null
        }
    });
    const [doctorChoosen, setDoctorChoosen] = React.useState(null);
    const [dateChoosen, setDateChoosen] = React.useState(null);
    const [timeChoosen, setTimeChoosen] = React.useState(null);
    const dateChoosenRef = React.useCallback((value) => setDateChoosen(value));

    const resetState = () => {
        reset();
        setMessages({error: null, success: null});
        setState({doctors: {isOpen: false, items: null}, freetime: {isOpen: false, items: null}});
        setDoctorChoosen(null);
        setDateChoosen(null);
        setTimeChoosen(null);
    }

    const onSubmit = async (values) => {
        let {doctorId, time, date, ...body} = values;
        body.datetime = `${date} ${time}`;

        await postNewMeeting(doctorId, body).then((value) => {
            setMessages({success: value.message});
            setTimeout(() => {
                setModalVisible(false);
                refetchEvents();
            }, 1000);
        }).catch((err) => setMessages({error: err.message}));
    };

    React.useEffect(() => {
        if(isModalVisible)
            getDoctors().then((value) => {
                if(isModalVisible) {
                    let items = value.map((doctor) => {return {label: `Dr. ${doctor.firstname} ${doctor.lastname}`, value: doctor._id}});
                    setState({...state, doctors: {...state.doctors, items}});
                    clearErrors('doctorId');
                }
            }).catch((err) => setError("doctorId", {type: "manual", message: err.message}));
        return () => {
            resetState();
        }
    }, [isModalVisible]);

    React.useEffect(() => {
        register('doctorId', {value: doctorChoosen, pattern: {value: /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i, message: 'Invalid id.'}});
        if(doctorChoosen) {
            setDateChoosen(null);
            setState({...state, freetime: {isOpen: false, items: null}});
        }
    }, [doctorChoosen]);

    React.useEffect(() => {
        register('date', {value: dateChoosen, required: 'Date is required.'});
        if(dateChoosen) {
            setTimeChoosen(null);
            getFreetimeOfDoctor({doctorId: doctorChoosen, date: dateChoosen})
            .then((value) => {
                let items = value.map((time) => {return {label: moment.utc(time, 'HH:mm').local().format('HH:mm'), value: time}});
                setState({...state, freetime: {...state.freetime, items}});
                clearErrors('time');
            }).catch((err) => setError('time', {type: 'manual', message: err.message}));
        }
    }, [dateChoosen]);

    React.useEffect(() => {
        register('time', {value: timeChoosen, required: 'Time is required.'});
    }, [timeChoosen]);

    return (
        <View>
            <Button
                title="Appointment"
                onPress={() => setModalVisible(true)}
                icon={{name: "plus", type: 'feather', color: 'white'}}
            />
            <ModalWithX
                isVisible={isModalVisible}
                style={{flex:1}}
                deviceWidth={Dimensions.get('window').width}
                deviceHeight={Dimensions.get('window').height}
                onRequestClose={() => setModalVisible(false)}
                loading={!state.doctors.items}
            >
                <Text h1>Appointment</Text>
                <View style={{marginBottom: 10, zIndex: 99}}>
                    <DropDownPicker
                        itemKey="value"
                        open={state.doctors.isOpen}
                        value={doctorChoosen}
                        items={state.doctors.items}
                        placeholder='Choose doctor'
                        setItems={(items) => setState({...state, doctors: {...state.doctors, items}})}
                        setOpen={(isOpen) => setState({...state, doctors: {...state.doctors, isOpen}})}
                        setValue={setDoctorChoosen}
                        maxHeight={100}
                    />
                    {errors.doctorId && <Text style={{color: 'red'}}>{errors.doctorId.message}</Text>}
                </View>
                {doctorChoosen && <DateInputControl
                    name='Date'
                    refValue={dateChoosenRef}
                    minimumDate={new Date()}
                    maximumDate={moment().add(6, 'months').toDate()}
                    control={control}
                    rules={{required: 'You must specify date.'}}
                    trigger={trigger}
                />}
                <View style={{marginBottom: 10, zIndex: 99}}>
                    {dateChoosen && state.freetime.items && <DropDownPicker
                        itemKey="label"
                        open={state.freetime.isOpen}
                        value={timeChoosen}
                        items={state.freetime.items}
                        placeholder='Choose time'
                        setItems={(items) => setState({...state, freetime: {...state.freetime, items}})}
                        setOpen={(isOpen) => setState({...state, freetime: {...state.freetime, isOpen}})}
                        setValue={setTimeChoosen}
                        maxHeight={100}
                        onClose={() => setState({...state, freetime: {...state.freetime, isOpen: false}})}
                    />}
                    {errors.time && <Text style={{color: 'red'}}>{errors.time.message}</Text>}
                </View>
                {timeChoosen && <InputControl
                    name='Body'
                    multiline={true}
                    numberOfLines={4}
                    maxLength={100}
                    control={control}
                    trigger={trigger}
                />}
                {messages.error && <Text style={{color: 'red'}}>{messages.error}</Text>}
                {messages.success && <Text style={{color: 'green'}}>{messages.success}</Text>}
                {timeChoosen && <Button
                    loading={isSubmitting}
                    disabled={isSubmitting || !timeChoosen}
                    title='Submit'
                    onPress={handleSubmit(onSubmit)}
                />}
            </ModalWithX>
        </View>
    )
}
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
            <Button
                title="Add Event"
                onPress={() => setModalVisible(true)}
                icon={{name: "plus", type: 'feather', color: 'white'}}
            />
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
            else
                setLoading(false);
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
                <Text h4>{item.title}</Text>
                <Text style={{fontWeight: 'bold'}}>{item.time}{item.address ? ` at ${item.address}` : null}</Text>
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
                    title={item.doctorId ? 'Cancel meeting' : 'Delete event'}
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
                    disabled={item.doctorId}
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
                    disabled={item.doctorId}
                    control={control}
                    trigger={trigger}
                />
                <EventTimeInputControl
                    name='Time'
                    disabled={item.doctorId}
                    control={control}
                    rules={{required: 'You must specify time of event'}}
                    trigger={trigger}
                />
                {messages.error && <Text style={{color: 'red'}}>{messages.error}</Text>}
                {messages.success && <Text style={{color: 'green'}}>{messages.success}</Text>}
                <Button
                    disabled={isLoading}
                    loading={isLoading}
                    title='Edit Event'
                    onPress={handleSubmit(onSubmit)}
                />
            </ModalWithX>
        </View>
    );
}

const EventsScreen = () => {
    const [events, setEvents] = React.useState(null);

    const subscribe = async () => {
        try {
            const events = await getEvents();
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
                    id: event._id,
                    doctorId: event.doctorId
                });
            });
            setEvents(eventsFormat);
        } catch(err) {
            console.log(err.message);
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            console.log("events mount");
            subscribe();

            return () => {
                setEvents(null);
            }
        }, [])
    );

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
                <MoreInfoModal item={item} refetchEvents={() => subscribe()}/>
                <EditModal item={item} refetchEvents={() => subscribe()}/>
            </View>
          </Card>
        );
      }

    return <>
            <Agenda
                showClosingKnob 
                renderEmptyData={() => <Text>No Data</Text>}
                items={events} 
                renderItem={(item) => renderItem(item)}
                
            />
            <View style={{bottom: 0, left: 0, right: 0}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                    <PushEvent refetchEvents={() => subscribe()}/>
                    <Appointment refetchEvents={() => subscribe()}/>
                </View>
            </View>
        </>
}

export default EventsScreen;