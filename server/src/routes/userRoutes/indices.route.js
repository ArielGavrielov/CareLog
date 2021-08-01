const express = require('express');
const router = express.Router();
const User = require('../../models/User');

router.get('/', (req,res) => {
    res.send(req.user.indices);
});

router.get('/:type', (req,res) => {
    res.send(req.user.indices[req.params.type]);
});

router.post('/:type', (req,res) => {
    switch(req.params.type) {
        case 'blood':
            if(typeof req.body.systolic !== "number"  || typeof req.body.diastolic !== "number" || req.body.systolic < 100 || req.body.systolic > 200 || req.body.diastolic < 70 || req.body.diastolic > 140)
                return res.status(422).send({code: 422, error: 'systolic and diastolic are required.'});
            User.findByIdAndUpdate(req.user._id, {$push: {"indices.blood": {systolic: req.body.systolic, diastolic: req.body.diastolic}}}, { upsert: true, useFindAndModify: false }, (err, data) => {
                if(err) res.status(422).res.send({code: 422, error: err});
                else res.send({message: 'Added successfully.'});
            });
            break;
        case 'pulse':
            if(typeof req.body.pulse !== "number" || req.body.pulse < 50 || req.body.pulse > 200)
                return res.status(422).send({code: 422, error: 'invalid pulse.'});
            User.findByIdAndUpdate(req.user._id, {$push: {"indices.pulse": {pulse: req.body.pulse}}}, { upsert: true, useFindAndModify: false }, (err, data) => {
                if(err) res.send(err);
                else res.send({message: 'Added successfully.'});
            });
            break;
        case 'bodyheat':
            if(typeof req.body.bodyheat !== "number" || req.body.bodyheat < 31 || req.body.bodyheat > 43)
                return res.status(422).send({code: 422, error: 'invalid bodyheat.'});
            User.findByIdAndUpdate(req.user._id, {$push: {"indices.bodyheat":{bodyheat: req.body.bodyheat}}}, { upsert: true, useFindAndModify: false }, (err, data) => {
                if(err) res.send(err);
                else res.send({message: 'Added successfully.'});
            });
            break;
        case 'oxygen':
            if(typeof req.body.oxygensaturation !== "number" || req.body.oxygensaturation < 60 || req.body.oxygensaturation > 100)
                return res.status(422).send({code: 422, error: 'invalid oxygen.'});
            User.findByIdAndUpdate(req.user._id, {$push: {"indices.oxygen": {oxygen: req.body.oxygensaturation}}}, { upsert: true, useFindAndModify: false }, (err, data) => {
                if(err) res.send(err);
                else res.send({message: 'Added successfully.'});
            });
            break;
        default: res.send({error: 'indice not found'});
    }
})

module.exports = router;