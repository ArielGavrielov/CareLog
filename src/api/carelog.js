import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const DEBUG = true;

export const CareLogAPI = axios.create({
    baseURL: DEBUG ? 'http://localhost:3000/api/' : 'https://carelog.herokuapp.com/api/',
    timeout: 10000
});

// Indices
export const postIndices = (type, value) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await CareLogAPI.post('/user/indices/' + type, value,
            { headers: {
                    'Authorization': 'Bearer ' + await SecureStore.getItemAsync('token')
            }});
            resolve({error: false, message: response.data.message});
        } catch(err) {
            reject({error: true, message: err.response.data.error});
        }
    });
};

export const getIndice = (type='') => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await CareLogAPI.get('/user/indices/statistic/' + type,
            { headers: {
                    'Authorization': 'Bearer ' + await SecureStore.getItemAsync('token')
            }});
            resolve(response.data);
        } catch(err) {
            console.log(err)
            reject({error: true, message: err.response.data.error});
        }
    });
}

// Medicines
export const getMedicines = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await CareLogAPI.get('/user/medicines/',
            { headers: {
                'Authorization': 'Bearer ' + await SecureStore.getItemAsync('token')
            }});
            resolve(response.data);
        } catch(err) {
            console.log(err)
            reject({error: true, message: err.response.data.error});
        }
    });
}
export const postMedicine = (props) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await CareLogAPI.post('/user/medicines/', props,
            { headers: {
                'Authorization': 'Bearer ' + await SecureStore.getItemAsync('token')
            }});
            resolve(response.data);
        } catch(err) {
            console.log(err)
            reject({error: true, message: err.response.data.error});
        }
    });
} 
export const takeMedicine = (name) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await CareLogAPI.put('/user/medicines/take/'+name, null,
            { headers: {
                'Authorization': 'Bearer ' + await SecureStore.getItemAsync('token')
            }});
            resolve(response.data);
        } catch(err) {
            console.log(err.response.data)
            reject({error: true, message: err.response.data.error});
        }
    });
}

export const deleteMedicine = (name) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await CareLogAPI.delete('/user/medicines/'+name,
            { headers: {
                'Authorization': 'Bearer ' + await SecureStore.getItemAsync('token')
            }});
            resolve(response.data);
        } catch(err) {
            console.log(err.response.data)
            reject({error: true, message: err.response.data.error});
        }
    });
}