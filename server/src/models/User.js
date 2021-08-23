const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const moment = require('moment')

const arrayLimit = (props) => {
    console.log(props);
    return props.length < 3;
}

const userSchema = new mongoose.Schema({
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
    birthdate: {
        type: String,
        required: true,
        validate: [(value) => {
            return !Number.isNaN(Date.parse(value));
        }, 'is invalid.']
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
    indices: {
        blood: [{
            time: {
                type: String,
                default: new Date().toUTCString()
            },
            systolic: {
                type: Number
            },
            diastolic: {
                type: Number
            }
        }],
        pulse: [{
            time: {
                type: String,
                default: new Date().toUTCString()
            },
            pulse: {
                type: Number
            }
        }],
        bodyheat: [{
            time: {
                type: String,
                default: new Date().toUTCString()
            },
            bodyheat: {
                type: Number,
            }
        }],
        oxygen: [{
            time: {
                type: String,
                default: new Date().toUTCString()
            },
            oxygen: {
                type: Number,
            }
        }]
    },
    medicines: [ mongoose.Schema({
        medicineRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'medicines'
        },
        quantity: {
            type: Number,
            required: true
        },
        dosageamount: {
            type: Number,
            required: true
        },
        times: [{
            type: String,
            required: true
        }],
        taken: [{
            date: {
                type: String,
            },
            time: [{
                type: String
            }],
        }]
    }, { _id : false })]
});

userSchema.pre('save', function(next) {
    const user = this;
    console.log("IS???");
    if(!user.isModified('password')) return next();

    bcrypt.genSalt(10, (err, salt) => {
        if(err) return next(err);

        bcrypt.hash(user.password, salt, (err, hash) => {
            if(err) return next(err);

            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, this.password, (err, isSame) => {
            if(err) return reject(err);
            if(!isSame) return reject(false);

            resolve(true);
        });
    });
}

module.exports = mongoose.model('User', userSchema);