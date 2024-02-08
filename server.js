import express from 'express';
const app = express();
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import corsOptions from './config/corsOptions.js';
import errorHandler from './middleware/errorHandler.js';
import readline from "readline";
import verifyJWT  from './middleware/verfiyJWT.js';
import credentials  from './middleware/credentials.js';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import connectDB from './config/dbConn.js';
connectDB();

//change this to update the name chatbot uses to address the user
const sytem_user = "SystemUser";

//from the env file
const PORT = process.env.PORT || 3500;

//handle local user interactions
import OpenAI from './middleware/openai.js';
const userInterface = readline.createInterface({
    input: process.stdin
})

userInterface.prompt()
userInterface.on("line", async input => {
    //console.log("input recieved");
    const response = await OpenAI.agent(input,"SystemUser");
    console.log(response[0].text.value);
    userInterface.prompt();
})



//security middleware
app.use(credentials)
app.use(cors(corsOptions));
app.use(errorHandler);

//middleware for cookies
app.use(cookieParser());

// built-in middleware to handle urlencoded data
// in other words, form data: ‘content-type: application/x-www-form-urlencoded’
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json 
app.use(express.json());

//serve static files
app.use(express.static(join(__dirname, '/public')));

import regrouter from './routes/register.js'
app.use('/register', regrouter);

import authrouter from './routes/auth.js'
app.use('/auth', authrouter);

import refreshrouter from './routes/refresh.js'
app.use('/refresh', refreshrouter);

import logoutrouter from './routes/logout.js'
app.use('/logout', logoutrouter);

//all routes blow this stement will require a token
app.use(verifyJWT);

//serve api requests
import chatrouter from './routes/api.js'
app.use('/chat', chatrouter);

//handle 404 requests
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(join(__dirname, 'public', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

mongoose.connection.once('open', () => {
    if (process.env.NODE_ENV === 'dev' || !process.env.NODE_ENV) {
        console.log("connected to mongo DB");
        app.listen(PORT, () => { console.log(`Server running on port ${PORT}`) });
    }
});