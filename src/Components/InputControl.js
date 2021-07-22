import React, { useState } from 'react';
import { Platform, TouchableWithoutFeedback , View } from 'react-native';
import { Input } from 'react-native-elements';
import { useController } from 'react-hook-form';
import DateTimePickerModal from "react-native-modal-datetime-picker";

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
                if(isTouched || invalid) trigger(name);
            }}
            value={value}
            secureTextEntry={secureTextEntry}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            autoFocus={false}
            onEndEditing={() => {
                trigger(name);
                console.log(name);
                if(typeof onEndEditing === 'function')
                    onEndEditing();
                console.log(value, error);
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
                    console.log(date);
                    Date.parse()
                    onChange(dateToString(new Date(date)));
                    trigger();
                }}
                onCancel={() => setDatePickerVisibility(false)}
            />
        </View>
    )
}