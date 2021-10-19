import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Pedometer } from 'expo-sensors';
import moment from 'moment';

const DEBUG = false;

export const CareLogAPI = axios.create({
    baseURL: DEBUG && __DEV__ ? 'http://192.168.1;.10:3001/api/' : 'https://carelog.herokuapp.com/api/',
    timeout: 10000
});

CareLogAPI.interceptors.request.use(async (config) => {
    let token = await SecureStore.getItemAsync('token');
    config.headers.Authorization = token;
    return config;
});

// Indices
// post indice by type
export const postIndices = (type, value) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await CareLogAPI.post('/user/indices/' + type, value);
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
            const response = await CareLogAPI.get('/user/indices/statistic/' + type);
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
            const response = await CareLogAPI.get('/user/medicines/');
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
            const response = await CareLogAPI.post('/user/medicines/', props);
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
            const response = await CareLogAPI.put('/user/medicines/take/' + name, null);
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
            const response = await CareLogAPI.delete('/user/medicines/' + name);
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
            const response = await CareLogAPI.get('/user/feelings/' + date);
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
export const postFeeling = (feeling, reason=null) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(reason);
            let response;
            if(!reason) {
                console.log('no reason');
                response = await CareLogAPI.post('/user/feelings/', {feeling: feeling});
            }
            else {
                console.log('reason');
                response = await CareLogAPI.post('/user/feelings/', {feeling, reason});
            }
            resolve(response.data);
        } catch(err) {
            console.log('error');
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
            const response = await CareLogAPI.get('/user/events/');
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
            const response = await CareLogAPI.post(`/user/events/${event.id ? event.id : ''}`, event);
            resolve(response.data);
        } catch(err) {
            console.log(err.response.data);
            if(err.response.data)
                reject({error: err.response.data.error});
            else
                reject({error: 'Check your network connection.'});
        }
    });
}

export const deleteEvent = (eventId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await CareLogAPI.delete(`/user/events/${eventId}`);
            resolve(response.data);
        } catch(err) {
            console.log(err.response.data);
            if(err.response.data)
                reject({error: err.response.data.error});
            else
                reject({error: 'Check your network connection.'});
        }
    });
}

// Meetings with doctors
export const getDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(CareLogAPI);
            const response = await CareLogAPI.get('/user/doctors/');
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

export const getFreetimeOfDoctor = ({doctorId, date}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await CareLogAPI.post(`/user/doctors/${doctorId}/freetime/`, {date});
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

export const postNewMeeting = (doctorId, body) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await CareLogAPI.post(`/user/doctors/${doctorId}/new-meeting/`, body);
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

// Daily Progresses
// fetch steps
const stepsFetch = async () => {
    try {
        let isAvailable = await Pedometer.isAvailableAsync();
        console.log('isAvailable', isAvailable);
        if(!isAvailable) return null;

        let permissionStatus = await Pedometer.getPermissionsAsync();
        console.log(permissionStatus);
        switch(permissionStatus) {
            case Pedometer.PermissionStatus.UNDETERMINED: 
                let request = await Pedometer.requestPermissionsAsync();
                if(!request.granted) return null;
                break;
            case Pedometer.PermissionStatus.DENIED: return null;
        }
        const start = moment().utc().startOf('day').toDate();
        const end = moment().utc().endOf('day').toDate();
        console.log(start,end);
        const stepsFetched = await Pedometer.getStepCountAsync(start, end);
        console.log("stepsFetched", stepsFetched);
        return {steps: stepsFetched.steps};
    } catch(err) {
        console.log(err);
    }
  }
// post steps from user device
export const postSteps = () => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("post steps");
            let steps = await stepsFetch();
            if(!steps) return resolve(null);
            const response = await CareLogAPI.post(`/user/daily/update-steps`, steps);
            console.log(DEBUG, __DEV__, response.data);
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

// get all progresses data
export const getDailyProgresses = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await CareLogAPI.get(`/user/daily/`);
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