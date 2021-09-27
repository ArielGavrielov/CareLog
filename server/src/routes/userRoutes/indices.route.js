const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const moment = require('moment');

function twoDigits(number) {
    const numString = "0" + number;
    return numString.substring(numString.length - 2);
}

function getWeekStart(currentdate) {
    const date = new Date(currentdate);
    date.setDate(date.getDate() - date.getDay());
    const sow = twoDigits(date.getDate()) + "/" + twoDigits(date.getMonth() + 1);
    date.setDate(date.getDate() + 6);
    const eow = twoDigits(date.getDate()) + "/" + twoDigits(date.getMonth() + 1);
    return sow + "-" + eow;
}
  
function getDay(number) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[number];
}
// get user indices  
router.get('/', (req,res) => {
    res.send(req.user.indices);
});
//get indice by type
router.get('/:type', (req,res) => {
    if(!req.params.type || req.params.type == '' || !req.user.indices || !req.user.indices[req.params.type])
        return res.status(422).send({error: 'indice not found.'});
    
    const result = req.user.indices[req.params.type].map((el) => el).reduce((acc, e) => {
        const date = new Date(e.time);
        const year = date.getFullYear();
        const week = getWeekStart(date);
        const day = getDay(date.getDay());
      
        if (!acc[year]) acc[year] = {};
        if (!acc[year][week]) acc[year][week] = {};
        if(!acc[year][week][day]) acc[year][week][day] = [];
        acc[year][week][day].push(e[req.params.type]);
        
        return acc;
    }, {});
    res.send(result);
});

//get indice by type for statistic
router.get('/statistic/:type', (req,res) => {
    if(!req.params.type || req.params.type == '' || !req.user.indices || !req.user.indices[req.params.type])
        return res.status(422).send({error: 'indice not found.'});

    switch(req.params.type) {
        case 'blood':
            req.user.indices.blood.sort((o1, o2) => {
                return new Date(o2.time) - new Date(o1.time);
            });
            let data = req.user.indices.blood.map((el) => el).reduce((acc, e) => {
                const date = new Date(e.time);
                const year = date.getFullYear();
                const week = getWeekStart(date);
                const day = getDay(date.getDay());
              
                if (!acc[year]) acc[year] = {};
                if (!acc[year][week]) acc[year][week] = {};
                if(!acc[year][week][day]) acc[year][week][day] = [];
                acc[year][week][day].push({systolic: e.systolic, diastolic: e.diastolic});
                
                return acc;
            }, {});
            
            function sortObj(obj) {
                return Object.keys(obj).sort().reverse().reduce(function (result, key) {
                  result[key] = obj[key];
                  return result;
                }, {});
              }
            return res.send(
                sortObj(data)
            );
                

        default:
            req.user.indices[req.params.type].sort((o1, o2) => {
                return new Date(o2.time) - new Date(o1.time);
            });
            return res.send(
                req.user.indices[req.params.type].map((el) => el).reduce((acc, e) => {
                const date = new Date(e.time);
                const year = date.getFullYear();
                const week = getWeekStart(date);
                const day = getDay(date.getDay());
                
                if (!acc[year]) acc[year] = {};
                if (!acc[year][week]) acc[year][week] = {};
                if(!acc[year][week][day]) acc[year][week][day] = [];
                acc[year][week][day].push(e[req.params.type]);
                
                return acc;
            }, {}));
    }
})

