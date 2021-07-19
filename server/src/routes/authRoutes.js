const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const route = express.Router();

route.post('/signup', async (req, res) => {
    const { email, id, fname, lname, symptoms, birthdate, username, password, phone, disease } = req.body;
    try {
        const user = new User({ email, id, fname, lname, symptoms, birthdate, username, password, phone, disease });
        await user.save();
        const token = jwt.sign({ userId: user._id }, 'kvruAGAPYFCXD3qzNFdWCUdewFYH0ZnC');
        res.send({ token });
    } catch(err) {
        return res.status(422).send({code: 422, error: err.message});
    }
});

route.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password) return res.status(422).send({ code: 422, error: 'Email/Password not filled.'});

    const user = await User.findOne({email});
    console.log("user", user);
    if(!user) return res.status(422).send({ code: 422, error: 'Invalid email'});
    try {
        await user.comparePassword(password);
        const token = jwt.sign({ userId: user._id }, 'kvruAGAPYFCXD3qzNFdWCUdewFYH0ZnC');
        res.send({ token });
    } catch(err) {
        return res.status(422).send({ code: 422, error: 'Invalid password' });
    }
});

module.exports = route;