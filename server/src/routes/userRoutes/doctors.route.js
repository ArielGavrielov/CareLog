const express = require('express');
const router = express.Router();
const Doctor = require('../../models/Doctor');
const Event = require('../../models/Event');
const moment = require('moment');

const DATETIMEFORMAT = 'Y-MM-DD HH:mm';
const TIMEFORMAT = 'HH:mm';
const DATEFORMAT = 'Y-MM-DD';

function getFullDay(doctor, datetime) {
    let momentDatetime = moment.utc(datetime, DATETIMEFORMAT);
    let isNewEventRequest = moment.utc(datetime, DATETIMEFORMAT, true).isValid();
    console.log(isNewEventRequest);
    let timeFormat = isNewEventRequest ? momentDatetime.format(TIMEFORMAT) : moment.utc().format('HH:mm');
    let dateFormat = momentDatetime.format(DATEFORMAT);
    
    let day = [];
    let dateInput = moment(`${dateFormat} ${timeFormat}`, DATETIMEFORMAT).utc();
    let startWork = moment.utc(`${dateFormat} ${doctor.startWorkTime}`, DATETIMEFORMAT);
    let startWorkIterator = startWork.clone();
    let endWork = moment.utc(`${dateFormat} ${doctor.endWorkTime}`, DATETIMEFORMAT);
    let startBreak = moment.utc(`${dateFormat} ${doctor.breakTime[0]}`, DATETIMEFORMAT);
    let endBreak = moment.utc(`${dateFormat} ${doctor.breakTime[1]}`, DATETIMEFORMAT);
    let now = moment.utc();

    if(now.isAfter(dateInput, 'date') || (now.isSame(dateInput, 'date') && dateInput.isSameOrAfter(endWork, 'hour')))
        throw {message: `The date ${dateFormat} already was.`}
    
    while(true) {
        if(startWorkIterator.isSameOrAfter(endWork))
            break;

        // if doctor break time.
        if(!(startWorkIterator.isSameOrAfter(startBreak) && startWorkIterator.isBefore(endBreak)))
            day.push(startWorkIterator.format(TIMEFORMAT));

        startWorkIterator.add(15, 'minutes');
    }

    if(isNewEventRequest) {
        // if time input at breaktime of doctor.
        if(momentDatetime.isSameOrAfter(startBreak) && momentDatetime.isBefore(endBreak))
            throw {message: `Dr. ${doctor.firstname} ${doctor.lastname} is on a break between ${startBreak.local().format(TIMEFORMAT)}-${endBreak.local().format(TIMEFORMAT)}`}
            
        // if time is not between work time.
        else if(momentDatetime.isBefore(startWork) || momentDatetime.isAfter(endWork))
            throw {message: `Dr. ${doctor.firstname} ${doctor.lastname} work time is ${startWork.local().format(TIMEFORMAT)}-${endWork.local().format(TIMEFORMAT)}`}
    } else {
        if(now.isSame(dateInput, 'date')) {
            if(dateInput.isSameOrAfter(endWork, 'hour'))
                throw {message: 'Day work end.'}
            else if(dateInput.isSameOrAfter(startWork, 'hour')) {
                if(!(dateInput.isSameOrAfter(startBreak) && dateInput.isBefore(endBreak)))
                    day = day.filter((value) => moment.utc(value, TIMEFORMAT).isAfter(dateInput))
                else
                    day = day.filter((value) => moment.utc(value, TIMEFORMAT).isSameOrAfter(endBreak))
            }
        }
    }

    return day;
}

router.get('/', (req,res) => {
    res.send(req.user.doctors);
});

