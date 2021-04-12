import createDataContext from './createDataContext';
import CareLogAPI from '../api/carelog';

const authReducer = (state, action) => {
    switch(action.type) {
        default: return state;
    }
}

const signup = dispatch => {
    return async ({ email, password }) => {
        try {
            const response = await CareLogAPI.post('/signup', { email, password });
            console.log(response.data);
        } catch(err) {
            console.log(err.data);
        }
    };
};

const signin = (dispatch) => {
    return async ({ email, password }) => {
        try {
            const response = await CareLogAPI.post('/signin', { email, password });
            console.log(response.data)
        } catch(err) {
            console.log(err.response.data);
        }
    };
};

const signout = dispatch => {
    return () => {

    };
};

export const { Provider, Context } = createDataContext(
    authReducer,
    { signin, signout, signup },
    { isSignedin: false }
);