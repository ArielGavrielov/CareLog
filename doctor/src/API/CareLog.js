import axios from 'axios';

const DEBUG = true;

export const CareLogAPI = axios.create({
    baseURL: DEBUG ? 'http://localhost:3001/api/' : 'https://carelog.herokuapp.com/api/',
    timeout: 10000,
    //headers: {'Authorization': `Bearer ${window.localStorage.getItem('token')}`}
});

// Add a request interceptor
CareLogAPI.interceptors.request.use(function (config) {
    let token = localStorage.getItem('token');
    config.headers.Authorization =  token;

    return config;
});

CareLogAPI.interceptors.response.use((response) => {
    return response;
}, (error) => {
    let token = localStorage.getItem('token');
    if(error.response.status === 401 && token) {
        // Token expire, back to login
        localStorage.removeItem('token');

        return Promise.reject("Token expired.").finally(() => {
            window.location.reload();
            alert('Token expired.');
        });
    } else
        return Promise.reject(error);
});