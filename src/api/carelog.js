import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const CareLogAPI = axios.create({
    baseURL: 'https://carelog.herokuapp.com/api/',
    timeout: 5000
});

export const postIndices = async (type, value) => {
    try {
        const response = await CareLogAPI.post('/user/indices/' + type, value,
        {headers: {
                'Authorization': 'Bearer ' + await SecureStore.getItemAsync('token')
        }});
        console.log(response.data);
    } catch(err) {
        console.log(err.message);
    }
};

export const updateUserData = async () => {
    try {
        const response = await CareLogAPI.get('/user/', 
        {headers: {
            'Authorization': 'Bearer ' + await SecureStore.getItemAsync('token')
        }})
        console.log(response.data);
    } catch(err) {
        console.log(err.message);
    }
}