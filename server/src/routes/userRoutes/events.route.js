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
        req.body.time = moment(req.body.time, DATETIMEFORMAT).utc().format(DATETIMEFORMAT);
        let event = await Event.create({userId: req.user._id, ...req.body});
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

        let event = await Event.findOneAndUpdate({_id: req.params.id, userId: req.user._id}, {$set: {title, body, address, time: utcTime.format(DATETIMEFORMAT)}}, {new: true});

        if(!event)
            throw {message: 'Event not found.'};
        
        if(event.nModified == 0)
            throw {message: 'Nothing change.'};
        
        res.send({success: 'Edit success.'});
    } catch(err) {
        res.status(422).send({error: err.message});
    }
        
});

router.delete('/:id', async (req,res) => {
    let event = await Event.findById(req.params.id);
    if(event.doctorId && moment().isBefore(moment.utc(event.time, DATETIMEFORMAT), 'date')) {
        let doctor = await Doctor.findById(event.doctorId);
        let eventDatetime = moment.utc(event.time, DATETIMEFORMAT);
        let removeMeeting = await Doctor.updateOne({_id: doctor._id, 'workDay.date': eventDatetime.format(DATEFORMAT)},
        {$pull: {'workDay.$.meetings': {userId: req.user._id, time: eventDatetime.format(TIMEFORMAT)}}});
        console.log(removeMeeting);
    }
    Event.deleteOne({_id: req.params.id}, (err,data) => {
        if(err || data.n === 0) res.status(422).send({error: 'Event not found.'});
        else res.send(data); 
    });
});

module.exports = router;