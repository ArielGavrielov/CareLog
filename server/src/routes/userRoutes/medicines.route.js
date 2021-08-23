const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Medicine = require('../../models/Medicine');
const moment = require('moment');

const dateFormat = "Y-MM-DD";
const timeFormat = "HH:mm:ss";
const difToApprove = 60.0;

const diffBetweenDates = (startTime, endTime, abs=false) => {
    let dif = abs ? moment.duration(endTime.diff(startTime)).abs() : moment.duration(endTime.diff(startTime));
    return dif.asMinutes();
}

router.get('/', async (req,res) => {
    let details = await User.findOne({_id: req.user._id})
        .populate('medicines.medicineRef', '-_id -createdBy');

    res.send(details.medicines);

});
router.get('/all', async (req,res) => {
    res.send(await Medicine.find());
});

router.post('/', async (req,res) => {
    let medicine = await Medicine.findOne({name: req.body.name});
    if(!medicine) {
        req.body['createdBy'] = req.user._id;
        medicine = await Medicine.create(req.body);
    }

    let user = await User.findOne({_id: req.user._id, "medicines.medicineRef": medicine._id});
    for(let i = 0; i < req.body.times.length; i++)
        req.body.times[i] = moment(req.body.times[i], 'HH:mm').utc().format('HH:mm');
    if(user) {
        User.updateOne(
            {_id: req.user._id, "medicines.medicineRef": medicine._id},
            {$set: {
                "medicines.$.dosageamount": req.body.dosageamount,
                "medicines.$.quantity": req.body.quantity,
                "medicines.$.times": req.body.times
            }}, 
            (err,data) => {
                res.send(err ? err : data.nModified === 0 ? {error: 'Not modified.'} : data);
        }); 
    }
    else {
        User.findByIdAndUpdate(req.user._id, {$push: {"medicines": {medicineRef: medicine._id, ...req.body}}}, (err,data) => {
            res.send(err ? err : data);
        });
    }
});

// Take medicine request handle
router.put('/take/:name', async (req,res) => {
    try {
        // join user medicines with medicines objects
        const userPopulate = (await User.findById(req.user._id).populate('medicines.medicineRef')).medicines;
        let i = 0; // index of medicine
        let j = 0; // index of current date taken
        
        for(; i < userPopulate.length; i++) if(userPopulate[i].medicineRef.name === req.params.name) break;

        // if medicine not found at user schema
        if(i === userPopulate.length) throw {message: "Medicine not found."};

        // if user no enogh quantity of medicine.
        if(userPopulate[i].quantity-userPopulate[i].dosageamount < 0) throw {message: "No stock."};

        for(; j < userPopulate[i].taken.length; j++) if(userPopulate[i].taken[j].date === moment.utc().format(dateFormat)) break;

        if(j !== userPopulate[i].taken.length) {
            if(userPopulate[i].taken[j].time.length >= userPopulate[i].times.length)
                throw {message: 'You\'ve already toked this medicine today.'};
            for(let takenDate of userPopulate[i].taken[j].time) {
                let startTime = moment.utc(takenDate, timeFormat);
                let difMin = 60*24;
                let iMin = 0;

                for(let k = 0; k < userPopulate[i].times.length; k++) {
                    let endTime = moment.utc(userPopulate[i].times[k], timeFormat);
                    let dif = diffBetweenDates(startTime, endTime, true);

                    if(dif < difMin) {
                        difMin = dif
                        iMin = k;
                    }
                }
                userPopulate[i].times.splice(iMin, 1);
            }
        }
        const closestTime = {value: null, dif: null, time: null};

        for(let date of userPopulate[i].times) {
            let startTime = moment.utc();
            let endTime = moment.utc(date, timeFormat);
            let dif = moment.duration(endTime.diff(startTime));

            console.log(moment().format('HH:mm'), startTime.format('HH:mm'), endTime.format('HH:mm'), dif.asMinutes());

            if(dif.asMinutes() < -difToApprove) continue;
            dif = dif.abs();
            if(!closestTime.value || dif.asMinutes() < closestTime.value) {
                closestTime.value = dif.asMinutes();
                closestTime.dif = dif;
                closestTime.time = endTime;
            }
        }

        if(!closestTime.value)
            throw {message: 'Finish today.'}
        console.log(closestTime.value);
        if(parseFloat(closestTime.value) > parseFloat(difToApprove)) {
            let time = moment.utc(closestTime.dif.hours()+":"+closestTime.dif.minutes()+":"+closestTime.dif.seconds(), "h:m:s");
            throw {message: 'Next time to take ' + userPopulate[i].medicineRef.name + ' is more: ' + time.format(timeFormat) + " ("+closestTime.time.local().format('HH:mm')+")"}
        }
        if(j === userPopulate[i].taken.length) {
            console.log(-userPopulate[i].dosageamount);
            User.findOneAndUpdate({
                _id: req.user._id,
                "medicines.medicineRef": userPopulate[i].medicineRef._id
            }, {
                $push: {"medicines.$.taken": {date: moment.utc().format(dateFormat), time: [moment().utc().format(timeFormat)]}},
                $inc: {"medicines.$.quantity": -userPopulate[i].dosageamount}
            }, (err, data) => {
                if(err) throw err;
                res.send(data);
            });
        } else {
            User.findOneAndUpdate({
                _id: req.user._id,
                "medicines.medicineRef": userPopulate[i].medicineRef._id
            }, {
                $addToSet: { "medicines.$.taken.$[j].time": moment.utc().format(timeFormat) },
                $inc: { "medicines.$.quantity": -userPopulate[i].dosageamount }
            }, {
                arrayFilters: [{"j.date": moment.utc().format(dateFormat)}]
            }, (err, data) => {
                if(err) throw err;
                res.send(data);
            });
        }
    } catch(err) {
        console.log(err);
        res.status(422).send({error: err.message});
    }
}); 

router.delete('/:name', async (req,res) => {
    try {
        let medicine = await Medicine.findOne({name: req.params.name});
        User.updateOne({_id: req.user._id}, { $pull: { 'medicines': { medicineRef: medicine._id }}}, (err,data) => {
            if(err) throw err;
            if(data.nModified === 0) throw {message: 'Medicine not found'};
            res.send(data);
        });
    } catch(err) {
        console.log(err);
        res.status(422).send({error: err.message});
    }
});

router.get('/test', async (req,res) => {
    await Medicine.deleteMany();
});

module.exports = router;