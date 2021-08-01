const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const user = require('./userRoutes/user.route');

const route = express.Router();

route.use('/user', user);

module.exports = route;