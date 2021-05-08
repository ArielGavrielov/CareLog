import React, { useState } from 'react';
import { Input } from 'react-native-elements';
import { useController } from 'react-hook-form';
import DateTimePickerModal from "react-native-modal-datetime-picker";

export const InputControl = ({
    name, control, rules={}, render=null, keyboardType='default',
    leftIcon=null, secureTextEntry=false, autoCapitalize=false,
    autoCorrect = false, style={}, containerStyle={}
}) => {
    const {
        field: { onChange, value, onBlur },
        fieldState: { error }
    } = useController({name, control, rules, defaultValue:''});
    return render ? render : (
        <Input
            containerStyle={containerStyle}
            style={style}
            label={(rules.required ? '* ' : '') + name}
            keyboardType={keyboardType}
            inputContainerStyle={error && {borderBottomColor:'red'}}
            errorMessage={error && error.message}
            leftIcon={leftIcon}
            onBlur={onBlur}
            onChangeText={value => onChange(value)}
            value={value}
            secureTextEntry={secureTextEntry}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            autoFocus={false}
        />
    )
}

export const DateInputControl = ({name, control, rules={}, render=null, leftIcon=null,style={}}) => {
    const {
        field: { onChange, value, onBlur },
        fieldState: { error }
    } = useController({name, control, rules, defaultValue:''});
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const dateToString = (date) => {
        console.log(date);
        var day,mon,year;
        day = date.getDate();
        mon = date.getMonth()+1;
        year = date.getFullYear();
        if(day < 10) day = '0'+day;
        if(mon < 10) mon = '0'+mon;
        return day+'/'+mon+'/'+year;
    };
    return render ? render : (
        <>
            <Input
                disabled
                style={style}
                label={(rules.required ? '* ' : '') + name}
                inputContainerStyle={error && {borderBottomColor:'red'}}
                errorMessage={error && error.message}
                leftIcon={leftIcon}
                onBlur={onBlur}
                onChangeText={value => onChange(value)}
                value={value}
                autoFocus={false}
                onTouchEnd={() => setDatePickerVisibility(true)}
            />
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                maximumDate={new Date()}
                minimumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 120))}
                mode="date"
                headerTextIOS="Enter birth date"
                date={isNaN(new Date(value)) ? new Date() : new Date(value)}
                onConfirm={(date) => {
                    console.log(date);
                    onChange(dateToString(new Date(date)));
                    setDatePickerVisibility(false);
                }}
                onCancel={() => setDatePickerVisibility(false)}
            />
        </>
    )
}