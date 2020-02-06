const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config({path: 'config/dev.env'});
const secretKey = process.env.JWTSECRET;

const auth = async(req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, secretKey);
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token});
        if(!user){
            throw new Error();
        }
        req.user = user;
        req.token = token;
        next();
    }catch(e){
        res.status(401).send("Unable to authenticate.");
    }

}

module.exports=auth;