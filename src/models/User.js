const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Note = require('./Note');

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email.");
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value){
            if(!validator.isLength(value, {min: 6, max: undefined})){
                throw new Error("Length must be greater than 6.")
            } else if(value.toLowerCase().includes("password")){
                throw new Error("The password should not contain password keyword.");
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
    }, 
    {
        timestamps: true,
    });

userSchema.virtual('notes', {
    ref: 'note',
    localField: '_id',
    foreignField: 'owner'
});

//Before the user is saved, check if password is modified (or created) and hash the password.
userSchema.pre('save', async function(next) {
    const user = this;
    
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    };

    next();
});

userSchema.pre('remove', async function(next) {
    const user = this;
    await Note.deleteMany({owner: user._id});
    next();
})

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
}

userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, 'sjoC52WAE54s2');
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({email: email});

    if(!user){
        throw new Error("Unable to find user.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error("Unable to login.");
    }
    return user;
}


const User = mongoose.model('user', userSchema);

module.exports=User;