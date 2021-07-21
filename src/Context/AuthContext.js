import createDataContext from './createDataContext';
import CareLogAPI from '../api/carelog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../navigationRef';
import * as SecureStore from 'expo-secure-store';
import React from 'react';

const authReducer = (state, action) => {
    switch(action.type) {
        case 'restore_token':
            return {...state, token: action.payload, isLoading: false}
        case 'add_error': // if not responsed code 200;
            return { ...state, errorMessage: action.payload };
        case 'signin':
            return { ...state, errorMessage: '', token: action.payload, isSignout: false };
        case 'signup':
            return { ...state, errorMessage: '', token: action.payload, isSignout: false };
        case 'signout':
            return { ...state, errorMessage: '', token: null, isSignout: true };
        case 'clear_error_message':
            return {...state, errorMessage: ''};
        default: 
            return { isLoading: true, token: null, isSignout: false, errorMessage: '' }
    }
}

// clear error message
const clearErrorMessage = dispatch => () => {
    dispatch({
        type: 'clear_error_message'
    });
}

// Automatic signin
const restoreToken = dispatch => async () => {
    let token;
    
    try {
        token = await SecureStore.getItemAsync('token');
    } catch(e){
       console.log("cant to get token...");
    }
    dispatch({type: 'restore_token', payload: token});
    /*React.useEffect(async () => {
        let token;
    
            try {
                token = await SecureStore.getItemAsync('token');
            } catch(e){
                console.log("cant to get token...");
            }
            dispatch({type: 'restore_token', payload: token});
    }, []);*/
}

// signup post
const signup = dispatch => async ({email, password, first_name, last_name, birthdate, phone}) => {
    try {
        // get responsed
        const response = await CareLogAPI.post('/signup', {email, password, first_name, last_name, birthdate, phone});
        // save token at AsyncStorage
        await SecureStore.setItemAsync('token', response.data.token);
        dispatch({ type: 'signup', payload: response.data.token });
    } catch(err) {
        // add error
        dispatch({ type: 'add_error', payload: 'Something went wrong with signup.' });
    }
};

// signin post
const signin = (dispatch) => async ({ email, password }) => {
    try {
        console.log("login", email, password);
        // get responsed
        const response = await CareLogAPI.post('/signin', { email, password });
        // save token at AsyncStorage
        await SecureStore.setItemAsync('token', response.data.token);
        dispatch({ type: 'signin', payload: response.data.token });
    } catch(err) {
        // add error
        dispatch({ type: 'add_error', payload: 'Something went wrong with signin.' });
    }
};

const signout = dispatch => async () => {
    await SecureStore.deleteItemAsync('token');
    dispatch({type: 'signout'});
    navigate('Login');
};

export const { Provider, Context } = createDataContext(
    authReducer,
    { signin, signout, signup, clearErrorMessage, restoreToken },
    { token: null, errorMessage: '', isLoading: true, isSignout: false }
);