router.post('/:id/new-meeting', async(req,res) => {
/*
    * Only one patient at same time.
*/
    try {
        const { datetime, body } = req.body;
        let momentDatetime = moment.utc(datetime, DATETIMEFORMAT)
        let timeFormat = momentDatetime.format(TIMEFORMAT);
        let dateFormat = momentDatetime.format(DATEFORMAT);

        if(!datetime || !momentDatetime.isValid())
            throw { message: 'Invalid date'};
        
        const doctor = await Doctor.findOne({_id: req.params.id});
        if(!doctor || !doctor.patients.includes(req.user._id))
            throw {message: 'Doctor not found.'};
        
        /*let startWork = moment.utc(`${momentDatetime.format(DATEFORMAT)} ${doctor.startWorkTime}`, DATETIMEFORMAT);
        let endWork = moment.utc(`${momentDatetime.format(DATEFORMAT)} ${doctor.endWorkTime}`, DATETIMEFORMAT);
        let startBreak = moment.utc(`${momentDatetime.format(DATEFORMAT)} ${doctor.breakTime[0]}`, DATETIMEFORMAT);
        let endBreak = moment.utc(`${momentDatetime.format(DATEFORMAT)} ${doctor.breakTime[1]}`, DATETIMEFORMAT);
        let now = moment.utc();*/
        let freetime = getFullDay(doctor, datetime);
        
        if(!freetime.includes(timeFormat)) {
            throw {message: 'Illegal time or already taken.'};
        }
        /*
        // if work day already was.
        if(now.isAfter(momentDatetime, 'date') || (now.isSame(momentDatetime, 'date') && momentDatetime.isSameOrAfter(endWork, 'hour')))
            throw {message: `The date ${dateFormat} already was.`}

        // if time input at breaktime of doctor.
        else if(momentDatetime.isSameOrAfter(startBreak) && momentDatetime.isBefore(endBreak))
            throw {message: `Dr. ${doctor.firstname} ${doctor.lastname} is on a break between ${startBreak.local().format(TIMEFORMAT)}-${endBreak.local().format(TIMEFORMAT)}`}
            
        // if time is not between work time.
        else if(momentDatetime.isBefore(startWork) || momentDatetime.isAfter(endWork))
            throw {message: `Dr. ${doctor.firstname} ${doctor.lastname} work time is ${startWork.local().format(TIMEFORMAT)}-${endWork.local().format(TIMEFORMAT)}`}
        */
        const doctorWorkDay = doctor.workDay.filter((day) => day.date === dateFormat);
        if(!doctorWorkDay || doctorWorkDay.length === 0) {
            let workDay = {
                date: dateFormat,
                meetings: [{
                    userId: req.user._id,
                    time: timeFormat
                }]
            }
            let update = await Doctor.updateOne({_id: req.params.id}, {$addToSet: {'workDay': workDay}});
            if(update.nModified === 1)
                return res.send({message: 'Meeting added successfully'});
        }

        let timeMeeting = doctorWorkDay[0].meetings.find(({time}) => time == timeFormat);
        // if another meeting found.
        if(timeMeeting)
            throw {message: `${momentDatetime.local().format(DATETIMEFORMAT)} already taken.`};
        
        // check if user has event at input time (15 minutes diffrence).
        let userEvents = await Event.findOne({userId: req.user._id, time: {$gte: momentDatetime.clone().subtract(15,'minutes').format(DATETIMEFORMAT), $lte: momentDatetime.clone().add(15, 'minutes').format(DATETIMEFORMAT)}});
        if(userEvents)
            throw {message: 'there is already event at this time'};
        
        let addToUserEvents = await Event.create({userId: req.user._id, doctorId: req.params.id, title: `Meeting with Dr.${doctor.firstname} ${doctor.lastname}`, body, address: doctor.address, time: momentDatetime.format(DATETIMEFORMAT)})
        let addToDoctorMeetings = await Doctor.updateOne({_id: req.params.id, 'workDay.date': dateFormat}, {$addToSet: {'workDay.$.meetings': {userId: req.user._id, time: timeFormat}}});
        if(!addToUserEvents || !addToDoctorMeetings || addToDoctorMeetings.nModified !== 1)
            throw {message: 'Unknown error.'};
        
        res.send({message: 'Meeting added successfully'});
    } catch(err) {
        res.status(422).send({error: err.message});
    }
});

router.get('/:id/freetime', async (req,res) => {
/*
    * Doctor work time is dynamically (before 13:00).
    * every meeting takes 15 minutes.
    * 4 meetings in hour.
    * 13:00 - 14:00 the doctor is in a break.
    * 32 meetings per day.
    * req.body.date - checking date.
*/
    try {
        let date = moment(req.body.date, DATEFORMAT, true);
        if(!req.body.date || !date.isValid())
            throw {message: 'date property is required format: Y-MM-DD.'};
        
        let doctor = await Doctor.findById(req.params.id);
        if(!doctor || !doctor.patients.includes(req.user._id))
            throw {message: 'Doctor not found.'};

        let freetime = getFullDay(doctor, date.format(DATEFORMAT));

        let doctorWorkDay = doctor.workDay.filter((day) => day.date === date.format(DATEFORMAT));
        console.log(doctorWorkDay);
        if(!doctorWorkDay || doctorWorkDay.length === 0)
            return res.send(freetime);
        
        let meetings = doctorWorkDay[0]['meetings'];
        meetings.map((meeting) => {
            if(freetime.includes(meeting.time))
                freetime.splice(freetime.indexOf(meeting.time), 1);
        });

        res.send(freetime);
    } catch(err) {
        res.status(422).send({error: err.message});
    }

});

module.exports = router;