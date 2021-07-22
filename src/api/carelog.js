import axios from 'axios';

export default axios.create({
    baseURL: 'https://carelog.herokuapp.com/api',
    timeout: 5000
});