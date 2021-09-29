const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    if(!authorization) return res.status(401).send({code: 401, error: "authorization failed"});

    const token = authorization.replace('Bearer ', '');
    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
        if(err) return res.status(401).send({code: 401, error: 'invalid token'});
        const { userId } = payload;
        const user = await User.findOne({_id: userId});
        if(!user) return res.status(401).send({ code: 401, error: "User not found."});

        req.user = user;
        next();
    });
};