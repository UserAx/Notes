const express = require('express');
const router= express.Router();
const dotenv = require('dotenv');

const auth = require('../middleware/auth');

require('../db/mongoose');
const multer = require('multer');
const Note = require('../models/Note');

const upload = multer({
    limits:{
        fileSize: 10000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(doc|docx|pdf)$/)){
            return cb(new Error("Unsupported content type."));
        }
        cb(undefined, true);
    }
});

router.post('/notes/:id/attachment', auth, upload.single('upload'), async(req, res)=>{
    const note = await Note.findOne({_id: req.params.id, owner: req.user._id});
    note.attachment = req.file.buffer;
    await note.save();
    res.send();
}, (error, req, res, next)=>{
    res.status(400).send({error: error.message});
});

router.delete('/notes/:id/attachment', auth, upload.single('upload'), async(req, res)=>{
    const note = await Note.findOne({_id: req.params.id, owner: req.user._id});
    note.attachment = [];
    await note.save();
    res.send();
}, (error, req, res, next)=>{
    res.status(400).send({error: error.message});
});

router.get('/notes', auth, async(req, res)=>{
    
    try{
        const sort = {};

        if(req.query.sortBy){
            const parts = req.query.sortBy.split('_');
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        }
        await req.user.populate({path: 'notes',
                                options: {
                                    limit: parseInt(req.query.limit),
                                    skip: parseInt(req.query.skip),
                                    sort 
                                }}).execPopulate();
        res.status(200).send(req.user.notes);
    }catch(e){
        res.status(500).send(e);
    }
});

router.get('/notes/:id', auth, async (req, res)=>{
    
    try{
        const note = await Note.findOne({_id: req.params.id, owner: req.user._id});

        if(!note){
            return res.status(404).send();
        }
        
        res.status(200).send(note);

    }catch(e){
        res.status(400).send(e);
    }
});

router.post('/notes', auth, async (req, res)=>{
    const note = new Note({...req.body, 
                            owner : req.user._id});
    try{
        await note.save();
        res.status(201).send(note);
    }catch(e){
        res.status(400).send(e);
    }
});

router.patch('/notes/:id', auth, async (req, res)=>{
    const patchables=['title', 'content'];

    const patchRequests = Object.keys(req.body);

    const isValid = patchRequests.every((patchRequest) => patchables.includes(patchRequest));

    if(!isValid){
        return res.status(400).send({error: "Invalid Patches."});
    }

    try{
        const note = await Note.findOne({_id: req.params._id, owner: req.params.id});
        if(!note){
            return res.status(404).send();
        }
        patchRequests.every((patchRequest)=>{
            note[patchRequest] = req.body[patchRequest];
        });
        await note.save();
        res.status(201).send(note);
    }catch(e){
        res.status(500).send(e);
    }
});

router.delete('/notes/:id', auth, async (req, res)=>{
    try{
        const note = await Note.findOneAndDelete({_id: req.params._id, owner: req.params.id});
        if(!note){
            return res.status(404).send();
        }
        res.status(200).send(note);
    }catch(e){
        res.status(500).send(e);
    }
});

module.exports = router;