const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Doctor = require('../../models/Doctor');

router.get('/', (req,res) => {
    res.send("API works!");
})

// handle sign in for doctor 
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password) return res.status(422).send({ code: 422, error: 'Email/Password not filled.'});

    const doctor = await Doctor.findOne({email});
    console.log("doctor", doctor);

    if(!doctor) return res.status(422).send({ code: 422, error: 'Invalid email'});
    try {
        await doctor.comparePassword(password);
        const token = jwt.sign({ doctorId: doctor._id }, 'kvruAGAPYFCXD3qzNFdWCUdewFYH0ZnC');
        res.send({ token });
    } catch(err) {
        return res.status(422).send({ code: 422, error: 'Invalid password' });
    }
});

// handle signup for new user
router.post('/signup', async (req, res) => {
    const { email, firstname, lastname, password, phone } = req.body;
    if(!email || !password || !firstname || !lastname || !phone) return res.status(422).send({ code: 422, error: 'Form not filled.'});

    try {
        const oldDoctor = await Doctor.findOne({$or: [{email: email}, {phone: phone}]});
        if(oldDoctor)
            throw({message: "Doctor already exist. Please login"});
        
        const doctor = new Doctor({ email, firstname, lastname, password, phone });
        await doctor.save();
        const token = jwt.sign({ doctorId: doctor._id }, 'kvruAGAPYFCXD3qzNFdWCUdewFYH0ZnC');
        res.send({ token });
    } catch(err) {
        console.log(err.message);
        return res.status(422).send({code: 422, error: err.message});
    }
});

module.exports = router;