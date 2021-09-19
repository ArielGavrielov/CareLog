const express = require('express');
const router = express.Router();
const Doctor = require('../../models/Doctor');
const moment = require('moment');

const DATETIMEFORMAT = 'Y-MM-DD HH:mm';

router.get('/', (req,res) => {
    res.send(req.doctor.meetings);
});

router.post('/', (req,res) => {
/*
* 
*/
});

router.get('/freetime', async (req,res) => {
/*
* Doctor work time is: 08:00-17:00.
* every meeting takes 15 minutes.
* 4 meetings in hour.
* 13:00 - 14:00 the doctor is in a break.
* 32 meetings per day.
* req.body.date - checking date.
*/
    try {
        if(!req.body.date)
            throw {message: 'date property is required.'};

        let dateInput = moment.utc(`${req.body.date} ${moment.utc().format('HH:mm')}`, DATETIMEFORMAT);
        let startWork = moment.utc(`${req.body.date} 08:00`, DATETIMEFORMAT);
        let endWork = moment.utc(`${req.body.date} 17:00`, DATETIMEFORMAT);
        let now = moment.utc();
        let startCheck;
        let freetime = [];

        if(now.isAfter(dateInput, 'date'))
            throw {message: `The date ${req.body.date} already was.`}

        else if(now.isSame(dateInput, 'date')) {
            if(dateInput.isAfter(endWork, 'hour')) {
                throw {message: 'Day work end.'}
            }
            else if(dateInput.isAfter(startWork, 'hour')) {
                startCheck = moment.utc(`${req.body.date} ${dateInput.get('hour')}:30`, DATETIMEFORMAT);
            }
            else {
                startCheck = startWork;
            }
        } else
            startCheck = startWork;

        let doctorMeetingsForDate = req.doctor.meetings.filter((meetings) => meetings.date === req.body.date);
        res.send(startCheck);
    } catch(err) {
        res.status(422).send({error: err.message});
    }

});

module.exports = router;