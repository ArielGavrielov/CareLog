const express = require('express');
const router = express.Router();
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
    // sort feelings
    console.log(req.user);
    req.user.feelings.sort((a,b) => moment(`${b.date} ${b.lastChange}`, 'Y-MM-DD HH:mm:ss').diff(moment(`${a.date} ${a.lastChange}`, 'Y-MM-DD HH:mm:ss')));
    // build response for statistics
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
        let found = null, foundIndex = -1;
        if(req.user.feelings)
            found = req.user.feelings.find((feel, index) => {
                let isFound = moment(feel.date, 'Y-MM-DD').isSame(moment(moment.utc().format('Y-MM-DD')));
                if(isFound) foundIndex = index;
                return isFound;
            });

        console.log(found);
        if(found) {
            if(req.body.feeling === found.feeling) throw {message: 'same feeling.'};
            req.user.feelings[foundIndex] = req.body.reason ? {
                feeling: req.body.feeling,
                reason: req.body.reason
            } : {feeling: req.body.feeling};
            let update = await req.user.save();
            console.log(update);
            
            /*let update;
            if(req.body.reason) {
                update = await User.updateOne({_id: req.user._id, "feelings.date": moment.utc().format('Y-MM-DD')},
                {$set: {"feelings.$.lastChange": moment.utc().format('HH:mm:ss'), 'feelings.$.feeling': req.body.feeling, "feelings.$.reason": req.body.reason, __enc_feelings: false}});
            } else {
                update = await User.updateOne({_id: req.user._id, "feelings.date": moment.utc().format('Y-MM-DD')},
                {$set: {"feelings.$.lastChange": moment.utc().format('HH:mm:ss'), "feelings.$.feeling": req.body.feeling, __enc_feelings: false},
                $unset: {"feelings.$.reason": 1}});
            }*/

            if(!update) throw {message: 'nothing change.'};
            res.send({success: true, message: 'feeling updated.'});
        } else {
            req.user.feelings.push(req.body.reason ? {feeling: req.body.feeling, reason: req.body.reason} : {feeling: req.body.feeling});
            update = await req.user.save();

            if(!update) throw {message: 'nothing added.'};
            res.send({success: true, message: 'feeling added.'});
        }
    } catch(err) {

        res.status(422).send({error: err.message});
    }
});

// DEBUG - testing
router.post('/fill-random-data', async (req,res) => {
    if(!req.get('host').includes('localhost')) return res.send('Cant access');

    let day = moment('2021-07-01', 'Y-MM-DD');
    let addToSet = [];
    while(day.isBefore(moment())) {
        if(Math.random() > 0.5) {
            let randomFeel = Math.floor(Math.random() * 5) + 1;
            addToSet.push({date: day.format('Y-MM-DD'), feeling: randomFeel});
        }
        day.add(1, 'day');
    }
    //console.log(addToSet);
    req.user.feelings = addToSet;
    update = await req.user.save();
    res.send(update);
});

module.exports = router;