const express = require('express');
const router = express.Router();
const Doctor = require('../../models/Doctor');
const User = require('../../models/User');
const Event = require('../../models/Event');
const moment = require('moment');

const DATETIMEFORMAT = 'Y-MM-DD HH:mm';
const TIMEFORMAT = 'HH:mm';
const DATEFORMAT = 'Y-MM-DD';

function getFullDay(doctor, datetime) {
    let momentDatetime = moment.utc(datetime, DATETIMEFORMAT);
    let isNewEventRequest = moment.utc(datetime, DATETIMEFORMAT, true).isValid();
    let timeFormat = isNewEventRequest ? momentDatetime.format(TIMEFORMAT) : moment.utc().format('HH:mm');
    let dateFormat = momentDatetime.format(DATEFORMAT);

    let day = [];
    let dateInput = moment.utc(`${dateFormat} ${timeFormat}`, DATETIMEFORMAT);
    let startWork = moment.utc(`${dateFormat} ${doctor.startWorkTime}`, DATETIMEFORMAT);
    let startWorkIterator = startWork.clone();
    let endWork = moment.utc(`${dateFormat} ${doctor.endWorkTime}`, DATETIMEFORMAT);
    let startBreak = moment.utc(`${dateFormat} ${doctor.breakTime[0]}`, DATETIMEFORMAT);
    let endBreak = moment.utc(`${dateFormat} ${doctor.breakTime[1]}`, DATETIMEFORMAT);
    let now = moment.utc();

    console.log(now.isSame(dateInput, 'date'), dateInput.isSameOrAfter(endWork, 'hour'), dateInput, endWork);
    if(now.isAfter(dateInput, 'date') || (now.isSame(dateInput, 'date') && dateInput.isSameOrAfter(endWork, 'hour')) || (isNewEventRequest && now.isAfter(dateInput)))
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

router.get('/', async (req,res) => {
    try {
        let user = await User.findById(req.user._id).populate('doctors.doctorRef', '_id firstname lastname');
        if(!user.doctors)
            return res.send([]);

        let doctors = [];
        user.doctors.map((doctor) => doctors.push(doctor.doctorRef));
        res.send(doctors);
    } catch(err) {
        res.status(422).send({error: err.message});
    }
});

router.post('/:id/new-meeting', async(req,res) => {
/*
    * Only one patient at same time.
    * Time format is 15 minutes diffrence.
*/
    try {
        const { datetime, body } = req.body;
        let momentDatetime = moment.utc(datetime, DATETIMEFORMAT);
        let timeFormat = momentDatetime.format(TIMEFORMAT);
        let dateFormat = momentDatetime.format(DATEFORMAT);

        // check if the datetime on input is invalid.
        if(!datetime || !momentDatetime.isValid())
            throw { message: 'Invalid date'};
        
        // check if the doctor is exists and linked to the user.
        const doctor = await Doctor.findOne({_id: req.params.id});
        if(!doctor || !doctor.patients.includes(req.user._id))
            throw {message: 'Doctor not found.'};

        // get freetime of doctor work day.
        let freetime = getFullDay(doctor, datetime);
        
        // if entered illegal time or taken.
        if(!freetime.includes(timeFormat)) {
            throw {message: 'Illegal time or already taken.'};
        }

        // search for future meeting. 
        let activeMeeting = await Event.findOne({userId: req.user._id, doctorId: doctor._id, time: {$gt: moment.utc().format('Y-MM-DD HH:mm')}});
        if(activeMeeting)
            throw {message: `Found active future meeting with Dr. ${doctor.firstname} ${doctor.lastname} on ${moment.utc(activeMeeting.time, DATETIMEFORMAT).local().format(DATETIMEFORMAT)}, first cancel this meeting.`}

        // get doctor workday for input day.
        const doctorWorkDay = doctor.workDay.filter((day) => day.date === dateFormat);

        // if found workday
        if(doctorWorkDay && doctorWorkDay.length > 0) {
            // check if another meeting found.
            let timeMeeting = doctorWorkDay[0]['meetings'].find(({time}) => time == timeFormat);
            if(timeMeeting)
                throw {message: `${momentDatetime.local().format(DATETIMEFORMAT)} already taken.`};    
        }
            
        // check if user has event at input time (15 minutes diffrence).
        let userEvents = await Event.findOne({userId: req.user._id, time: {$gte: momentDatetime.clone().subtract(15,'minutes').format(DATETIMEFORMAT), $lte: momentDatetime.clone().add(15, 'minutes').format(DATETIMEFORMAT)}});
        if(userEvents)
            throw {message: 'there is already event at this time'};
        
        // add event to user calender and doctor workday.
        let addToUserEvents = await Event.create({userId: req.user._id, doctorId: req.params.id, title: `Meeting with Dr.${doctor.firstname} ${doctor.lastname}`, body, address: doctor.address, time: momentDatetime.format(DATETIMEFORMAT)});
        let addToDoctorMeetings;
        if(!doctorWorkDay || doctorWorkDay.length === 0) {
            let workDay = {
                date: dateFormat,
                meetings: [{
                    userId: req.user._id,
                    time: timeFormat
                }]
            }
            addToDoctorMeetings = await Doctor.updateOne({_id: req.params.id}, {$addToSet: {'workDay': workDay}});
        }
        else
            addToDoctorMeetings = await Doctor.updateOne({_id: req.params.id, 'workDay.date': dateFormat}, {$addToSet: {'workDay.$.meetings': {userId: req.user._id, time: timeFormat}}});

        if(!addToUserEvents || !addToDoctorMeetings || addToDoctorMeetings.nModified !== 1)
            throw {message: 'Unknown error.'};
        
        res.send({message: `An appointment was scheduled with Dr. ${doctor.firstname} ${doctor.lastname} on ${momentDatetime.local().format(DATETIMEFORMAT)}`});
    } catch(err) {
        res.status(422).send({error: err.message});
    }
});

router.post('/:id/freetime', async (req,res) => {
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