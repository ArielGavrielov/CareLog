const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Doctor = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        validate: /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([\t]*\r\n)?[\t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([\t]*\r\n)?[\t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i
    },
    firstname: {
        type: String,
        required: true,
        validate: /^(?=.{2,20}$)[a-zA-Z]+(?:[-'\s][a-zA-Z]{2,20})*$/
    },
    lastname: {
        type: String,
        required: true,
        validate: /^(?=.{2,20}$)[a-zA-Z]+(?:[-'\s][a-zA-Z]{2,20})*$/
    },
    address: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        validate: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/
    },
    phone: {
        type: String,
        unique: true,
        validate: /^\+?(972|0)(\-)?0?([5]{1}[0-9]{1}\d{7})$/
    },
    workDay: [{
        date: {
            type: String,
            unique: true
        },
        meetings: [mongoose.Schema({
            userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            time: {
                type: String,
                unique: true
            }
        })]
    }],
    startWorkTime: {
        type: String,
        default: '08:00'
    },
    endWorkTime: {
        type: String,
        default: '21:00'
    },
    breakTime: {
        type: Array,
        default: ['13:00', '14:00']
    },
    patients: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

Doctor.pre('save', function(next) {
    if(!this.isModified('password')) return next();

    bcrypt.genSalt(10, (err, salt) => {
        if(err) return next(err);

        bcrypt.hash(this.password, salt, (err, hash) => {
            if(err) return next(err);

            this.password = hash;
            next();
        });
    });
});

Doctor.methods.comparePassword = function comparePassword(candidatePassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, this.password, (err, isSame) => {
            if(err || !isSame) return reject({message: 'Login failed'});

            resolve(true);
        });
    });
}

module.exports = mongoose.model('doctors', Doctor);