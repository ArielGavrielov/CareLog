const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    
    if(!authorization) return res.status(401).send({code: 401, error: "authorization failed"});

    const token = authorization.replace('Bearer ', '');
    jwt.verify(token, 'kvruAGAPYFCXD3qzNFdWCUdewFYH0ZnC', async (err, payload) => {
        if(err) return res.status(401).send({code: 401, error: 'invalid token'});
        const { userId } = payload;
        const user = await User.findById(userId);
        if(!user) return res.status(401).send({ code: 401, error: "User not found."});
        
        req.user = user;
        next();
    });
};