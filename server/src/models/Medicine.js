const mongoose = require('mongoose');

const Medicine = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
}, {
    collection: 'medicines'
});

module.exports = mongoose.model('medicines', Medicine);