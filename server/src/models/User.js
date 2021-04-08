const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        require: true
    },
    id: {
        type: String,
        unique: true,
        require: true
    },
    fname: {
        type: String,
        require: true
    },
    lname: {
        type: String,
        require: true
    },
    symptoms: {
        type: Array,
        require: true
    },
    birthdate: {
        type: Date,
        require: true
    },
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        unique: true
    },
    disease: {
        type: String
    }
});

mongoose.model('User', userSchema);