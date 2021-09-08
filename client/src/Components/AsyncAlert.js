import React from 'react';
import { Alert } from 'react-native';

// async alert - waiting for user response.
export const AsyncAlert = (title, message, buttons, options={}, ref=null) => {
    return new Promise((resolve, reject) => {
        if(ref)
            ref.current = true;
        Alert.alert(
            title,
            message,
            buttons.map((value) => {return {text: value.text, onPress: value.onPress ? value.onPress : () => resolve(value.resolve ? value.resolve : null)}}),
            options
        );
    }).finally(() => {
        if(ref)
            ref.current = false;
    });
}