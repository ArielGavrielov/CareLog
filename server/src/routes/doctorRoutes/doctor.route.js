const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Doctor = require('../../models/Doctor');

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
        const token = jwt.sign({ doctorId: doctor._id }, 'kvruAGAPYFCXD3qzNFdWCUdewFYH0ZnC');
        res.send({ token });
    } catch(err) {
        return res.status(422).send({ code: 422, error: err.message });
    }
});

// handle signup for new user
router.post('/signup', async (req, res) => {
    try {
        const { email, firstname, lastname, password, phone } = req.body;
        if(!email || !password || !firstname || !lastname || !phone)
            throw({message: 'Form not filled.'});

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