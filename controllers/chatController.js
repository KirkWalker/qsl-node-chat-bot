import helper from '../middleware/helper.js';
import OpenAI from '../middleware/openai.js';
import { readFile } from 'fs/promises';

const debug_level = 1

const getStartingMessage = async (req,res) => {
    const messages = JSON.parse(
        await readFile(
        new URL('../model/messages.json', import.meta.url)
        )
    );
    
    const data = {
        messages,
        setMessages: function (data) { this.messages = data }
    };
    return data.messages[0];
}



const getAllMessages = async (req,res) => {
    let final = [];
    const mes = await OpenAI.getMessages();
    mes.body.data.reverse().forEach(message => {
        final.push({
            "role":message.role,
            "message":message.content[0].text.value,
            "time":helper.formatDate(message.created_at),
            "id":message.id
        });   
    });

    if(final.length <1) {
        if(debug_level < 2) console.log("Starting new thread");
        final.push(await getStartingMessage());
    }
   
    res.json(final)
}

const createNewMessage = async (req, res) => {
    if(debug_level < 2) console.log("createNewMessage",req.body);
    try {
        const response = await OpenAI.agent(req.body.message,req.body.name);
        if(debug_level < 2) console.log("createNewMessage response:",response);
        res.status(201).json({
            "role":"agent",
            "message":response[0].text.value});
    } catch (err){
        console.error(err);
    }
}

export default { 
    createNewMessage, 
    getAllMessages
}