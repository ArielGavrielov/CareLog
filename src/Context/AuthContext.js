import createDataContext from './createDataContext';
import { CareLogAPI } from '../api/carelog';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication'
import { Alert } from 'react-native';

const authReducer = (state, action) => {
    switch(action.type) {
        case 'user_details':
            return {...state, userDetails: action.payload};
        case 'restore_token':
            return {...state, token: action.payload, isLoading: false, isSignout: false};
        case 'add_error': // if not responsed code 200;
            return { ...state, errorMessage: action.payload, message: '' };
        case 'signin':
            return { ...state, errorMessage: '', token: action.payload, isSignout: false };
        case 'signup':
            return { ...state, errorMessage: '', token: action.payload, isSignout: false };
        case 'signout':
            return { ...state, errorMessage: '', token: null, isSignout: true, userDetails: null };
        case 'reset_password':
            return { ...state, errorMessage: '', payload: action.payload};
        case 'clear_error_message':
            return {...state, errorMessage: '', message:'' };
        default: 
            return { isLoading: false, token: null, isSignout: true, errorMessage: '', message:'', userDetails:null }
    }
}

// get user details
const updateUserData = dispatch => async (token) => {
    if(token) {
        try {
            const response = await CareLogAPI.get('/user/',
            { headers: {
                    'Authorization': 'Bearer ' + token
            }});
            dispatch({ type: 'user_details', payload: response.data });
        } catch(err) {
            dispatch({ type: 'user_details', payload: null })
        }
    } else
        dispatch({ type: 'user_details', payload: null })
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
        const compatible = await LocalAuthentication.hasHardwareAsync();

        if(token && compatible) {
            const biometricAuth = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Login with Biometrics',
                disableDeviceFallback: true,
                cancelLabel : 'Cancel'
            });

            // need to remove it.
            await updateUserData(dispatch)(token);
            dispatch({type: 'restore_token', payload: token});
            /*if(biometricAuth.success) {
                await updateUserData(dispatch)(token);
                dispatch({type: 'restore_token', payload: token});
            } else dispatch({type: 'restore_token', payload: null});*/
        } else {
            await updateUserData(dispatch)(token);
            dispatch({type: 'restore_token', payload: token});
        }
    } catch(e){
       console.log("cant to get token...");
       dispatch({type: 'restore_token', payload: null});
    }
}

// signup post
const signup = dispatch => async ({email, password, firstname, lastname, birthdate, phone}) => {
    try {
        // get responsed
        const response = await CareLogAPI.post('/user/signup', {email, password, firstname, lastname, birthdate, phone});
        await updateUserData(dispatch)(response.data.token);
        // save token at AsyncStorage
        await SecureStore.setItemAsync('token', response.data.token);
        dispatch({ type: 'signup', payload: response.data.token });
    } catch(err) {
        // add error
        dispatch({ type: 'add_error', payload: err.message });
    }
};

// reset password post
const resetPasswordRequest = dispatch => async ({email, birthdate}) => {
    try {
        // get responsed
        const response = await CareLogAPI.post('/user/reset-password', {email, birthdate});
        dispatch({ type: 'reset_password', payload: response.data });
    } catch(err) {
        // add error
        console.log(err.message);
        dispatch({ type: 'add_error', payload: 'Something went wrong with reset password.' });
    }
}

// signin post
const signin = (dispatch) => async ({ email, password }) => {
    try {
        // get responsed
        const response = await CareLogAPI.post('/user/signin', { email, password });
        await updateUserData(dispatch)(response.data.token);
        // save token at AsyncStorage
        await SecureStore.setItemAsync('token', response.data.token);
        dispatch({ type: 'signin', payload: response.data.token });
    } catch(err) {
        // add error
        console.log(err.message);
        dispatch({ type: 'add_error', payload: 'Something went wrong with signin.' });
    }
};

// signout - remove token from securestore
const signout = dispatch => async () => {
    await SecureStore.deleteItemAsync('token');
    dispatch({type: 'signout'});
};

export const { Provider, Context } = createDataContext(
    authReducer,
    { signin, signout, signup, clearErrorMessage, restoreToken, resetPasswordRequest },
    { token: null, errorMessage: '', isLoading: true, isSignout: true, payload:{message: '', id: ''}, userDetails: null }
);