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
            return {...state, isLoading: true, token: null}
    }
}

// clear error message
const clearErrorMessage = dispatch => () => {
    dispatch({
        type: 'clear_error_message'
    });
}

// Automatic signin
const tryLocalSignin = dispatch => async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        if(token) {
            await dispatch({ type: 'signin', payload: token, isLoading: false});
            navigate('Home');
        } else {
            await dispatch({isLoading: false});
            navigate('Login');
        }
    } catch(err) {
        console.log("tryLocalSignin error:", err);
    }
}
// signup post
const signup = dispatch => async ({email, password, first_name, last_name, birthdate, phone}) => {
    try {
        // get responsed
        const response = await CareLogAPI.post('/signup', {email, password, first_name, last_name, birthdate, phone});
        // save token at AsyncStorage
        await AsyncStorage.setItem('token', response.data.token);
        dispatch({ type: 'signup', payload: response.data.token });
        navigate('Home');
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
        await AsyncStorage.setItem('token', response.data.token);
        dispatch({ type: 'signin', payload: response.data.token });
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
    { signin, signout, signup, clearErrorMessage, tryLocalSignin },
    { token: null, errorMessage: '', isLoading: true }
);