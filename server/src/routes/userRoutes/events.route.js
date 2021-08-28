const express = require('express');
const router = express.Router();
const User = require('../../models/User');
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
        res.send(event);
    } catch(err) {
        res.status(422).send(err);
    }
});

router.delete('/:id', async (req,res) => {
    Event.deleteOne({_id: req.params.id}, (err,data) => {
        if(err || data.n === 0) res.status(422).send({error: 'Event not found.'});
        else res.send(data); 
    });
});

module.exports = router;