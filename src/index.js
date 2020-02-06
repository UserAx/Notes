const express = require('express');
const dotenv = require('dotenv');

const app=express();
const port = process.env.PORT || 3000;

const userRouter = require('./routers/UserRouter');
const noteRouter = require('./routers/NoteRouter');

app.use(express.json());
app.use(userRouter);
app.use(noteRouter);

app.listen(port, () => {
    console.log('Console up in port:', port);
});