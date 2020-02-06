const express = require('express');
const router= express.Router();
const auth = require('../middleware/auth');

require('../db/mongoose');

const User = require('../models/User');

router.post('/users/login', async(req, res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.status(200).send({user, token});
    }catch(e){
        res.status(400).send(e);
    }
});

router.get('/users/me/logout', auth, async(req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !==  req.token;
        })
        await req.user.save();
        res.status(200).send("Logout successful!");
    }catch(e){
        res.status(500).send();
    }
});

router.get('/users/logoutAll', auth, async(req, res) => {
    try{
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send("Done!");
    }catch(e){
        res.status(500).send(e);
    }
});

router.get('/users/me', auth, async (req, res) => {
    // const _id = req.params.id;
    // try{
    //     const user = await User.findById(_id);
    //     if(!user){
    //         return res.status(404);
    //     }    
        res.status(200).send(req.user);
    // }catch(e){
    //     res.status(400).send(e);
    // }
});

router.post('/users', async (req, res)=>{
    try{
        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    }catch(e){
        res.status(400).send(e);
    }
});

router.patch('/users/me', auth, async (req, res) => {
    
    const patchRequests=Object.keys(req.body);

    const patchables = ['name', 'email', 'password'];

    const isValid = patchRequests.every((patchRequest) => patchables.includes(patchRequest));

    if(!isValid){
        return res.status(400).send({error: 'Invalid Updates.'});
    }

    try{
        patchRequests.forEach((patchRequest) => {
            req.user[patchRequest] = req.body[patchRequest];
        });

        await req.user.save();
        res.status(201).send(req.user);
    }catch(e){
        res.status(500).send(e);
    };
});

router.delete('/users/me', auth, async (req, res) => {

    try{
        await req.user.remove();
        res.status(200).send(req.user);
    }catch(e){
        res.status(500).send(e);
    }
});

module.exports = router;