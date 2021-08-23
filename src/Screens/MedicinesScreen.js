import React from 'react';
import { View, Dimensions, FlatList, Alert } from 'react-native';
import { Button, Text, Card } from 'react-native-elements';
import Modal from 'react-native-modal';
import { InputControl, TimesInputControl } from '../Components/InputControl';
import { useForm } from 'react-hook-form';
import { postMedicine, getMedicines, takeMedicine } from '../api/carelog';
import moment from 'moment';

const AddMedication = ({onAdded}) => {
    const [isModalVisible, setModalVisible] = React.useState(false);
    const { control, handleSubmit, trigger, formState, reset } = useForm();
    const [error, setError] = React.useState(null);

    const addMedicationApi = async (props) => {
        let res = await postMedicine(props);
        if(res.error) setError(res.message);
        else {
            Alert.alert('Success', 'Added successfully', [{text: 'OK', onPress: () => setModalVisible(false)}]);
            onAdded();
        }
    }
    React.useEffect(() => {
        if(!isModalVisible) {
            reset();
            setError(null);
        }
    }, [isModalVisible]);

    return (
        <View>
            <Button title="Add Medication" onPress={() => setModalVisible(!isModalVisible)}/>
            <Modal
                isVisible={isModalVisible}
                style={{flex:1}}
                onBackdropPress={() => setModalVisible(false)}
                deviceWidth={Dimensions.get('window').width}
                deviceHeight={Dimensions.get('window').height}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{backgroundColor:"white", justifyContent: 'center', alignItems: 'center', padding: 10, borderRadius: 10}}>
                    <Text h1>Add Medicine</Text>
                    <InputControl
                        control={control}
                        trigger={trigger}
                        name="Name"
                        rules={{
                            required: true
                        }}
                    />
                    <InputControl
                        keyboardType="number-pad"
                        control={control}
                        trigger={trigger}
                        name="Dosage amount"
                        rules={{
                            required: true,
                            min: 1
                        }}
                    />
                    <InputControl
                        keyboardType="number-pad"
                        control={control}
                        trigger={trigger}
                        name="Quantity"
                        rules={{
                            required: true,
                            min: 1
                        }}
                    />
                    <TimesInputControl
                        control={control}
                        trigger={trigger}
                        name="Times"
                        rules={{
                            required: true
                        }}
                    />
                    {error ? <Text style={{color: 'red'}}>{error}</Text> : null}
                    <View style={{flexDirection: 'row'}}>
                        <Button style={{marginHorizontal: 50}} title="Close" onPress={() => setModalVisible(!isModalVisible)} />
                        <Button style={{marginHorizontal: 50}} title="Submit" onPress={handleSubmit(addMedicationApi, (err) => console.log(err))} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}


const MedicinesScreen = () => {
    const [medications, setMedications] = React.useState(null);

    const getMedics = async () => {
        let res = await getMedicines();
        setMedications(res);
    }

    const take = async (name) => {
        console.log(await takeMedicine(name));
    } 

    React.useEffect(() => {
        if(!medications)
            getMedics();
    }, []);

    return (
        <View>
            <FlatList
                data={medications}
                renderItem={({item}) => (
                <Card containerStyle={{flex: 1, alignItems: 'center'}}>
                        <Card.Title>{item.medicineRef.name}</Card.Title>
                        <Card.Divider color='pink' />
                        <Text>Quantity: {item.quantity}</Text>
                        <Text>Dosage amount: {item.dosageamount}</Text>
                        <Text>Time for take:</Text>
                        <Text>{item.times.map((time) => moment(time, 'HH:mm').local().format('HH:mm'))}</Text>
                        <View style={{flexDirection: 'row'}}>
                            <Button title='Take' onPress={() => take(item.medicineRef.name)}></Button>
                        </View>
                </Card>
                )}
                numColumns={2}
                keyExtractor={(item, index) => index}
                style={{margin: 5, padding: 10}}
            />
            <AddMedication onAdded={() => getMedics()}/>
        </View>
    );
};

export default MedicinesScreen;