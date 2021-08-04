import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const CareLogAPI = axios.create({
    baseURL: 'https://carelog.herokuapp.com/api/',
    timeout: 5000
});

export const postIndices = async (type, value) => {
    try {
        const response = await CareLogAPI.post('/user/indices/' + type, value,
        { headers: {
                'Authorization': 'Bearer ' + await SecureStore.getItemAsync('token')
        }});
        return {error: false, message: response.data.message};
    } catch(err) {
        return {error: true, message: err.message};
    }
};

export const getIndice = async (type='') => {
    try {
        const response = await CareLogAPI.get('/user/indices/statistic/' + type,
        { headers: {
                'Authorization': 'Bearer ' + await SecureStore.getItemAsync('token')
        }});
        return response.data;
    } catch(err) {
        console.log(err)
        return {error: true, message: err.message};
    }
}