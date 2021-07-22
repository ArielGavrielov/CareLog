const User = require("../models/User");
const resetToken = require("../models/ResetPassToken");
const sendEmail = require("../utils/sendMail");
const express = require("express");
const router = express.Router();

router.post('/', async (req,res) => {
    try {
        const { email, birthdate } = req.body;
        if(!email || !birthdate) return res.status(422).send({ code: 422, error: 'You must fill all inputs.'});

        let user = await User.findOne({email, birthdate});
        if(!user) return res.status(422).send({code: 422, error: 'User not found.'});

        let token = await resetToken.findOne({userId: user._id});
        if(!token) {
            token = await resetToken.create({
                userId: user._id,
                token: Math.floor(Math.random()*99999) + 10000
            });
        }
        await sendEmail(email, "CareLog - Reset password", "The code for reset password is: " + token.token);

        return res.send({message: 'The code was sent, check your mail.'});
    } catch(e) {
        return res.status(422).send({code: 422, error: 'Something went wrong with reset password'});
    }
});

router.post("/:userId/:token", async (req, res) => {
    try {
        if(!req.body.password) return res.status(422).send({code: 422, error: 'You must specify new password'});
        let user = await User.findById(req.params.userId);
        if(!user) return res.status(422).send({code: 422, error: 'User not found'});

        let token = await resetToken.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if(!token) return res.status(400).send({code: 422, error: 'Invalid token or expired'});

        user.password = req.body.password;
        await user.save();
        await token.delete();

        res.send({message: 'Password reset sucessfully.'});
    } catch(e) {
        res.status(422).send({code: 422, error: 'Something went wrong with reset password'});
        console.log(e);
    }
});

module.exports = router;