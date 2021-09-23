const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const doctorRequireAuth = require('../../middlewares/doctorRequireAuth');
const Doctor = require('../../models/Doctor');
const User = require('../../models/User');
const moment = require('moment');
const sendEmail = require("../../utils/sendMail");
const meetings = require('./meetings.route');


router.use('/meetings', doctorRequireAuth, meetings);
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

        let isInDoctors = user.doctors.filter((e) => e.doctorRef.equals(req.doctor._id)).length > 0;
        let isInPatients = req.doctor.patients.includes(user._id);

        if(isInPatients && isInDoctors) 
            throw {message: 'User already linked.'};

        let addPatient = null, addDoctor = null;
        if(!isInPatients)
            addPatient = await Doctor.updateOne({_id: req.doctor._id}, {$addToSet: {"patients": user._id}});
        if(!isInDoctors)
            addDoctor = await User.updateOne({_id: user._id}, {$addToSet: {'doctors': {doctorRef: req.doctor._id}}})

        if((addPatient && addPatient.nModified === 1) || (addDoctor && addDoctor.nModified === 1)) {
            res.send({message: 'Added successfully.'});
            sendEmail(user.email, "CareLog - Doctor linking", `Dr. ${req.doctor.firstname} ${req.doctor.lastname} has linked your account to doctor system.`);
        } else
            throw {message: 'Unknown error.'};
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
const patientIndicesLastMonth = (patient) => {
    patientIndices = patient.indices;
    if(patientIndices)
        patientIndices = patientIndices.toJSON();

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

    let indicesTypes = Object.keys(normalIndices);

    let startMoment = moment().subtract(1, 'months');
    if(moment(patient.createDate).isAfter(startMoment))
        startMoment = moment(patient.createDate);
    
    indicesTypes.map((indiceType) => {
        let missingDays = moment().diff(startMoment, 'days');

        if(patientIndices && patientIndices[indiceType]) {
            let lastMonthIndice = patientIndices[indiceType].filter((e) =>
                new Date(e.time) >= startMoment.toDate()
            );
            let dateIterator = moment.utc({format: 'Y-MM-DD'}).subtract(1, 'months');

            lastMonthIndice.sort((a,b) => new Date(a.time) > new Date(b.time));

            lastMonthIndice.map((indice) => {
                if(!dateIterator.isSame(indice.time, 'day')) {
                    missingDays--;
                    dateIterator = moment(indice.time, 'Y-MM-DD');
                }
                indice.time = moment.utc(indice.time).local().format('Y-MM-DD HH:mm:ss');
                
                if(indiceType == 'blood' &&
                (indice.systolic > normalIndices.blood.systolicMax || indice.diastolic > normalIndices.blood.diastolicMax)) {
                    comments.blood.push(`${indice.time} - abnormal indice (${indice.systolic}/${indice.diastolic} mmHg)`);
                } else if(indice[indiceType] < normalIndices[indiceType].min || indice[indiceType] > normalIndices[indiceType].max){
                    comments[indiceType].push(`${indice.time} - abnormal indice (${indice[indiceType]})`);
                }
            });
        }
        
        if(missingDays > 0)
            comments[indiceType].push(`Missing indices in ${missingDays} ${missingDays == 1 ? 'day' : 'days'}.`);
    });

    return comments;
}

// get details about patient feeling
const patientBadFeelingLastMonth = (patient) => {
    let patientFeelings = patient.feelings;
    let comments = [];
    let startMoment = moment().subtract(1, 'months');
    if(moment(patient.createDate).isAfter(startMoment))
        startMoment = moment(patient.createDate);
    
    let lastMonthBadFeelings = patientFeelings.filter((e) =>
        moment(e.date).toDate() >= startMoment.toDate()
    );

    let missingDays = moment().diff(startMoment, 'days') - lastMonthBadFeelings.length;
    if(missingDays > 0) comments.push(`Patient does'nt filled his feeling ${missingDays} ${missingDays == 1 ? 'day' : 'days'}.`);
    lastMonthBadFeelings = lastMonthBadFeelings.filter((e) =>
        e.feeling < 3
    );
    lastMonthBadFeelings.sort((a,b) => new Date(a.date) > new Date(b.date));
    lastMonthBadFeelings.map((feel) => comments.push(`${moment.utc(feel.date + ' ' + feel.lastChange).local().format('Y-MM-DD HH:mm:ss')} - The patient felt ${feel.feeling}/5, ${feel.reason ? `the reason is: ${feel.reason}.` : `he does'nt filled a reason.`}`));

    return comments;
}

// get comments for medicines
const patientMedicinesComments = (patientMedicines) => {
    const comments = {};
    patientMedicines.map((medicine) => {
        if(medicine.quantity < medicine.dosageamount * medicine.times.length * 2) {
            if(!comments[medicine.medicineRef.name]) comments[medicine.medicineRef.name] = [];
            comments[medicine.medicineRef.name].push(`Need to restock, there is ${medicine.quantity} left and the patient need taking the drug ${medicine.dosageamount * medicine.times.length} per day.`)
        }

        let startMoment = moment().subtract(1, 'months');
        if(moment(medicine.startDate).isAfter(startMoment))
            startMoment = moment(medicine.startDate);

        let missingDays = moment().diff(startMoment, 'days');
        console.log(moment(), startMoment, missingDays);

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
            comments[medicine.medicineRef.name].push(`The patient have missing up to ${missingDays} ${missingDays == 1 ? 'day' : 'days'} of taking the drug!`)
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
        
        let patientDetails = await User.findById(req.params.id).populate('medicines.medicineRef').select('-password -__v');

        // if patient user scheme not found
        if(!patientDetails)
            throw {message: 'User not found.'};

        let comments = {
            indices: patientIndicesLastMonth(patientDetails),
            feelings: patientBadFeelingLastMonth(patientDetails),
            medicines: patientMedicinesComments(patientDetails.medicines)
        };

        console.log(comments);
        comments['hasIndicesComments'] = comments.indices.blood.length != 0 || comments.indices.pulse.length != 0 || comments.indices.oxygen.length != 0 || comments.indices.bodyheat.length != 0;
        comments['hasFeelingsComments'] = comments.feelings.length != 0;
        comments['hasMedicinesComments'] = Object.keys(comments.medicines).length != 0;

        console.log({...patientDetails.toJSON(), ...comments});

        res.send({...patientDetails.toJSON(), ...comments});
    } catch(err) {
        console.log(err);
        res.status(422).send({error: err.message});
    }
});

module.exports = router;