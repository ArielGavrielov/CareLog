const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Doctor = require('../../models/Doctor');
const Event = require('../../models/Event');
const moment = require('moment');

const TIMEFORMAT = 'HH:mm'
const DATEFORMAT = 'Y-MM-DD'
const DATETIMEFORMAT = 'Y-MM-DD HH:mm';

router.get('/', async (req,res) => {
    try {
        let events = await Event.find({userId: req.user._id});
        events.sort((a,b) => moment.utc(a.time, DATETIMEFORMAT).diff(moment.utc(b.time, DATETIMEFORMAT)));

        /*const eventsFormat = {}; // format for react calendar
        console.log(events);
        events.map((event) => {
            const dateMoment = moment.utc(event.time, DATETIMEFORMAT);
            const dateString = dateMoment.format(DATEFORMAT);
            const timeString = dateMoment.format(TIMEFORMAT);
            if(!eventsFormat[dateString]) eventsFormat[dateString] = [];
            eventsFormat[dateString].push({
                title: event.title, 
                body: event.body, 
                time: timeString, 
                address: event.address,
                id: event._id
            });
        });*/
        //console.log(eventsFormat);
        res.send(events);
    } catch(err) {
        res.status(422).send(err);
    }
});

router.post('/', async (req,res) => {
    try {
        let time = moment(req.body.time, DATETIMEFORMAT, true).utc();
        if(!time.isValid())
            throw {message: 'Invalid date'};
        req.body.time = time.format(DATETIMEFORMAT);

        await Event.create({userId: req.user._id, ...req.body});
        res.send({success: 'Added succuss.'});
    } catch(err) {
        res.status(422).send(err);
    }
});

router.post('/:id', async (req,res) => {
    try {
        if(!req.params.id || req.params.id == '')
            throw {message: 'event id is require.'};


        const {title, body, address, time} = req.body;
        let utcTime = moment(time, DATETIMEFORMAT, true).utc();

        if(!title) throw {message: 'Title is require.'};
        if(!time || !utcTime.isValid()) throw {message: 'Time is require.'};

        let event = await Event.findOne({_id: req.params.id, userId: req.user._id});

        if(!event)
            throw {message: 'Event not found.'};

        let isChanged = {
            title: event.title.localeCompare(title) !== 0,
            address: event.address.localeCompare(address) !== 0,
            time: !moment.utc(event.time, DATETIMEFORMAT).isSame(utcTime),
            body: event.body.localeCompare(body) !== 0
        }

        // if changed meeting params.
        if(event.doctorId && (isChanged.title || isChanged.address || isChanged.time))
            throw {message: 'You cant change meetings title/address/time.'}

        // if nothing changed.
        if(!isChanged.title && !isChanged.address && !isChanged.time && !isChanged.body)
            throw {message: 'Nothing change.'};
        
        let update = await Event.findOneAndUpdate({_id: req.params.id, userId: req.user._id}, {$set: {title, body, address, time: utcTime.format(DATETIMEFORMAT)}}, {new: true});
        
        if(update.nModified == 0)
            throw {message: 'Nothing change.'};
        
        res.send({success: 'Edit success.'});
    } catch(err) {
        res.status(422).send({error: err.message});
    }
        
});

router.delete('/:id', async (req,res) => {
    try {
        let event = await Event.findById(req.params.id);
        if(!event)
            throw {message: 'Event not found.'};
        
        if(event.doctorId && moment().utc().isBefore(moment.utc(event.time, DATETIMEFORMAT), 'hour')) {
            let doctor = await Doctor.findById(event.doctorId);
            let eventDatetime = moment.utc(event.time, DATETIMEFORMAT);
            let workDayIndex = -1;
            doctor.workDay.find((day, index) => {
                let isFound = day.date === eventDatetime.format(DATEFORMAT);
                if(isFound) workDayIndex = index;
                return isFound;
            });

            let spliceIndex = -1;
            doctor.workDay[workDayIndex].meetings.find((meeting, index) => {
                let isFound = meeting.time === eventDatetime.format(TIMEFORMAT);
                if(isFound) spliceIndex = index;
                return isFound;
            });

            if(workDayIndex !== -1 || spliceIndex !== -1) {
                doctor.workDay[workDayIndex].meetings.splice(spliceIndex, 1);
                await doctor.save();
            }
        }
        Event.deleteOne({_id: req.params.id}, (err,data) => {
            if(err || data.n === 0) throw {message: 'Nothing deleted.'};
            else res.send({message: 'Deleted success'}); 
        });
    } catch(err) {
        res.status(422).send({error: err.message});
    }
});

module.exports = router;