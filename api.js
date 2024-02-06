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

//handle local promts
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


//change this to update the name chatbot uses to address the user
const sytem_user = "SystemUser";


const PORT = process.env.PORT || 3500;

//security middleware
app.use(cors(corsOptions));
app.use(errorHandler);

// built-in middleware to handle urlencoded data
// in other words, form data: ‘content-type: application/x-www-form-urlencoded’
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json 
app.use(express.json());

//serve static files
app.use(express.static(join(__dirname, '/public')));

//serve api requests
import chatrouter from './routes/chat.js'
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

//start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




