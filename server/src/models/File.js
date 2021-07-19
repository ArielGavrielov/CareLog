const mongoose = require('mongoose');

const File = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    path: {
        type: String,
        require: true
    },
    extension: {
        type: String,
        require: true
    }
}, {
    collection: 'files'
});

module.exports = mongoose.model('files', File);