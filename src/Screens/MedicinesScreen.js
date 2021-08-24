import React from 'react';
import { View, Dimensions, FlatList, Alert, StyleSheet } from 'react-native';
import { Button, Text, Card, Icon } from 'react-native-elements';
import { InputControl, TimesInputControl } from '../Components/InputControl';
import { useForm } from 'react-hook-form';
import { postMedicine, getMedicines, takeMedicine, deleteMedicine } from '../api/carelog';
import moment from 'moment';
import ModalWithX from '../Components/ModalWithX';

const AddMedication = ({onAdded = () => console.log("need onAdded property."), isModalVisible, setModalVisible, editValues=null}) => {
    const {control, handleSubmit, trigger, formState, reset, setValue} = useForm();
    const [error, setError] = React.useState(null);

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
            <View style={{bottom: 0, left: 0, right: 0}}>
                <Button
                    title="Add Medication"
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
                <View style={{flexDirection: 'row', marginTop: 10}}>
                    <Button title="Submit" onPress={handleSubmit(onAdded)} />
                </View>
            </ModalWithX>
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
    const isAlertShowing = React.useRef(false);
    const [isModalVisible, setModalVisible] = React.useState(false);

    const AsyncAlert = (title, message, buttons, options={}) => {
        return new Promise((resolve, reject) => {
            isAlertShowing.current = true;
            Alert.alert(
                title,
                message,
                buttons.map((value) => {return {text: value.text, onPress: value.onPress ? value.onPress : () => resolve(value.resolve ? value.resolve : null)}}),
                options
            );
        }).finally(() => {
            isAlertShowing.current = false;
        });
    }

    const take = (name, index) => {
        const loadingArr = state.isLoading;
        loadingArr[index] = true;
        setState({...state, isLoading: loadingArr});

        takeMedicine(name).then((value) => {
            AsyncAlert("Success", "Updated successfully", [{text: 'OK'}]);
            setState({...state, screenLoading: true});
        }).catch((err) => AsyncAlert("ERROR", err.message, [{text: 'OK'}]))
        .finally(() => {
            loadingArr[index] = false;
            setState({...state, isLoading: loadingArr});
        });
    }

    const remove = async (name) => {
        let alertRes = await AsyncAlert('IMPORTANT',
            `By removing ${name} also all taken data will remove, continue?`,
            [
                {text: 'YES', resolve: true },
                {text: 'NO', resolve: false }
            ]
        );
        if(alertRes) {
            deleteMedicine(name).then((value) => {
                AsyncAlert('Success', 'Removed successfully', [{text: 'OK', resolve: true}]);
                setState({...state, screenLoading: true});
            }).catch((err) => AsyncAlert("ERROR", err.message, [{text: 'OK'}]));
        }
    }

    React.useEffect(() => {
        const getMedics = () => {
            console.log(isScreenMounted.current, isModalVisible, isAlertShowing.current);
            if(!isScreenMounted.current && !isModalVisible && !isAlertShowing.current) return;
            let res = getMedicines();
            res.then((value) => {
                console.log("length", value.length);
                if(isScreenMounted.current || isModalVisible || isAlertShowing.current)
                    setState({...state, medications: value, isLoading: Array(res.length).fill(false), screenLoading: false});
            }).catch((err) => console.log(err));
        }
        console.log(state.screenLoading);
        if(state.screenLoading || !state.medications)
            getMedics();

        return () => {
            isScreenMounted.current = false;
        }
    }, [state.screenLoading]);

    React.useEffect(() => {
        if(!isModalVisible && state.editValues)
            setState({...state, editValues: null});
    }, [isModalVisible]);

    if(state.screenLoading && !state.medications) return <View style={{position: "absolute", left: 0, right: 0, bottom: 0, top: 0, alignItems: "center"}}>
        <Text>Loading...</Text>
    </View>

    //if(!state.medications || state.medications.length === 0)  return <AddMedication onAdded={() => setState({...state, screenLoading: true})}/>

    return (
        <View style={{flex: 1, height: Dimensions.get('window').height, width: Dimensions.get('window').width}}>
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
            />
            <AddMedication
                isModalVisible={isModalVisible}
                setModalVisible={setModalVisible}
                onAdded={(props) => {
                    postMedicine(props).then((value) => {
                        AsyncAlert('Success', (state.editValues ? 'Edited' : 'Added') +' successfully', [{text: 'OK', onPress: () => setModalVisible(false)}]);
                        setState({...state, screenLoading: true})
                    }).catch((err) => AsyncAlert('ERROR', err.message, [{text: 'OK'}]));
                }}
                editValues={state.editValues}
            />
        </View>
    );
};

export default MedicinesScreen;