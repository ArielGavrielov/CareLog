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
            console.log(err);
            if(err.response)
                reject({error: true, message: err.response.data.error});
            else
                reject({error: true, message: 'Check your network connection.'});
        }
    });
};

//get user indice by type
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
            if(err.response)
                reject({error: true, message: err.response.data.error});
            else
                reject({error: true, message: 'Check your network connection.'});
        }
    });
}

// Medicines
// get Medicines
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
            if(err.response)
                reject({error: true, message: err.response.data.error});
            else
                reject({error: true, message: 'Check your network connection.'});
        }
    });
}

//user adds new medicine
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
            if(err.response)
                reject({error: true, message: err.response.data.error});
            else
                reject({error: true, message: 'Check your network connection.'});
        }
    });
}  

// user takes medicine 
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
            if(err.response)
                reject({error: true, message: err.response.data.error});
            else
                reject({error: true, message: 'Check your network connection.'});
        }
    });
}

// delete medicine for user by name 
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
            if(err.response)
                reject({error: true, message: err.response.data.error});
            else
                reject({error: true, message: 'Check your network connection.'});
        }
    });
}

// Feelings
//get user feeling by date
export const getFeeling = (date='') => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await CareLogAPI.get('/user/feelings/'+date,
            { headers: {
                'Authorization': 'Bearer ' + await SecureStore.getItemAsync('token')
            }});
            resolve(response.data);
        } catch(err) {
            console.log(err.response.data)
            if(err.response.data)
                reject({error: true, message: err.response.data.error});
            else
                reject({error: true, message: 'Check your network connection.'});
        }
    });
}
// post new feeling 
export const postFeeling = (feeling) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await CareLogAPI.post('/user/feelings/', {feeling: feeling},
            { headers: {
                'Authorization': 'Bearer ' + await SecureStore.getItemAsync('token')
            }});
            resolve(response.data);
        } catch(err) {
            console.log(err.response.data)
            if(err.response.data)
                reject({error: true, message: err.response.data.error});
            else
                reject({error: true, message: 'Check your network connection.'});
        }
    });
}

// Events
// Get user events
export const getEvents = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await CareLogAPI.get('/user/events/',
            { headers: {
                'Authorization': 'Bearer ' + await SecureStore.getItemAsync('token')
            }});
            resolve(response.data);
        } catch(err) {
            console.log(err.response.data);
            if(err.response.data)
                reject({error: true, message: err.response.data.error});
            else
                reject({error: true, message: 'Check your network connection.'});
        }
    });
}

export const postEvent = (event) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await CareLogAPI.post('/user/events/', event,
            { headers: {
                'Authorization': 'Bearer ' + await SecureStore.getItemAsync('token')
            }});
            resolve(response.data);
        } catch(err) {
            console.log(err.response.data);
            if(err.response.data)
                reject({error: true, message: err.response.data.error});
            else
                reject({error: true, message: 'Check your network connection.'});
        }
    });
}