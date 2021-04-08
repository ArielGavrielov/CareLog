const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const route = express.Router();

route.post('/signup', async (req, res) => {
    const { email, id, fname, lname, symptoms, birthdate, username, password, phone, disease } = req.body;
    try {
        const user = new User({ email, id, fname, lname, symptoms, birthdate, username, password, phone, disease });
        await user.save();
        res.send(req.body);
    } catch(err) {
        return res.status(422).send({code: 422, error: err.message});
    }
});

module.exports = route;