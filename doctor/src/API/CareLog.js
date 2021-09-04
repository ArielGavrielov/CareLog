import axios from 'axios';

const DEBUG = true;

export const CareLogAPI = axios.create({
    baseURL: DEBUG ? 'http://localhost:3001/api/' : 'https://carelog.herokuapp.com/api/',
    timeout: 10000,
    headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
});