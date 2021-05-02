import createDataContext from './createDataContext';
import CareLogAPI from '../api/carelog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../navigationRef';

const authReducer = (state, action) => {
    switch(action.type) {
        case 'add_error': // if not responsed code 200;
            return { ...state, errorMessage: action.payload };
        case 'signin':
            return { errorMessage: '', token: action.payload };
        case 'signup':
            return { errorMessage: '', token: action.payload };
        case 'signout':
            return {errorMessage: '', token: null};
        case 'clear_error_message':
            return {...state, errorMessage: ''};
        default: 
            return state;
    }
}

// clear error message
const clearErrorMessage = dispatch => () => {
    dispatch({
        type: 'clear_error_message'
    });
}

// Get token
const getToken = dispatch => async () => {
    const token = await AsyncStorage.getItem('token');
    return token;
}
// Automatic signin
const tryLocalSignin = dispatch => async () => {
    const token = await AsyncStorage.getItem('token');
    if(token) {
        dispatch({ type: 'signin', payload: token});
        navigate('Home');
    }
    else {
        navigate('Login')
    }
}
// signup post
const signup = dispatch => async ({email, password, first_name, last_name, birthdate, phone}) => {
    try {
        console.log({email, password, first_name, last_name, birthdate, phone});
        // get responsed
        const response = await CareLogAPI.post('/signup', {email, password, first_name, last_name, birthdate, phone});
        console.log(response.data);
        // save token at AsyncStorage
        await AsyncStorage.setItem('token', response.data.token);
        dispatch({ type: 'signup', payload: response.data.token });
        navigate('Home');
    } catch(err) {
        // add error
        dispatch({ type: 'add_error', payload: 'Something went wrong with signup.' });
        console.log(err);
    }
};

// signin post
const signin = (dispatch) => async ({ email, password }) => {
    try {
        // get responsed
        const response = await CareLogAPI.post('/signin', { email, password });
        // save token at AsyncStorage
        await AsyncStorage.setItem('token', response.data.token);
        dispatch({ type: 'signin', payload: response.data.token });
        console.log("token", response.data.token);
        navigate('Home');
    } catch(err) {
        // add error
        dispatch({ type: 'add_error', payload: 'Something went wrong with signin.' });
    }
};

const signout = dispatch => async () => {
    await AsyncStorage.removeItem('token');
    dispatch({type: 'signout'});
    navigate('Login');
};

export const { Provider, Context } = createDataContext(
    authReducer,
    { signin, signout, signup, clearErrorMessage, tryLocalSignin, getToken },
    { token: null, errorMessage: '' }
);