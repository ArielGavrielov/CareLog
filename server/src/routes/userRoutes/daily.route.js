const express = require('express');
const router = express.Router();
const moment = require('moment');

const TIMEFORMAT = 'HH:mm'
const DATEFORMAT = 'Y-MM-DD'
const DATETIMEFORMAT = 'Y-MM-DD HH:mm';
const COLORS = ['red', 'orange', 'yellow', 'green'];

// toFixed() returns string, multiplier with 1 to change it to number.
const calcIndexOfColor = (percentage=0) => parseInt(((percentage.toFixed(2) * 1) / 33.33));

router.get('/', (req,res) => {
    try {
        const progresses = [];
        // steps
        if(!req.user.dailySteps || !moment.utc(req.user.dailySteps[req.user.dailySteps.length-1].date, 'Y-MM-DD').isSame(moment.utc(), 'day'))
            progresses.push({title: 'Steps', extraText: `0/3000`, config: {max: 3000, value: 0, colorScheme: COLORS[0]}});
        else {
            let steps = req.user.dailySteps[req.user.dailySteps.length-1].steps;
            progresses.push({title: 'Steps', extraText: `${steps}/3000`, config: {max: 3000, value: steps, colorScheme: COLORS[calcIndexOfColor(steps/3000*100)]}});
        }

        // indices
        let unFilled = [];
        let indicesKeys = ['blood', 'pulse', 'bodyheat', 'oxygen'];

        if(!req.user.indices)
            unFilled = indicesKeys;
        else
            indicesKeys.map((indice) => {
                let lastIndex = req.user.indices[indice].length-1;
                if(lastIndex == -1 || !req.user.indices[indice][lastIndex] || !moment.utc(req.user.indices[indice][lastIndex].time, DATETIMEFORMAT).isSame(moment.utc(), 'day'))
                    unFilled.push(indice);
            });
        
        let filledNum = indicesKeys.length-unFilled.length;

        progresses.push({
            title: 'Indices',
            config: {
                min: 0,
                max: indicesKeys.length,
                value: filledNum,
                colorScheme: COLORS[calcIndexOfColor(filledNum/indicesKeys.length*100)]
            }
        });

        // Medicines
        if(req.user.medicines && req.user.medicines.length > 0) {
            let numToTake = 0;
            let numTaken = 0;
            req.user.medicines.map((medicine) => {
                numToTake += medicine.times.length;

                if(medicine.taken && medicine.taken.length > 0 && moment.utc(medicine.taken[medicine.taken.length-1].date, DATETIMEFORMAT).isSame(moment.utc(), 'day'))
                    numTaken += medicine.taken[medicine.taken.length-1].time.length;
            });
            progresses.push({
                title: 'Medicines',
                config: {
                    min: 0,
                    max: numToTake,
                    value: numTaken,
                    colorScheme: COLORS[calcIndexOfColor(numTaken/numToTake*100)]
                }
            });
        }

        res.send(progresses);
    } catch(err) {
        console.log(err);
        res.status(422).send({error: err.message});
    }
});

router.post('/update-steps', (req,res) => {
    try {
        const { steps } = req.body;
        if(!steps) throw {message: 'Steps missing.'};
        let dailyIndex = -1;
        req.user.dailySteps.find((value, index) => {
            const isFound = moment.utc(value.date, 'Y-MM-DD').isSame(moment.utc(), 'day');
            if(isFound)
                dailyIndex = index;
            return isFound;
        });

        if(dailyIndex !== -1)
            req.user.dailySteps[dailyIndex] = {steps};
        else
            req.user.dailySteps.push({steps});
        
        req.user.save((err,data) => {
            if(err)
                throw err;
            console.log(steps);
            res.send({success: true});
        });
    } catch(err) {
        res.status(422).send({error: err.message});
    }
});

module.exports = router;