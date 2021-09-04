const mongoose = require('mongoose');
const moment = require('moment');

const Event = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
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

module.exports = mongoose.model('events', Event);