import React from 'react';
import { View, Dimensions, FlatList, Alert } from 'react-native';
import { Button, Text, Card, Icon } from 'react-native-elements';
import Modal from 'react-native-modal';
import { InputControl, TimesInputControl } from '../Components/InputControl';
import { useForm } from 'react-hook-form';
import { postMedicine, getMedicines, takeMedicine, deleteMedicine } from '../api/carelog';
import moment from 'moment';

const AddMedication = ({onAdded, isModalVisible, setModalVisible, editValues=null}) => {
    const {control, handleSubmit, trigger, formState, reset, setValue} = useForm();
    const [error, setError] = React.useState(null);

    const addMedicationApi = async (props) => {
        postMedicine(props).then((value) => {
            Alert.alert('Success', (editValues ? 'Edited' : 'Added') +' successfully', [{text: 'OK', onPress: () => setModalVisible(false)}]);
            onAdded();
        }).catch((err) => Alert.alert('ERROR', err.message, [{text: 'OK'}]));
        /*
        if(res.error) setError(res.message);
        else {
            Alert.alert('Success', (editValues ? 'Edited' : 'Added') +' successfully', [{text: 'OK', onPress: () => setModalVisible(false)}]);
            onAdded();
        }*/
    }
    React.useEffect(() => {
        if(!isModalVisible) {
            reset();
            setError(null);
        } else {
            if(editValues) {
                for(const [key, value] of Object.entries(editValues))
                    setValue(key, value instanceof Array ? value : value.toString());
            }
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
                    <Text h1>{(editValues ? 'Edit' : 'Add') + ' Medicine'}</Text>
                    <InputControl
                        disabled={editValues ? true : false}
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
                        <Button style={{marginHorizontal: 50}} title="Submit" onPress={handleSubmit(addMedicationApi)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}


const MedicinesScreen = () => {
    const [state, setState] = React.useState({
        medications: null,
        isLoading: [],
        screenLoading: true,
        editValues: null
    });
    const isScreenMounted = React.useRef(true);
    const [isModalVisible, setModalVisible] = React.useState(false);

    const take = (name, index) => {
        const loadingArr = state.isLoading;
        loadingArr[index] = true;
        setState({...state, isLoading: loadingArr});

        takeMedicine(name).then((value) => {
            Alert.alert("Success", "Updated successfully", [{text: 'OK'}]);
            setState({...state, screenLoading: true});
        }).catch((err) => Alert.alert("ERROR", err.message, [{text: 'OK'}]))
        .finally(() => {
            loadingArr[index] = false;
            setState({...state, isLoading: loadingArr});
        });
        /*
        if(res.error) Alert.alert("ERROR", res.message, [{text: 'OK'}]);
        else {
            Alert.alert("Success", "Updated successfully", [{text: 'OK'}]);
            setState({...state, screenLoading: true});
        }
        */
    }

    const remove = async (name) => {
        const AsyncAlert = () => {
            return new Promise((resolve, reject) => {
                Alert.alert(
                    'IMPORTANT',
                    `By removing ${name} also all taken data will remove, continue?`,
                    [
                        {text: 'YES', onPress: () => resolve(true) },
                        {text: 'NO', onPress: () => resolve(false) }
                    ],
                    { cancelable: false }
                )
            })
        }
        if(AsyncAlert()) {
            deleteMedicine(name).then((value) => {
                if(isScreenMounted.current) {
                    Alert.alert("Success", "Removed successfully", [{text: 'OK'}]);
                    setState({...state, screenLoading: true});
                }
            }).catch((err) => Alert.alert("ERROR", res.message, [{text: 'OK'}]));
            /*
            if(res.error) Alert.alert("ERROR", res.message, [{text: 'OK'}]);
            else {
                Alert.alert("Success", "Removed successfully", [{text: 'OK'}]);
                setState({...state, screenLoading: true});
            }
            */
        }
    }

    React.useEffect(() => {
        const getMedics = () => {
            console.log("Here", isScreenMounted.current);
            let res = getMedicines();
            res.then((value) => {
                if(isScreenMounted.current || isModalVisible)
                    setState({...state, medications: value, isLoading: Array(res.length).fill(false), screenLoading: false});
            }).catch((err) => console.log(err));
        }

        if(state.screenLoading || !state.medications)
            getMedics();

        return () => {
            isScreenMounted.current = false;
        }
    }, [state]);

    React.useEffect(() => {
        if(!isModalVisible && state.editValues)
            setState({...state, editValues: null});
    }, [isModalVisible]);

    if(state.screenLoading && !state.medications) return <View style={{height: 500}}>
        <Text style={{alignSelf: 'center', textAlignVertical: 'center'}}>Loading...</Text>
        <AddMedication onAdded={() => setState({...state, screenLoading: true})}/>
    </View>;
    if(!state.medications || state.medications.length === 0)  return <AddMedication onAdded={() => setState({...state, screenLoading: true})}/>;
    return (
        <View>
            <FlatList
                data={state.medications}
                renderItem={({item, index}) => (
                <Card>
                    <Card.Title>{item.medicineRef.name}</Card.Title>
                    <Card.Divider color='black' />
                    <View style={{alignItems: 'center'}}>
                        <Text>Quantity: {item.quantity}</Text>
                        <Text>Dosage amount: {item.dosageamount}</Text>
                        <Text>Time for take:</Text>
                        <Text>{item.times.map((time) => moment.utc(time, 'HH:mm').local().format('HH:mm')).join(' ')}</Text>
                    </View>
                    <View style={{flexDirection: 'row', bottom: -10, alignSelf: 'auto', justifyContent: 'space-around'}}>
                        <Button
                            title='Remove'
                            icon={{type: 'feather', name: 'trash', size: 15, color: 'white'}}
                            onPress={() => remove(item.medicineRef.name)}
                        />
                        <Button
                            style={{width: 70}}
                            loading={state.isLoading[index]}
                            disabled={state.isLoading[index]}
                            title='Taken'
                            onPress={() => take(item.medicineRef.name, index)}
                        />
                        <Button
                            icon={{type: 'feather', name: 'edit', size: 15, color: 'white'}}
                            iconPosition='left'
                            title='Edit'
                            onPress={() => {
                                setState({...state, editValues: {
                                    name: item.medicineRef.name,
                                    dosageamount: item.dosageamount, 
                                    quantity: item.quantity, 
                                    times: item.times.map((time) => moment.utc(time, 'HH:mm').local().format('HH:mm'))}});
                                setModalVisible(true);
                            }}
                        />
                    </View>
                </Card>
                )}
                numColumns={1}
                extraData={state}
                keyExtractor={(item, index) => item+" "+index}
                style={{marginBottom: 10, height: 500}}
            />
            <AddMedication
                isModalVisible={isModalVisible}
                setModalVisible={setModalVisible}
                onAdded={() => setState({...state, screenLoading: true})}
                editValues={state.editValues}
            />
        </View>
    );
};

export default MedicinesScreen;