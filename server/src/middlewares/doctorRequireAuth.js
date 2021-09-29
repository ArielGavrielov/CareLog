const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    if(!authorization) return res.status(401).send({code: 401, error: "authorization failed"});

    const token = authorization.replace('Bearer ', '');
    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
        if(err) return res.status(401).send({code: 401, error: 'invalid token'});
        const { doctorId } = payload;
        const doctor = await Doctor.findById(doctorId);
        if(!doctor) return res.status(401).send({ code: 401, error: "User not found."});
        
        req.doctor = doctor;
        next();
    });
};