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

const populateMedicines = async (user) => {
    //let details = await User.findOne({_id: user._id})
    //    .populate('medicines.medicineRef', '-_id -createdBy');
    for(let i = 0; i < user.medicines.length; i++)
        user.medicines[i].medicineRef = await Medicine.findById(user.medicines[i].medicineRef);
    return user;
}
//get user medicine
router.get('/', async (req,res) => {
    res.send((await populateMedicines(req.user)).medicines);
});
// get all medicines
router.get('/all', async (req,res) => {
    res.send(await Medicine.find());
});

// post new medicine for user
router.post('/', async (req,res) => {
    try {
        let {name, dosageamount, quantity, times} = req.body;
        if(!name || !dosageamount || !quantity || !times) throw {message: 'Parameters missing.'};
    
        // Check if medicine exist.
        let medicine = await Medicine.findOne({name: name});
        if(!medicine) {
            // if not exist create one.
            req.body['createdBy'] = req.user._id;
            medicine = await Medicine.create(req.body);
        }

        // convert the times from user to utc.
        for(let i = 0; i < req.body.times.length; i++) {
            console.log(req.body.times[i], moment(req.body.times[i], 'HH:mm').utc().format('HH:mm'), moment().format('HH:mm'));
            req.body.times[i] = moment(req.body.times[i], 'HH:mm').utc().format('HH:mm');
        }
        req.body.times.sort((a,b) => a > b ? 1 : a < b ? -1 : 0);

        // check if medicine already exists.
        let foundIndex = -1;
        let userMedicine = req.user.medicines.find((med, index) => {
            let isFound = med.medicineRef.equals(medicine._id);
            if(isFound) foundIndex = index;
            return isFound;
        });

        if(userMedicine && foundIndex !== -1) {
            req.user.medicines[foundIndex] = {
                ...req.user.medicines[foundIndex].toObject(),
                dosageamount,
                quantity,
                times
            }
            req.user.save((err,data) => {
                if(err)
                    throw {message: err};
                return res.send({message: 'Update successfull'});
            });
        } else {
            req.user.medicines.push({medicineRef: medicine._id, dosageamount, quantity, times});
            req.user.save((err,data) => {
                if(err)
                    throw {message: err};
                return res.send({message: 'Added successfull'});
            });
        }
    } catch(err) {
        console.log("user save");
        res.status(422).send({error: err.message});
    }

    // Old method (before handled data encryption).
    /*let user = await User.findOne({_id: req.user._id, "medicines.medicineRef": medicine._id});
    // if user has that medicine before.
    if(user) {
        // update user medicine rules.
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
    } else {
        // add medicicine to user medicines array
        User.findByIdAndUpdate(req.user._id, {$addToSet: {"medicines": {medicineRef: medicine._id, ...req.body}}}, (err,data) => {
            res.send(err ? err : data);
        });
    }*/
});

// Take medicine request handle
router.put('/take/:name', async (req,res) => {
    try {
        // join user medicines with medicines objects
        const userPopulate = (await populateMedicines(req.user)).medicines;
        let i = 0; // index of medicine
        let j = 0; // index of current date taken
        
        // find medicine document.
        for(; i < userPopulate.length; i++)
            if(userPopulate[i].medicineRef.name === req.params.name) break;

        // if medicine not found at user schema
        if(i === userPopulate.length)
            throw {message: "Medicine not found."};

        // if user no enogh quantity of medicine.
        if(userPopulate[i].quantity-userPopulate[i].dosageamount < 0)
            throw {message: "No stock."};

        // find today taken document.
        for(; j < userPopulate[i].taken.length; j++)
            if(userPopulate[i].taken[j].date === moment.utc().format(dateFormat)) break;

        // if found taken document
        if(j !== userPopulate[i].taken.length) {
            // if already toked today.
            if(userPopulate[i].taken[j].time.length >= userPopulate[i].times.length)
                throw {message: 'You\'ve already toked this medicine today.'};
            
            // for each taken time today
            for(let takenTime of userPopulate[i].taken[j].time) {
                let startTime = moment.utc(takenTime, timeFormat);
                let difMin = 60*24; // start with 24 hours.
                let iMin = 0; // index of closest time

                // for each times to take.
                for(let k = 0; k < userPopulate[i].times.length; k++) {
                    // compare between toked - take time
                    let endTime = moment.utc(userPopulate[i].times[k], timeFormat);
                    let dif = diffBetweenDates(startTime, endTime, true);

                    if(dif < difMin) {
                        difMin = dif
                        iMin = k;
                    }
                }
                // remove the time that already taken.
                userPopulate[i].times.splice(iMin, 1);
            }
        }
        const closestTime = {value: null, dif: null, time: null};

        for(let time of userPopulate[i].times) {
            let startTime = moment.utc();
            let endTime = moment.utc(time, timeFormat);
            let dif = moment.duration(endTime.diff(startTime));

            // if the diffrent is more than $difToApprove minutes.
            if(dif.asMinutes() < -difToApprove) continue;
            dif = dif.abs();
            if(!closestTime.value || dif.asMinutes() < closestTime.value) {
                closestTime.value = dif.asMinutes();
                closestTime.dif = dif;
                closestTime.time = endTime;
            }
        }
        // if the user missed the medicine
        if(!closestTime.value)
            throw {message: 'Finish today.'}

        // if too early.
        if(parseFloat(closestTime.value) > parseFloat(difToApprove))
            throw {message: `Next time to take ${userPopulate[i].medicineRef.name} is ${closestTime.time.fromNow()} (${closestTime.time.local().format('HH:mm')})`}

        if(j === userPopulate[i].taken.length) {
            console.log(-userPopulate[i].dosageamount);
            req.user.medicines[i].taken.push({date: moment.utc().format(dateFormat), time: [moment().utc().format(timeFormat)]});
            req.user.medicines[i].quantity -= userPopulate[i].dosageamount;
            req.user.save((err,data) => {
                if(err) throw {message: err};
                res.send(data);
            });

            // Old method (before handled data encryption).
            /*
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
            */
        } else {
            req.user.medicines[i].taken[j].time.push(moment.utc().format(timeFormat));
            req.user.medicines[i].quantity -= userPopulate[i].dosageamount;
            req.user.save((err,data) => {
                if(err) throw {message: err};
                res.send(data);
            });

            // Old method (before handled data encryption).
            /*
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
            */
        }
    } catch(err) {
        console.log(err);
        res.status(422).send({error: err.message});
    }
}); 

// delete medicine by name
router.delete('/:name', async (req,res) => {
    try {
        let medicine = await Medicine.findOne({name: req.params.name});
        req.user.medicines = req.user.medicines.filter((med) => !med.medicineRef.equals(medicine._id));
        req.user.save((err,data) => {
            if(err)
                throw {message: 'Medicine not found, try relaunch app.'};
            res.send(data);
        });

        // Old method (before handled data encryption).
        /*
        User.updateOne({_id: req.user._id}, { $pull: { 'medicines': { medicineRef: medicine._id }}}, (err,data) => {
            if(err || data.nModified === 0) return res.status(422).send({error: 'Medicine not found, try relaunch app.'});
            res.send(data);
        });
        */
    } catch(err) {
        console.log(err);
        res.status(422).send({error: err.message});
    }
});

module.exports = router;