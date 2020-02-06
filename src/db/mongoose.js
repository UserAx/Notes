const mongoose = require('mongoose');

const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config({path: 'config/dev.env'});

const dataSource = process.env.MONGOURL;

mongoose.connect(dataSource, {useUnifiedTopology: true, useCreateIndex: true});

// const user = new User({
//     username: "Letter",
//     email: "letterfaek@gmail.com",
//     password: "RED123"
// });

// user.save().then((result) => {
//     console.log(result);
// }).catch((e)=>{
//     console.log(e);
// });