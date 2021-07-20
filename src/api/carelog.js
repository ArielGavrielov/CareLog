import axios from 'axios';

export default axios.create({
    baseURL: 'https://carelog.herokuapp.com'
});