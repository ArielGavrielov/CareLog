const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const doctorRequireAuth = require('../../middlewares/doctorRequireAuth');
const Doctor = require('../../models/Doctor');
const User = require('../../models/User');

router.get('/', (req,res) => {
    res.send("API works!");
})

// handle sign in for doctor 
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) throw({message: 'Email/Password not filled.'});

        const doctor = await Doctor.findOne({email});
        if(!doctor) throw({message: 'Invalid email'});

        await doctor.comparePassword(password);
        const token = jwt.sign({ doctorId: doctor._id }, process.env.TOKEN_SECRET, { expiresIn: '1 day' });
        res.send({ token });
    } catch(err) {
        return res.status(422).send({ code: 422, error: err.message });
    }
});

// create account for new doctor
router.post('/create-doctor-account', async (req, res) => {
    try {
        const { email, firstname, lastname, password, phone } = req.body;
        if(!email || !password || !firstname || !lastname || !phone)
            throw({message: 'Form not filled.'});

        const oldDoctor = await Doctor.findOne({$or: [{email: email}, {phone: phone}]});
        if(oldDoctor)
            throw({message: "Doctor already exist. Please login"});
        
        const doctor = new Doctor({ email, firstname, lastname, password, phone });
        await doctor.save();
        const token = jwt.sign({ doctorId: doctor._id }, process.env.TOKEN_SECRET, { expiresIn: '1 day' });
        res.send({ token });
    } catch(err) {
        console.log(err.message);
        return res.status(422).send({code: 422, error: err.message});
    }
});

router.post('/link-patient', doctorRequireAuth, async (req,res) => {
    try {
        if(!req.body.email || !req.body.phone) throw {message: 'Form unfilled.'};

        let user = await User.findOne({email: req.body.email, phone: req.body.phone});
        if(!user) throw {message: 'User not found.'};

        if(req.doctor.patients.includes(user._id)) throw {message: 'User already linked.'};
        console.log(req.doctor);
        Doctor.updateOne({_id: req.doctor._id}, {$addToSet: {"patients": user._id}}, (err,data) => {
            if(err) console.log(err);
            else res.send({message: 'Added successfully.'});
            console.log(data);
        });
    } catch(err) {
        console.log(err.message);
        res.status(422).send({code: 422, error: err.message});
    }
});

router.get('/patients', doctorRequireAuth, async (req,res) => {
    console.log(`start at ${new Date()}`);
    let doctor = await Doctor.findById(req.doctor._id).lean().populate('patients', '-indices');
    console.log(`end at ${new Date()}`);
    res.send(doctor.patients);
});

// get patient details;
router.get('/patient/:id', doctorRequireAuth, async (req,res) => {
    try {
        // if id param isnt a valid mongodb objectid
        if(!require('mongoose').Types.ObjectId.isValid(req.params.id))
            throw {message: `${req.params.id} isn't a user id`}

        // if patient isnt at doctor patients array
        if(!req.doctor.patients.includes(req.params.id))
            throw {message: 'patient not found'};
        
        let patientDetails = await User.findById(req.params.id);

        // if patient user scheme not found
        if(!patientDetails)
            throw {message: 'User not found.'};

        res.send(patientDetails);
    } catch(err) {
        console.log(err);
        res.status(422).send({error: err.message});
    }
});

module.exports = router;