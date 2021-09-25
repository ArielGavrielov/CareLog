import createDataContext from './createDataContext';
import { CareLogAPI } from '../API/CareLog';

const authReducer = (state, action) => {
    switch(action.type) {
        case 'restore_token':
            return {...state, token: action.payload, isLoading: false};
        case 'add_error': // if not responsed code 200;
            return { ...state, errorMessage: action.payload, message: '' };
        case 'signin':
            return { ...state, errorMessage: '', token: action.payload };
        case 'signout':
            return { ...state, errorMessage: '', token: null, isLoading: false };
        case 'clear_error_message':
            return {...state, errorMessage: '' };
        default: 
            return { isLoading: false, token: null, errorMessage: '' }
    }
}

// clear error message
const clearErrorMessage = dispatch => () => {
    dispatch({type: 'clear_error_message'});
}

// Automatic signin
const restoreToken = dispatch => async () => {
    try {
        // get token from local storage
        let token = localStorage.getItem('token');
        // check if token expired.
        if(Date.now() >= (JSON.parse(atob(token.split('.')[1]))).exp * 1000) {
            localStorage.clear();
            token = null;
        }
        dispatch({type: 'restore_token', payload: token});
    } catch(e){
       console.log("cant to get token...");
       dispatch({type: 'restore_token', payload: null});
    }
}

// signin post
const signin = (dispatch) => async ({ email, password }) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("signin");
            // get responsed
            const response = await CareLogAPI.post('/signin', { email, password });
            // save token at local storage
            console.log(response.data);
            localStorage.setItem('token', response.data.token);
            dispatch({ type: 'signin', payload: response.data.token });
            resolve(true);
        } catch(err) {
            // add error
            console.log(err);
            console.log(err.response.data.error);
            dispatch({ type: 'add_error', payload: err.response.data.error });
            reject(false);
        }
    });
};

// signout - remove token from securestore
const signout = dispatch => async () => {
    if(localStorage.getItem('token')) {
        localStorage.removeItem('token');
        window.location.reload();
    }
    dispatch({type: 'signout'});
};

export const { Provider, Context } = createDataContext(
    authReducer,
    { signin, signout, clearErrorMessage, restoreToken },
    { token: null, errorMessage: '', isLoading: true }
);