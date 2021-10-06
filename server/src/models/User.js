const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const moment = require('moment');
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;
const jwt = require('jsonwebtoken');

const nowUTC = () => {
    return moment.utc().format('Y-MM-DD HH:mm:ss');
}

var userSchema = new mongoose.Schema({
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
    createDate: {
        type: String,
        default: () => moment.utc().format('Y-MM-DD')
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        unique: true,
        validate: /^\+?(972|0)(\-)?0?([5]{1}[0-9]{1}\d{7})$/
    },
    indices: mongoose.Schema({
        blood: [mongoose.Schema({
            time: {
                type: String,
                default: () => nowUTC()
            },
            systolic: {
                type: Number
            },
            diastolic: {
                type: Number
            }
        }, { _id : false })],
        pulse: [mongoose.Schema({
            time: {
                type: String,
                default: () => nowUTC()
            },
            pulse: {
                type: Number
            }
        }, { _id : false })],
        bodyheat: [mongoose.Schema({
            time: {
                type: String,
                default: () => nowUTC()
            },
            bodyheat: {
                type: Number,
            }
        }, { _id : false })],
        oxygen: [mongoose.Schema({
            time: {
                type: String,
                default: () => nowUTC()
            },
            oxygen: {
                type: Number,
            }
        }, { _id : false })]
    }, { _id : false }),
    medicines: [ mongoose.Schema({
        medicineRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'medicines'
        },
        startDate: {
            type: String,
            default: () => moment.utc().format('Y-MM-DD')
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
    }, { _id : false })],
    feelings: [{
        date: {
            type: String,
            default: () => moment.utc().format('Y-MM-DD')
        },
        lastChange: {
            type: String,
            default: () => moment.utc().format('HH:mm:ss')
        },
        feeling: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        reason: {
            type: String
        }
    }],
    doctors: [{
        doctorRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'doctors'
        },
        dateAdded: {
            type: String,
            default: () => nowUTC()
        },
        lastVisit: {
            type: String
        }
    }],
    dailySteps: [{
        date: {
            type: String,
            default: () => moment.utc().format('Y-MM-DD')
        },
        lastChange: {
            type: String,
            default: () => moment.utc().format('HH:mm:ss')
        },
        steps: {
            type: Number,
            require: true
        }
    }],
    notificationToken: String
}, {
    collection: 'users'
});

userSchema.pre('validate', function(next) {
    const user = this;
    
    if(!user.isModified('password')) return next();

    if(!user.password.match(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,16}$/))
        return next({message: 'Invalid password'});
    next();
});

userSchema.post('validate', function(res, next) {
    if(!res.phone.startsWith('972')) {
        res.phone = res.phone.replace('0', '972');
    }

    res.email = res.email.toLowerCase();
    next();
})

userSchema.pre('save', function(next) {
    const user = this;

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

userSchema.statics.login = function login(decryptEmail, password) {
    return new Promise(async (resolve, reject) => {
        decryptEmail = decryptEmail.toLowerCase();
        // create user object with decrypted email.
        const userToSearch = new User({email: decryptEmail});
        // encrypt email field.
        userToSearch.encryptFieldsSync();
        // search with encrypted email
        const user = await User.findOne({email: userToSearch.email});
        
        if(!user) reject({message: 'User not found'});
        console.log(user);
        try {
            const isValidPassword = await user.comparePassword(password);
            if(isValidPassword) {
                const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
                resolve({ token });
            }
        } catch(err) {
            reject(err);
        }
    });
}

userSchema.statics.findBy = function findBy(obj) {
    return new Promise(async (resolve, reject) => {
        const schemaKeys = Object.keys(User.schema.tree).filter((key) => !key.startsWith('__enc'));
        const searchKeys = Object.keys(obj);
        searchKeys.map((key) => {
            if(!schemaKeys.includes(key))
                reject({message: `key ${key} not found.`});
        });
        // create user object with decrypted fields.
        const userToSearch = new User(obj);
        // encrypt fields.
        userToSearch.encryptFieldsSync();

        searchKeys.map((key) => {
            obj[key] = userToSearch[key];
        });
        // search with encrypted fields
        resolve(User.findOne(obj));
    });
}

userSchema.statics.findByEmail = function findByEmail(decryptEmail) {
    return new Promise(async (resolve, reject) => {
        // create user object with decrypted email.
        const userToSearch = new User({email: decryptEmail});
        // encrypt email field.
        userToSearch.encryptFieldsSync();
        // search with encrypted email
        resolve(User.findOne({email: userToSearch.email}));
    });
}

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, this.password, (err, isSame) => {
            if(err || !isSame) return reject({message: 'Invalid password'});
            resolve(true);
        });
    });
}

userSchema.plugin(mongooseFieldEncryption, {
    fields: ['phone', 'email', 'birthdate', 'firstname', 'lastname', 'createDate', 'feelings', 'indices', 'medicines', 'doctors', 'dailySteps', 'notificationToken'],
    secret: process.env.SECRET,
    saltGenerator: (secret) => secret.slice(0, 16)
});

const User = mongoose.model('User', userSchema);
module.exports = User;