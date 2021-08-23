import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const CareLogAPI = axios.create({
    baseURL: 'https://carelog.herokuapp.com/api/',
    timeout: 10000
});

// Indices
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

// Medicines
export const getMedicines = async () => {
    try {
        const response = await CareLogAPI.get('/user/medicines/',
        { headers: {
            'Authorization': 'Bearer ' + await SecureStore.getItemAsync('token')
        }});
        console.log(response.data);
        return response.data;
    } catch(err) {
        console.log(err)
        return {error: true, message: err.message};
    }
}
export const postMedicine = async (props) => {
    try {
        const response = await CareLogAPI.post('/user/medicines/', props,
        { headers: {
            'Authorization': 'Bearer ' + await SecureStore.getItemAsync('token')
        }});
        return response.data;
    } catch(err) {
        console.log(err)
        return {error: true, message: err.message};
    }
} 
export const takeMedicine = async (name) => {
    try {
        console.log(name);
        const response = await CareLogAPI.put('/user/medicines/take/'+name, null,
        { headers: {
            'Authorization': 'Bearer ' + await SecureStore.getItemAsync('token')
        }});
        return response.data;
    } catch(err) {
        console.log(err.response.data)
        return {error: true, message: err.response.data.error};
    }
}