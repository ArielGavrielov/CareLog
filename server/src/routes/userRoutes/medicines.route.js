const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Medicine = require('../../models/Medicine');
const moment = require('moment');

const dateFormat = "Y-MM-DD";
const timeFormat = "HH:mm:ss";
const difToApprove = 60;

const diffBetweenDates = (startTime, endTime, abs=false) => {
    let dif = abs ? moment.duration(endTime.diff(startTime)).abs() : moment.duration(endTime.diff(startTime));
    return (dif.hours() * 60) + dif.minutes();
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
    if(user) {
        User.updateOne({_id: req.user._id, "medicines.medicineRef": medicine._id}, {$inc: {"medicines.$.quantity": req.body.quantity}}, (err,data) => {
            res.send(err ? err : data);
        }); 
    }
    else { 
        for(let i = 0; i < req.body.times.length; i++)
            req.body.times[i] = moment.utc(req.body.times[i], 'HH:mm').format('HH:mm');

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

        if(i === userPopulate.length || userPopulate[i].quantity <= 0) throw {message: "Medicine not found or no stock."};

        for(; j < userPopulate[i].taken.length; j++)
            if(userPopulate[i].taken[j].date === moment.utc().format(dateFormat)) break;

        if(j === userPopulate[i].taken.length) {
            const closestTime = {value: null, dif: null};
            for(let date of userPopulate[i].times) {
                let startTime = moment.utc();
                let endTime = moment.utc(date, timeFormat);
                let dif = moment.duration(endTime.diff(startTime));

                if((dif.hours() * 60) + dif.minutes() < -difToApprove) continue;
                dif = dif.abs();
                if(!closestTime.value || (dif.hours() * 60) + dif.minutes() < closestTime.value) {
                    closestTime.value = (dif.hours() * 60) + dif.minutes();
                    closestTime.dif = dif;
                }
            }
            if(closestTime.value > difToApprove) {
                let time = moment.utc(closestTime.dif.hours()+":"+closestTime.dif.minutes()+":"+closestTime.dif.seconds(), "h:m:s");
                throw {message: 'next time to take ' + userPopulate[i].medicineRef.name + ' is more: ' + time.format(timeFormat)}
            }

            User.findOneAndUpdate({
                _id: req.user._id,
                "medicines.medicineRef": userPopulate[i].medicineRef._id
            }, {
                $push: {"medicines.$.taken": {date: moment.utc().format(dateFormat), time: [moment().utc().format(timeFormat)], numOfMedicines: 1}},
                $inc: {"medicines.$.quantity": -1}
            }, (err, data) => {
                if(err) throw err;
                res.send(data);
            });
        } else {
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

            const closestTime = {value: null, dif: null};
            for(let date of userPopulate[i].times) {
                let startTime = moment.utc();
                let endTime = moment.utc(date, timeFormat);
                let dif = moment.duration(endTime.diff(startTime));

                if((dif.hours() * 60) + dif.minutes() < -difToApprove) continue;
                dif = dif.abs();
                if(!closestTime.value || (dif.hours() * 60) + dif.minutes() < closestTime.value) {
                    closestTime.value = (dif.hours() * 60) + dif.minutes();
                    closestTime.dif = dif;
                }
            }

            if(!closestTime.value)
                throw {message: 'Finish today.'}
            
            if(closestTime.value > difToApprove) {
                let time = moment.utc(closestTime.dif.hours()+":"+closestTime.dif.minutes()+":"+closestTime.dif.seconds(), "h:m:s");
                throw {message: 'next time to take ' + userPopulate[i].medicineRef.name + ' is more: ' + time.format(timeFormat)}
            }

            User.findOneAndUpdate({
                _id: req.user._id,
                "medicines.medicineRef": userPopulate[i].medicineRef._id
            }, {
                $addToSet: { "medicines.$.taken.$[j].time": moment.utc().format(timeFormat) },
                $inc: { "medicines.$.quantity": -1 }
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

router.get('/test', async (req,res) => {
    console.log(moment("2021-01-01 12:25:05").utc().format(dateFormat));
    //res.send({a: moment().utc(), b: moment.utc().diff("2021-08-15 12:25:05", "minutes")});
    const medicine = await Medicine.findOne({name: "Test"});
    let user = await User.findById(req.user._id);
    req.user.save()
});

module.exports = router;