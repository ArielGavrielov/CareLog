import React from 'react';
import { View, Dimensions, FlatList, Alert, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Button, Text, Card, Icon, Divider } from 'react-native-elements';
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
                <Divider orientation="vertical" />
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

const MedicationMoreInfo = ({data, children, isInfoVisible, setInfoVisible}) => {
    const [dateChoosen, setDateChoosen] = React.useState(null);
    const [dateChooseOpen, setDateChooseOpen] = React.useState(false);
    const [takens, setTakens] = React.useState();

    React.useEffect(() => {
        if(isInfoVisible) {
            console.log(data.taken);
            let takenData = data.taken.map((value,index) => {
                value.time.sort((a,b) => moment(a, 'HH:mm:ss').diff(moment(b, 'HH:mm:ss')));
                return {label: value.date, value: value}
            });
            takenData.sort((a,b) => moment(b.label, 'Y-MM-DD').diff(moment(a.label, 'Y-MM-DD')));
            setTakens(takenData);
        }

        return () => {
            if(!isInfoVisible) {
                setTakens();
                setDateChooseOpen(false);
                setDateChoosen(null);
                console.log("unmounted");
            }
        }
    }, [isInfoVisible]);

    if(!data) return null;

    return <View>
            <ModalWithX 
                isVisible={isInfoVisible}
                onBackdropPress={() => setInfoVisible(false)}
                onRequestClose={() => setInfoVisible(false)}
                deviceWidth={Dimensions.get('window').width}
                deviceHeight={Dimensions.get('window').height}
            >
                <Text h1>{data.medicineRef.name} Info</Text>
                <Divider orientation="vertical" style={{marginVertical: 10}} />
                <Text h2>Basic information</Text>
                <View style={{flexDirection: 'row'}}>
                    <Text style={{fontWeight:'bold'}}>Stock quantity: </Text>
                    <Text>{data.quantity}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                    <Text style={{fontWeight:'bold'}}>Dosage amount: </Text>
                    <Text>{data.dosageamount}</Text>
                </View>
                <FlatList
                    contentContainerStyle={{alignItems: 'center'}}
                    ListHeaderComponent={<Text style={{backgroundColor: 'white', fontWeight:'bold'}}>Times to take:</Text>}
                    stickyHeaderIndices={[0]}
                    ListEmptyComponent={<Text>No Data</Text>}
                    style={{maxHeight: 70}}
                    scrollEnabled={data.times.length > 3}
                    data={data.times}
                    keyExtractor={(item, index) => item + index}
                    renderItem={({item}) => <Text>{moment.utc(item, 'HH:mm').local().format('HH:mm')}</Text>}
                />
                <Divider orientation="vertical" style={{marginVertical: 10}} />
                <Text h2>Takens Stats</Text>
                <DropDownPicker
                    itemKey="label"
                    setItems={setTakens}
                    open={dateChooseOpen}
                    value={dateChoosen}
                    items={takens}
                    setOpen={setDateChooseOpen}
                    setValue={setDateChoosen}
                    maxHeight={100}
                />
                { dateChoosen ? 
                <FlatList
                    contentContainerStyle={{alignItems: 'center'}}
                    ListHeaderComponent={dateChoosen ? <Text h4 style={{backgroundColor: 'white'}}>{dateChoosen.date}</Text> : null}
                    stickyHeaderIndices={[0]}
                    ListEmptyComponent={<Text>No Data</Text>}
                    //scrollEnabled={dateChoosen.time.length > 2}
                    style={{maxHeight: 70}}
                    data={dateChoosen.time}
                    keyExtractor={(item, index) => item + index}
                    renderItem={({item}) => <Text>{moment.utc(item, 'HH:mm:ss').local().format('HH:mm:ss')}</Text>}
                /> : null }
                <Divider orientation="vertical" style={{marginVertical: 10}} />
                <Text h2>Actions</Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                    {children}
                </View>
            </ModalWithX>
    </View>
}

const MedicinesScreen = () => {
    const [state, setState] = React.useState({
        medications: null,
        isLoading: [],
        screenLoading: true,
        editValues: null,
        itemInfo: null
    });
    const isScreenMounted = React.useRef(true);
    const isAlertShowing = React.useRef(false);
    const [isModalVisible, setModalVisible] = React.useState(false);
    const [isInfoVisible, setInfoVisible] = React.useState(false);

    // async alert - waiting for user response.
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

    // take medicine handle
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
                AsyncAlert('Success', 'Removed successfully', [{text: 'OK', resolve: true}])
                .finally(() => {setInfoVisible(false); setState({...state, screenLoading: true}); });
            }).catch((err) => AsyncAlert("ERROR", err.message, [{text: 'OK'}]));
        }
    }

    React.useEffect(() => {
        const getMedics = () => {
            if(!isScreenMounted.current && !isModalVisible && !isAlertShowing.current) return;
            let res = getMedicines();
            res.then((value) => {
                if(isScreenMounted.current || isModalVisible || isAlertShowing.current)
                    setState({...state, medications: value, isLoading: Array(res.length).fill(false), screenLoading: false});
            }).catch((err) => console.log(err));
        }
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

    return (
        <View style={{flex: 1, height: Dimensions.get('window').height, width: Dimensions.get('window').width}}>
            <FlatList
                data={state.medications}
                renderItem={({item, index}) => (
                <Card>
                    <Card.Title>{item.medicineRef.name}</Card.Title>
                    <Card.Divider color='black' />
                    <View style={{alignItems: 'center'}}>
                        <Text>Stock Quantity: {item.quantity}</Text>
                        <Text>Dosage amount: {item.dosageamount}</Text>
                        <Text>Time for take:</Text>
                        <Text>{item.times.map((time) => moment.utc(time, 'HH:mm').local().format('HH:mm')).join(' ')}</Text>
                    </View>
                    <View style={{flexDirection: 'row', bottom: -10, alignSelf: 'auto', justifyContent: 'space-around'}}>
                        <Button
                            icon={{type: 'font-awesome-5', name: 'hand-holding', color: 'white', size: 15}}
                            style={{width: 80}}
                            loading={state.isLoading[index]}
                            disabled={state.isLoading[index]}
                            title='Taken'
                            onPress={() => take(item.medicineRef.name, index)}
                        />
                        <Button
                            title="More info"
                            onPress={() => {
                                setState({...state, itemInfo: item});
                                setInfoVisible(true);
                            }}
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
            <MedicationMoreInfo 
                data={state.itemInfo} 
                //taken={state.itemInfo.taken}
                isInfoVisible={isInfoVisible}
                setInfoVisible={setInfoVisible}
            >
                <Button
                    title='Remove'
                    icon={{type: 'feather', name: 'trash', size: 15, color: 'white'}}
                    onPress={() => remove(state.itemInfo.medicineRef.name)}
                />
            </MedicationMoreInfo>
        </View>
    );
};

export default MedicinesScreen;