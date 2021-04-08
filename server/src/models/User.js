const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, this.password, (err, isSame) => {
            if(err) return reject(err);
            if(!isSame) return reject(false);

            resolve(true);
        });
    });
}

mongoose.model('User', userSchema);