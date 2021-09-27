const express = require('express');
const router = express.Router();
const resetToken = require("../../models/ResetPassToken");
const sendEmail = require("../../utils/sendMail");
const jwt = require('jsonwebtoken');
const requireAuth = require('../../middlewares/requireAuth');
const User = require('../../models/User');
const indices = require('./indices.route');
const medicines = require('./medicines.route');
const feeling = require('./feeling.route');
const events = require('./events.route');
const doctors = require('./doctors.route');

router.use('/indices', requireAuth, indices);
router.use('/medicines', requireAuth, medicines);
router.use('/feelings', requireAuth, feeling);
router.use('/events', requireAuth, events);
router.use('/doctors', requireAuth, doctors);

router.get('/', requireAuth, (req, res) => {
    const {password, _id, ...details} = req.user._doc;
    res.send(details);
});

// handle signup for new user
router.post('/signup', async (req, res) => {
    try {
        const { email, firstname, lastname, birthdate, password, phone } = req.body;
        if(!email || !password || !firstname || !lastname || !birthdate || !phone)
            throw {message: 'Form not filled.'}

        const oldUser = await User.findOne({$or: [{email: email}, {phone: phone}]});
        if(oldUser)
            throw({message: "User already exist. Please login"});
        
        const user = new User({ email, firstname, lastname, birthdate, password, phone });
        await user.save();
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.send({ token });
    } catch(err) {
        console.log(err);
        return res.status(422).send({code: 422, error: err.message});
    }
});

// handle sign in for user 
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password)
            throw {message: 'Email/Password not filled.'};

       const token = await User.login(email, password);
       console.log(token);
       res.send(token);
    } catch(err) {
        return res.status(422).send({ code: 422, error: err.message});
    }
});

router.post('/reset-password', async (req,res) => {
    try {
        const { email, birthdate } = req.body;
        if(!email || !birthdate) return res.status(422).send({ code: 422, error: 'You must fill all inputs.'});

        let user = await User.findOne({email, birthdate});
        if(!user) return res.status(422).send({code: 422, error: 'User not found.'});

        let token = await resetToken.findOne({userId: user._id});
        if(!token) {
            token = await resetToken.create({
                userId: user._id,
                token: Math.floor(Math.random()*99999) + 10000
            });
        }
        await sendEmail(email, "CareLog - Reset password", "The code for reset password is: " + token.token);

        return res.send({message: 'The code was sent, check your mail.', id: user._id});
    } catch(e) {
        return res.status(422).send({code: 422, error: 'Something went wrong with reset password'});
    }
});

router.get('/reset-password/:userId/:token', async (req,res) => {
    try {
        let token = await resetToken.findOne(req.params);
        if(!token) throw {tokenFound: false, message: 'token not found, please recheck.'};
        res.send({tokenFound: true, token: req.params.token});
    } catch(err) {
        console.log(err);
        res.status(422).send({error: err.message});
    }
});

router.post("/reset-password/:userId/:token", async (req, res) => {
    try {
        console.log(req.body.password);
        if(!req.body.password) return res.status(422).send({code: 422, error: 'You must specify new password'});
        let user = await User.findById(req.params.userId);
        if(!user) return res.status(422).send({code: 422, error: 'User not found'});

        let token = await resetToken.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if(!token) return res.status(400).send({code: 422, error: 'Invalid token or expired'});

        user.password = req.body.password;
        await user.save();
        await token.delete();
        console.log(user.password);
        res.send({message: 'Password reset sucessfully.', success: true});
    } catch(e) {
        res.status(422).send({code: 422, error: 'Something went wrong with reset password'});
        console.log(e);
    }
});

module.exports = router;