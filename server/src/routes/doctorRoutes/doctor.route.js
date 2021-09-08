const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const doctorRequireAuth = require('../../middlewares/doctorRequireAuth');
const Doctor = require('../../models/Doctor');
const User = require('../../models/User');
const moment = require('moment');

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
    let doctor = await Doctor.findById(req.doctor._id).lean().populate('patients', '_id firstname lastname phone birthdate email');
    console.log(`end at ${new Date()}`);
    res.send(doctor.patients);
});

// get patient details;
/*
** get details about patient indices 
* Normal indices:
* Pulse Rate: 60-100
* Blood pressure: less than 120/80
* Oxygen saturation: 95% or higher
* Bodyheat: 36-37-9
*/
const patientIndicesLastMonth = (patientIndices) => {
    let comments = {
        pulse: [],
        blood: [],
        oxygen: [],
        bodyheat: []
    };

    let normalIndices = {
        pulse: {
            min: 60,
            max: 100
        },
        blood: {
            systolicMax: 120,
            diastolicMax: 80
        },
        oxygen: {
            min: 95,
            max: 100
        },
        bodyheat: {
            min: 36,
            max: 37.9
        }
    }

    let indicesTypes = Object.keys(patientIndices);

    indicesTypes.map((indiceType) => {
        let startMoment = moment().subtract(1, 'months').subtract(1, 'day');

        let lastMonthIndice = patientIndices[indiceType].filter((e) =>
            new Date(e.time) >= startMoment.toDate()
        );
        lastMonthIndice.sort((a,b) => new Date(a.time) > new Date(b.time));
        console.log(lastMonthIndice);

        let dateIterator = moment({format: 'Y-MM-DD'}).subtract(1, 'months');
        let missingDays = moment().diff(moment().subtract(1, 'months'), 'days');

        lastMonthIndice.map((indice) => {
            if(!dateIterator.isSame(indice.time, 'day')) {
                missingDays--;
                dateIterator = moment(indice.time, 'Y-MM-DD');
            }
            
            if(indiceType == 'blood' &&
            (indice.systolic > normalIndices.blood.systolicMax || indice.diastolic > normalIndices.blood.diastolicMax)) {
                comments.blood.push(`${indice.time} - abnormal indice (${indice.systolic}/${indice.diastolic} mmHg)`);
            } else if(indice[indiceType] < normalIndices[indiceType].min || indice[indiceType] > normalIndices[indiceType].max){
                comments[indiceType].push(`${indice.time} - abnormal indice (${indice[indiceType]})`);
            }
        });
        if(missingDays > 0)
            comments[indiceType].push(`Missing indices in ${missingDays} days.`);
        console.log(missingDays);
    });

    return comments;
}

// get details about patient feeling
const patientBadFeelingLastMonth = (patientFeelings) => {
    let startMoment = moment().subtract(1, 'months').subtract(1, 'day');
    let lastMonthBadFeelings = patientFeelings.filter((e) =>
        new Date(e.date) >= startMoment.toDate() && e.feeling < 3
    );
    lastMonthBadFeelings.sort((a,b) => new Date(a.date) > new Date(b.date));

    return lastMonthBadFeelings;
}

// get comments for medicines
const patientMedicinesComments = (patientMedicines) => {
    const comments = {};
    let startMoment = moment().subtract(1, 'months').subtract(1, 'day');
    patientMedicines.map((medicine) => {
        if(medicine.quantity < medicine.dosageamount * medicine.times.length * 2) {
            if(!comments[medicine.medicineRef.name]) comments[medicine.medicineRef.name] = [];
            comments[medicine.medicineRef.name].push(`Need to restock, there is ${medicine.quantity} left and the patient need taking the drug ${medicine.dosageamount * medicine.times.length} per day.`)
        }

        let missingDays = moment().diff(moment().subtract(1, 'months'), 'days');

        let medicineLastMonthTaken = medicine.taken.filter((e) => new Date(e.date) >= startMoment.toDate())
        medicineLastMonthTaken.map((taken) => {
            missingDays--;
            let missedTimes = medicine.times.length-taken.time.length;
            if(missedTimes > 0) {
                if(!comments[medicine.medicineRef.name]) comments[medicine.medicineRef.name] = [];
                comments[medicine.medicineRef.name].push(`${taken.date} - Missed ${missedTimes} ${missedTimes > 1 ? 'times' : 'time'}`);
            }
        })
        if(missingDays > 0) {
            if(!comments[medicine.medicineRef.name]) comments[medicine.medicineRef.name] = [];
            comments[medicine.medicineRef.name].push(`The patient have missing up ${missingDays} whole days of taking the drug!`)
        } 
    });

    return comments;
}
router.get('/patient/:id', doctorRequireAuth, async (req,res) => {
    try {
        // if id param isnt a valid mongodb objectid
        if(!require('mongoose').Types.ObjectId.isValid(req.params.id))
            throw {message: `${req.params.id} isn't a user id`}

        // if patient isnt at doctor patients array
        if(!req.doctor.patients.includes(req.params.id))
            throw {message: 'patient not found'};
        
        let patientDetails = await User.findById(req.params.id).populate('medicines.medicineRef');

        // if patient user scheme not found
        if(!patientDetails)
            throw {message: 'User not found.'};

        res.send({...patientDetails.toJSON(),
            indices: patientIndicesLastMonth(patientDetails.indices.toJSON()),
            feelings: patientBadFeelingLastMonth(patientDetails.feelings),
            medicines: patientMedicinesComments(patientDetails.medicines)
        });
    } catch(err) {
        console.log(err);
        res.status(422).send({error: err.message});
    }
});

module.exports = router;