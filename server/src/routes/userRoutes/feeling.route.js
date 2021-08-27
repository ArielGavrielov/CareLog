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
// get user feeling 
router.get('/', async (req,res) => {

    const result = req.user.feelings.map((el) => el).reduce((acc, e) => {
        const date = new Date(e.date);
        const year = date.getFullYear();
        const week = getWeekStart(date);
        const day = getDay(date.getDay());
      
        if (!acc[year]) acc[year] = {};
        if (!acc[year][week]) acc[year][week] = {};
        if(!acc[year][week][day]) acc[year][week][day] = e.feeling;
        
        return acc;
    }, {});
    res.send(result);
});

//get user feeling by date
router.get('/:date', (req,res) => {
    try {
        let found = req.user.feelings.find((feel) => feel.date == req.params.date);
        if(!found) throw {message: 'No data'};
        res.send(found);
    } catch (err) {
        res.status(422).send({error: true, message: err.message});
    }
});

//post user feeling 
router.post('/', async (req,res) => {
    try {
        let isGood = req.body.feeling && req.body.feeling >= 1 && req.body.feeling <= 5;

        if(!isGood) throw {message: 'feeling value is required. >=1 && <= 5.'};
        let found = null;
        if(req.user.feelings)
            found = req.user.feelings.find((feel) => moment(feel.date, 'Y-MM-DD').isSame(moment(moment.utc().format('Y-MM-DD'))));

        if(found) {
            if(req.body.feeling === found.feeling) throw {message: 'same feeling.'};

            let update = await User.updateOne({_id: req.user._id, "feelings.date": moment.utc().format('Y-MM-DD')},
                {$set: {"feelings.$.lastChange": moment.utc().format('HH:mm:ss'), "feelings.$.feeling": req.body.feeling}});

            if(update.nModified === 0) throw {message: 'nothing change.'};
            res.send({success: true, message: 'feeling updated.'});
        } else {
            update = await User.updateOne({_id: req.user._id},
                {$addToSet: {"feelings": req.body}});
            if(update.nModified === 0) throw {message: 'nothing added.'};
            res.send({success: true, message: 'feeling added.'});
        }
    } catch(err) {
        res.status(422).send({error: err.message});
    }
});

module.exports = router;