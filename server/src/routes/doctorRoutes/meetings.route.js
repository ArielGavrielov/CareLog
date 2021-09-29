const express = require('express');
const router = express.Router();
const moment = require('moment');

const DATETIMEFORMAT = 'Y-MM-DD HH:mm';
const TIMEFORMAT = 'HH:mm';
const DATEFORMAT = 'Y-MM-DD';

const getWeekStartDay = (date) => moment.utc(date, DATEFORMAT).startOf('week');
const getWeekLastDay = (date) => moment.utc(date, DATEFORMAT).endOf('week');
const getMonthStartDay = (date) => moment.utc(date, DATEFORMAT).startOf('month');
const getMonthLastDay = (date) => moment.utc(date, DATEFORMAT).endOf('month');
const dateIsBetween = (date, first, last) => moment(date).isSameOrAfter(first) && moment(date).isSameOrBefore(last);

const getEventsOfDay = (workDay) => {
    let events = [];

    if(!workDay || !workDay.meetings || workDay.meetings.length === 0)
        return events;

    workDay.meetings.map((meeting) => {
        events.push({
            id: meeting._id,
            title: `Patient ${meeting.userId.firstname} ${meeting.userId.lastname}`,
            start: moment.utc(`${workDay.date} ${meeting.time}`, DATETIMEFORMAT).format(DATETIMEFORMAT),
            end: moment.utc(`${workDay.date} ${meeting.time}`, DATETIMEFORMAT).add(15, 'minutes').format(DATETIMEFORMAT)
        });
    });

    console.log(events);
    return events;
}

const getEventsOfDays = (workDays) => {
    let events = [];
    if(!workDays || workDays.length === 0)
        return events;
    
        workDays.map((workDay) => {
        events = [...events, ...getEventsOfDay(workDay)];
    });

    console.log(events);
    return events;
}

router.get('/worktime', (req,res) => {
    let {startWorkTime, endWorkTime} = req.doctor;
    console.log({startWorkTime, endWorkTime});
    res.send({startWorkTime, endWorkTime});
});

router.get('/month/:date', async (req,res) => {
    try {
        let monthWorkDays = await req.doctor.execPopulate('workDay.meetings.userId');
        monthWorkDays = monthWorkDays.workDay.filter((day) => dateIsBetween(moment.utc(day.date), getMonthStartDay(req.params.date), getMonthLastDay(req.params.date)));
        
        res.send(getEventsOfDays(monthWorkDays));
    } catch(err) {
        res.status(422).send({error: err.message});
    }
});

router.get('/week/:date', async (req,res) => {
    try {
        let weekWorkDays = await req.doctor.execPopulate('workDay.meetings.userId')
        weekWorkDays = weekWorkDays.workDay.filter((day) => dateIsBetween(moment.utc(day.date), getWeekStartDay(req.params.date), getWeekLastDay(req.params.date)));
        
        res.send(getEventsOfDays(workDays));
    } catch(err) {
        res.status(422).send({error: err.message});
    }
});

router.get('/day/:date', async (req,res) => {
    try {
        let doc = await req.doctor.execPopulate('workDay.meetings.userId')
        doc = doc.workDay.find((day) => day.date === req.params.date);

        res.send(getEventsOfDay(workDay));
    } catch(err) {
        res.status(422).send({error: err.message});
    }
});

router.post('/', (req,res) => {
/*
* 
*/
});

module.exports = router;