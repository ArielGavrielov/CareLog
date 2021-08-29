const express = require('express');
const user = require('./userRoutes/user.route');
const doctor = require('./doctorRoutes/doctor.route');

const route = express.Router();

route.use('/user', user);
route.use('/doctor', doctor);

module.exports = route;