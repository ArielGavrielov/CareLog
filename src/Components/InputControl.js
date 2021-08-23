import React, { useState } from 'react';
import { Platform, TouchableWithoutFeedback , View, FlatList, StyleSheet } from 'react-native';
import { Input, Text } from 'react-native-elements';
import { useController } from 'react-hook-form';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ItemBox  from './ItemBox';
import { Button, Icon } from 'react-native-elements';
import Autocomplete from 'react-native-autocomplete-input';

export const InputControl = ({
    name, control, rules={}, trigger=() => console.log("there is no trigger."), render=null, keyboardType='default',
    leftIcon=null, secureTextEntry=false, autoCapitalize='none', defaultValue='',
    autoCorrect = false, style={}, containerStyle={}, onEndEditing=null
}) => {
    const {
        field: { onChange, value, onBlur },
        fieldState: { error, invalid, isTouched }
    } = useController({name: name.replace(/\s/g, '').toLowerCase(), control, rules, defaultValue: defaultValue, shouldUnregister: false});
    return render ? render : (
        <Input
            containerStyle={containerStyle}
            style={style}
            label={(rules.required ? '* ' : '') + name.charAt(0).toUpperCase() + name.slice(1)}
            keyboardType={keyboardType}
            inputContainerStyle={error && {borderBottomColor:'red'}}
            errorMessage={error && error.message}
            leftIcon={leftIcon}
            onBlur={onBlur}
            onChangeText={(text) => {
                onChange(text);
                /*if(isTouched || invalid)*/ trigger(name);
            }}
            value={value}
            secureTextEntry={secureTextEntry}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            autoFocus={false}
            onEndEditing={() => {
                trigger(name);
                if(typeof onEndEditing === 'function')
                    onEndEditing();
            }}
        />
    )
}

export const DateInputControl = ({name, control, rules={}, render=null, leftIcon=null,style={}, trigger=()=>console.log("there is no trigger.")}) => {
    const {
        field: { onChange, value, onBlur },
        fieldState: { error }
    } = useController({name: name.replace(/\s/g, '').toLowerCase(), control, rules, defaultValue:''});
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const dateToString = (date) => {
        var day,mon,year;
        day = date.getDate();
        mon = date.getMonth()+1;
        year = date.getFullYear();
        if(day < 10) day = '0'+day;
        if(mon < 10) mon = '0'+mon;
        return year+'-'+mon+'-'+day;
    };
    return render ? render : (
        <View style={{flexDirection: 'row'}}>
            <TouchableWithoutFeedback
                onPress={() => setDatePickerVisibility(true)}
                onBlur={onBlur}
            >
                <View style={{flex: 1}}>
                    <Input
                    editable={false}
                    style={style}
                    label={(rules.required ? '* ' : '') + name.charAt(0).toUpperCase() + name.slice(1)}
                    inputContainerStyle={error && {borderBottomColor:'red'}}
                    errorMessage={error && error.message}
                    leftIcon={leftIcon}
                    onChangeText={(text) => {
                        onChange(text);
                        trigger(name);
                    }}
                    value={value}
                    autoFocus={false}
                    onTouchEnd={() => setDatePickerVisibility(true)}
                    />
                </View>
            </TouchableWithoutFeedback>
            <DateTimePickerModal
                locale="he_il"
                display={Platform.OS === 'ios' && Platform.Version > 14 ? 'inline' : ''}
                isVisible={isDatePickerVisible}
                maximumDate={new Date()}
                minimumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 120))}
                mode="date"
                headerTextIOS="Enter birth date"
                date={isNaN(Date.parse(value)) ? new Date() : new Date(value)}
                onConfirm={(date) => {
                    setDatePickerVisibility(false);
                    Date.parse()
                    onChange(dateToString(new Date(date)));
                    trigger();
                }}
                onCancel={() => setDatePickerVisibility(false)}
            />
        </View>
    )
}

export const TimesInputControl = ({name, control, rules={}, render=null, leftIcon=null,style={}, trigger=()=>null}) => {
    const {
        field: { onChange, value=[], onBlur },
        fieldState: { error }
    } = useController({name: name.replace(/\s/g, '').toLowerCase(), control, rules, defaultValue:''});
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
    const flatListRef = React.useRef();

    const timeToString = (time) => {
        let hour = time.getHours();
        let min = time.getMinutes();
        if(hour < 10) hour = '0'+hour;
        if(min < 10) min = '0'+min;
        return hour+':'+min;
    };

    return render ? render : (
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <Text h4>{rules.required ? '*' : ''} {name}</Text>
            <Button
                icon={{type: 'feather', name: 'plus', color: 'white'}}
                onPress={() => setTimePickerVisibility(true)}
                onBlur={onBlur}
            />
            {value.length > 0 ? 
            <View style={{maxHeight: 100, margin: 5}}>
                <Text>Swipe right to delete.</Text>
                <FlatList
                    style={{marginTop: 5}}
                    ref={flatListRef}
                    data={value}
                    keyExtractor={(item, index) => item + index}
                    renderItem={({item, index}) => {
                    return <ItemBox data={item} handleDelete={() => {
                                const arr = [...value];
                                arr.splice(index, 1);
                                onChange(arr);
                        }} />;
                    }}
                    ItemSeparatorComponent={() => {
                        return <View style={{height: 1, backgroundColor: 'black'}}></View>;
                    }}
                />
            </View> : null }
            <DateTimePickerModal
                locale="en_il"
                isVisible={isTimePickerVisible}
                mode="time"
                date={isNaN(Date.parse(value)) ? new Date() : new Date(value)}
                onConfirm={(date) => {
                    setTimePickerVisibility(false);
                    let dateString = timeToString(date);
                    if(value.length > 0) {
                        let pos = value.map((value) => value).indexOf(dateString);
                        if(pos === -1) {
                            const arr = [...value, dateString];
                            arr.sort((a,b) => a > b ? 1 : a < b ? -1 : 0);
                            onChange(arr);
                            flatListRef.current.scrollToIndex({ animated: true, index: arr.indexOf(dateString) });
                        }
                        else
                            flatListRef.current.scrollToIndex({ animated: true, index: pos });
                    } else
                        onChange([dateString]);
                }}
                onCancel={() => setTimePickerVisibility(false)}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    MainContainer: {
      backgroundColor: '#FAFAFA',
      flex: 1,
      padding: 12,
    },
    AutocompleteStyle: {
      flex: 1,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 1,
     borderWidth:1
    },
    SearchBoxTextItem: {
      margin: 5,
      fontSize: 16,
      paddingTop: 4,
    },
    selectedTextContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    selectedTextStyle: {
      textAlign: 'center',
      fontSize: 18,
    },
  });