import React, { Component } from 'react';
import { View, Dimensions } from 'react-native';
import { Card, Button, Text, Divider } from 'react-native-elements'; 
import {Agenda} from 'react-native-calendars';
import {NavigationApps, Waze} from "react-native-navigation-apps";
import Modal from 'react-native-modal';
import ModalWithX from '../Components/ModalWithX';

const EventsScreen = () => {

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
                    <Text h4>{item.time} at {item.address}</Text>
                    <Divider orientation="vertical" />
                    <Text style={{fontSize: 16, margin: 10}}>{item.body}</Text>
                    <Divider orientation="vertical" />
                    <NavigationApps
                        iconSize={30}
                        row
                        viewMode='view'
                        address={item.address}
                    />
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

    const renderItem = (item) => {
        return (
          <Card onPress={() => Alert.alert(item.name)}>
            <Card.Title>{item.title} - {item.time}</Card.Title>
            <View style={{flexDirection: 'row', justifyContent: 'space-around', marginBottom: 5}}>
                <Text style={{textAlignVertical: 'center'}}>{item.address}</Text>
                <NavigationApps
                    iconSize={30}
                    row
                    viewMode='view'
                    address={item.address}
                />
            </View>
            <Card.Divider color='black'/>
            <View style={{flexDirection: 'row', alignSelf: 'auto', justifyContent: 'space-around'}}>
                <MoreInfoModal item={item}/>
                <EditModal item={item}/>
            </View>
          </Card>
        );
      }

    return <Agenda
                showClosingKnob 
                selected={'2021-08-23'}
                items={{
                    '2021-08-23': [
                        { title: 'Dr. Ariel Gavrielov', time: '08:00', address: 'Akko', body: 'Lorem ipsum dolor sit amet consectetur adipiscing elit' },
                        //{ title: 'item 2 - any js object', time: '07:00', address: 'Nahariya', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Mus mauris vitae ultricies leo.' }
                    ]
                }} 
                renderItem={(item)=> renderItem(item)}
                hideKnob={false}
        />
}

export default EventsScreen;