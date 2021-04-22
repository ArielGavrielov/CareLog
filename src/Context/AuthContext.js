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
const signup = dispatch => async ({email, password, first_name, last_name, birthdate, phone}) => {
    try {
        console.log({email, password, first_name, last_name, birthdate, phone});
        // get responsed
        const response = await CareLogAPI.post('/signup', {email, password, first_name, last_name, birthdate, phone});
        //console.log(response.data);
        // save token at AsyncStorage
        //await AsyncStorage.setItem('token', response.data.token);
    } catch(err) {
        // add error
        dispatch({ type: 'add_error', payload: err.data.error });
        //console.log(err);
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
        console.log("token", response.data.token);
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