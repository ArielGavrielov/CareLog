const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const doctorRequireAuth = require('../../middlewares/doctorRequireAuth');
const Doctor = require('../../models/Doctor');
const patients = require('./patients.route');
const meetings = require('./meetings.route');
const moment = require('moment');

router.use('/', doctorRequireAuth, patients);
router.use('/meetings', doctorRequireAuth, meetings);
router.get('/', (req,res) => {
    res.send("API works!");
})

// handle sign in for doctor 
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) throw({message: 'Email/Password not filled.'});

        const token = await Doctor.login(email,password);
        console.log(token);
        res.send(token);
    } catch(err) {
        return res.status(422).send({ code: 422, error: err.message });
    }
});

// create account for new doctor
router.post('/create-doctor-account', async (req, res) => {
    try {
        const { email, firstname, lastname, password, phone, address } = req.body;
        if(!email || !password || !firstname || !lastname || !phone)
            throw({message: 'Form not filled.'});

        const oldDoctor = await Doctor.findOne({$or: [{email: email}, {phone: phone}]});
        if(oldDoctor)
            throw({message: "Doctor already exist. Please login"});
        
        const doctor = new Doctor({ email, firstname, lastname, password, phone, address });
        await doctor.save();
        const token = jwt.sign({ doctorId: doctor._id }, process.env.JWT_SECRET, { expiresIn: '1 day' });
        res.send({ token });
    } catch(err) {
        console.log(err.message);
        return res.status(422).send({code: 422, error: err.message});
    }
});

// update work time
router.put('/update-worktime', doctorRequireAuth, async (req,res) => {
    try {
        let newTime = {
            startWorkTime: moment.utc(req.body.startWorkTime, 'HH:mm', true),
            endWorkTime: moment.utc(req.body.endWorkTime, 'HH:mm', true)
        }
        if(!newTime.startWorkTime.isValid() || !newTime.endWorkTime.isValid())
            throw {message: 'Invalid times'};
    
        req.doctor.startWorkTime = newTime.startWorkTime.format('HH:mm');
        req.doctor.endWorkTime = newTime.endWorkTime.format('HH:mm');
        await req.doctor.save();
        res.send({message: 'Work times changed success.'});
    } catch(err) {
        console.log(err.message);
        return res.status(422).send({code: 422, error: err.message});
    }
});

module.exports = router;