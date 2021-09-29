const mongoose = require('mongoose');
const moment = require('moment');
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;

const eventSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    doctorId: {type: mongoose.Schema.Types.ObjectId, ref: 'doctors'},
    title: {
        type: String,
        required: true
    },
    body: {
        type: String
    },
    time: {
        type: String,
        required: true,
        validate: v => moment(v, 'Y-MM-DD HH:mm', true).isValid()
    },
    address: {
        type: String
    }
});

eventSchema.plugin(mongooseFieldEncryption, {
    fields: ['title', 'body', 'time', 'address'],
    secret: process.env.SECRET,
    saltGenerator: (secret) => secret.slice(0, 16)
});

const Event = mongoose.model('events', eventSchema);

module.exports = Event;