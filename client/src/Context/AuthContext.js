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
            return {...state, token: action.payload, isLoading: false};
        case 'add_error': // if not responsed code 200;
            return { ...state, errorMessage: action.payload, message: '' };
        case 'signin':
            return { ...state, errorMessage: '', token: action.payload, isSignout: false };
        case 'signup':
            return { ...state, errorMessage: '', token: action.payload, isSignout: false };
        case 'signout':
            return { ...state, errorMessage: '', token: null, isSignout: true, userDetails: null };
        case 'reset_password':
            return { ...state, errorMessage: '', resetPassword: action.payload ?{...state.resetPassword, ...action.payload} : {message: '', id: ''}};
        case 'clear_error_message':
            return {...state, errorMessage: '', message:'' };
        default: 
            return { isLoading: false, token: null, isSignout: true, errorMessage: '', message:'', userDetails:null }
    }
}

// get user details
const updateUserData = dispatch => () => {
    return new Promise(async (resolve, reject) => {
        CareLogAPI.get('/user/').then((response) => {
            dispatch({ type: 'user_details', payload: response.data });
            resolve(true);
        }).catch((err) => {
            dispatch({ type: 'user_details', payload: null });
            reject(false);
        });
    });
}
// clear error message
const clearErrorMessage = dispatch => () => {
    dispatch({type: 'clear_error_message'});
}

// Automatic signin
const restoreToken = dispatch => async () => {
    let token;
    try {
        token = await SecureStore.getItemAsync('token');
        if(!token) throw token;
        /*const compatible = await LocalAuthentication.hasHardwareAsync();

        if(token && compatible) {
            const biometricAuth = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Login with Biometrics',
                disableDeviceFallback: true,
                cancelLabel : 'Cancel'
            });
            if(biometricAuth.success) {
                await updateUserData(dispatch)(token);
                dispatch({type: 'restore_token', payload: token});
            } else dispatch({type: 'restore_token', payload: null});
        } else {
            await updateUserData(dispatch)(token);
            dispatch({type: 'restore_token', payload: token});
        }*/
        // need to remove it.
        await updateUserData(dispatch)();
        dispatch({type: 'restore_token', payload: token});
    } catch(e){
       SecureStore.deleteItemAsync('token');
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
        console.log(err.response.data);
        dispatch({ type: 'add_error', payload: err.response.data.error });
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
        dispatch({ type: 'add_error', payload: err.response.data.error });
    }
}

const checkToken = dispatch => async (id, token) => {
    try {
        // get responsed
        const response = await CareLogAPI.get(`/user/reset-password/${id}/${token}`);
        dispatch({ type: 'reset_password', payload: response.data });
        console.log(response.data);
    } catch(err) {
        // add error
        console.log(err.message);
        dispatch({ type: 'add_error', payload: err.response.data.error });
    }
};

const changePassword = dispatch => async (id, token, password) => {
    try {
        // get responsed
        const response = await CareLogAPI.post(`/user/reset-password/${id}/${token}`, {password});
        dispatch({ type: 'reset_password', payload: response.data });
        console.log(response.data);
    } catch(err) {
        // add error
        console.log(err.response.data.error);
        dispatch({ type: 'add_error', payload: err.response.data.error });
    }
}

const resetDone = dispatch => () => {
    dispatch({ type: 'reset_password', payload: null });
}

// signin post
const signin = (dispatch) => async ({ email, password }) => {
    try {
        // get responsed
        const response = await CareLogAPI.post('/user/signin', { email, password });
        console.log(response.data);
        await SecureStore.setItemAsync('token', response.data.token);
        await updateUserData(dispatch)(response.data.token);
        // save token at AsyncStorage
        dispatch({ type: 'signin', payload: response.data.token });
    } catch(err) {
        // add error
        console.log(err.response.data);
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
    { signin, signout, signup, clearErrorMessage, restoreToken, resetPasswordRequest, checkToken, changePassword, resetDone },
    { token: null, errorMessage: '', isLoading: true, isSignout: true, resetPassword:{message: '', id: ''}, userDetails: null }
);