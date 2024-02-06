import helper from '../middleware/helper.js';
import OpenAI from '../middleware/openai.js';

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
    res.json(final)
}

const createNewMessage = async (req, res) => {
    console.log("createNewMessage",req.body);
    try {
        const response = await OpenAI.agent(req.body.message,req.body.name);
        console.log("createNewMessage response:",response);
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