//post indice by type
router.post('/:type', (req,res) => {
    if(!req.user.indices) req.user.indices = {};
    switch(req.params.type) {
        case 'blood':
            if(typeof req.body.systolic !== "number"  || typeof req.body.diastolic !== "number" || req.body.systolic < 100 || req.body.systolic > 200 || req.body.diastolic < 70 || req.body.diastolic > 140)
                return res.status(422).send({code: 422, error: 'systolic and diastolic are required.'});
            
            // Insert data
            if(!req.user.indices.blood) req.user.indices.blood = [];
            req.user.indices.blood.push({systolic: req.body.systolic, diastolic: req.body.diastolic});
            req.user.save((err,data) => {
                if(err) {
                    console.log(err);
                    return res.status(422).send({code: 422, error: err});
                }
                return res.send({message: 'Added successfully.'});
            });

            // Old method (before handled data encryption).
            /*User.findByIdAndUpdate(req.user._id, {$push:{"indices.blood": {systolic: req.body.systolic, diastolic: req.body.diastolic}}}, { upsert: true, useFindAndModify: false }, (err, data) => {
                if(err) res.status(422).res.send({code: 422, error: err});
                else res.send({message: 'Added successfully.'});
            });*/
            break;
        case 'pulse':
            if(typeof req.body.pulse !== "number" || req.body.pulse < 50 || req.body.pulse > 200)
                return res.status(422).send({code: 422, error: 'invalid pulse.'});

            // Insert data
            if(!req.user.indices.pulse) req.user.indices.pulse = [];
            req.user.indices.pulse.push({pulse: req.body.pulse});
            req.user.save((err,data) => {
                if(err) {
                    console.log(err);
                    return res.status(422).send({code: 422, error: err});
                }
                return res.send({message: 'Added successfully.'});
            });

            // Old method (before handled data encryption).
            /*User.findByIdAndUpdate(req.user._id, {$push: {"indices.pulse": {pulse: req.body.pulse}}}, { upsert: true, useFindAndModify: false }, (err, data) => {
                if(err) res.send(err);
                else res.send({message: 'Added successfully.'});
            });*/
            break;
        case 'bodyheat':
            if(typeof req.body.bodyheat !== "number" || req.body.bodyheat < 31 || req.body.bodyheat > 43)
                return res.status(422).send({code: 422, error: 'invalid bodyheat.'});

            // Insert data
            if(!req.user.indices.bodyheat) req.user.indices.bodyheat = [];
            req.user.indices.bodyheat.push({bodyheat: req.body.bodyheat});
            req.user.save((err,data) => {
                if(err) {
                    console.log(err);
                    return res.status(422).send({code: 422, error: err});
                }
                return res.send({message: 'Added successfully.'});
            });
            
            // Old method (before handled data encryption).
            /*User.findByIdAndUpdate(req.user._id, {$push: {"indices.bodyheat":{bodyheat: req.body.bodyheat}}}, { upsert: true, useFindAndModify: false }, (err, data) => {
                if(err) res.send(err);
                else res.send({message: 'Added successfully.'});
            });*/
            break;
        case 'oxygen':
            if(typeof req.body.oxygensaturation !== "number" || req.body.oxygensaturation < 60 || req.body.oxygensaturation > 100)
                return res.status(422).send({code: 422, error: 'invalid oxygen.'});

            // Insert data
            if(!req.user.indices.oxygen) req.user.indices.oxygen = [];
            req.user.indices.oxygen.push({oxygen: req.body.oxygensaturation});
            req.user.save((err,data) => {
                if(err) {
                    console.log(err);
                    return res.status(422).send({code: 422, error: err});
                }
                return res.send({message: 'Added successfully.'});
            });

            // Old method (before handled data encryption).
            /*User.findByIdAndUpdate(req.user._id, {$push: {"indices.oxygen": {oxygen: req.body.oxygensaturation}}}, { upsert: true, useFindAndModify: false }, (err, data) => {
                if(err) res.send(err);
                else res.send({message: 'Added successfully.'});
            });*/
            break;
        default: res.send({error: 'indice not found'});
    }
});

// DEBUG - testing
router.post('/fill/data', async (req,res) => {
    if(!req.get('host').includes('localhost')) return res.send('Cant access');

    let day = moment.utc('2020-09-01', 'Y-MM-DD');
    let set = {blood: [], bodyheat: [], pulse: [], oxygen: []};
    while(day.isBefore(moment())) {
        //if(Math.random() > 0.5) {
            let diastolic = Math.floor(Math.random() * (140 - 70 + 1)) + 70;
            let systolic = Math.floor(Math.random() * (200 - (diastolic < 100 ? 100 : (diastolic+10)) + 1)) + (diastolic < 100 ? 100 : (diastolic+10));
            let randomBlood = {diastolic: diastolic, systolic: systolic};
            set.blood.push({time: day.format('Y-MM-DD'), ...randomBlood});
        //}
        //if(Math.random() > 0.5) {
            let randomPulse = (Math.floor(Math.random() * (200 - 50 + 1)) + 50);
            console.log(randomPulse);
            set.pulse.push({time: day.format('Y-MM-DD'), pulse: randomPulse});
        //}
        //if(Math.random() > 0.5) {
            let randomBodyheat = Math.floor(Math.random() * (39 - 35 + 1)) + 35;
            set.bodyheat.push({time: day.format('Y-MM-DD'), bodyheat: randomBodyheat});
        //}
        //if(Math.random() > 0.5) {
            let randomOxygen = Math.floor(Math.random() * (100 - 90 + 1)) + 90;
            set.oxygen.push({time: day.format('Y-MM-DD'), oxygen: randomOxygen});
        //}
        day.add(1, 'day');
    }

    update = await User.updateOne({_id: req.user._id}, 
        {$set: {"indices": set}});
    res.send(update);
});

module.exports = router;