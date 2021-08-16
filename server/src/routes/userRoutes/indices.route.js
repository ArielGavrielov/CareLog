const express = require('express');
const router = express.Router();
const User = require('../../models/User');

function getWeeksRange(date) {
    const curr = new Date(date.time);
    const first = curr.getDate() - curr.getDay();
    const last = first + 6;
    const format = { year: 'numeric', month: '2-digit', day: '2-digit' };
    var firstday = new Date(curr.setDate(first)).toLocaleDateString("he-IL", format);
    var lastday = new Date(curr.setDate(last)).toLocaleDateString("he-IL", format);
    ;
    return `${firstday.slice(0, 5).replaceAll('.', '/')}-${lastday.slice(0, 5).replaceAll('.', '/')}`
  }
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
    days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[number];
  }
  
router.get('/', (req,res) => {
    
    res.send(req.user.indices);
});

router.get('/:type', (req,res) => {
    if(!req.params.type || !req.user.indices[req.params.type])
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

router.get('/statistic/:type', (req,res) => {
    if(req.params.type === '' || !req.user.indices[req.params.type])
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