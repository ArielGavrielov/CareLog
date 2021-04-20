import createDataContext from './createDataContext';
import CareLogAPI from '../api/carelog';
//import AsyncStorage from '@react-native-async-storage/async-storage';

const authReducer = (state, action) => {
    switch(action.type) {
        case 'add_error': // if not responsed code 200;
            return { ...state, errorMessage: action.payload };
        case 'signin':
            return { errorMessage: '', token: action.payload };
        default: 
            return state;
    }
}
// signup post
const signup = dispatch => async ({ email, password }) => {
    try {
        // get responsed
        const response = await CareLogAPI.post('/signup', { email, password });
        // save token at AsyncStorage
        //await AsyncStorage.setItem('token', response.data.token);
    } catch(err) {
        // add error
        dispatch({ type: 'add_error', payload: err.data.error });
    }
};

// signin post
const signin = (dispatch) => async ({ email, password }, callback) => {
    try {
        // get responsed
        const response = await CareLogAPI.post('/signin', { email, password });
        // save token at AsyncStorage
        //await AsyncStorage.setItem('token', response.data.token);
        dispatch({ type: 'signin', payload: response.data.token });

        if(callback) callback();
    } catch(err) {
        // add error
        dispatch({ type: 'add_error', payload: err.data.error });
    }
};

const signout = dispatch => {
    return () => {
        // Need to handle with it.
    };
};

export const { Provider, Context } = createDataContext(
    authReducer,
    { signin, signout, signup },
    { token: null, errorMessage: '' }
);