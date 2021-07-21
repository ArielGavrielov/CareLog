import React, { useState } from 'react';
import { Platform } from 'react-native';
import { Input } from 'react-native-elements';
import { useController } from 'react-hook-form';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { TouchableWithoutFeedback , View } from 'react-native';

export const InputControl = ({
    name, control, rules={}, render=null, keyboardType='default',
    leftIcon=null, secureTextEntry=false, autoCapitalize='none',
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
            label={(rules.required ? '* ' : '') + name.charAt(0).toUpperCase() + name.slice(1)}
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
            >
                <View style={{flex: 1}}>
                    <Input
                    editable={false}
                    style={style}
                    label={(rules.required ? '* ' : '') + name.charAt(0).toUpperCase() + name.slice(1)}
                    inputContainerStyle={error && {borderBottomColor:'red'}}
                    errorMessage={error && error.message}
                    leftIcon={leftIcon}
                    onBlur={onBlur}
                    onChangeText={value => onChange(value)}
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
                }}
                onCancel={() => setDatePickerVisibility(false)}
            />
        </View>
    )
}