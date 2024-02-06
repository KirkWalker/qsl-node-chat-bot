import { readFile } from 'fs/promises';
import helper from '../middleware/helper.js';
import agent from '../middleware/openai.js';
const BOT_NAME = process.env.BOT_NAME || "BOT";
const BOT_IMG = process.env.BOT_IMG;

const messages = JSON.parse(
  await readFile(
    new URL('../model/messages.json', import.meta.url)
  )
);

const data = {
    messages,
    setMessages: function (data) { this.messages = data }
};

const getAllMessages = (req,res) => {
    res.json(data.messages);
    
}

const createNewMessage = async (req, res) => {
    const newMessage = {
        id: data.messages[data.messages.length - 1].id + 1 || 1,
        name: req.body.name,
        message: req.body.message,
        img: "https://img.icons8.com/?size=77&id=23261&format=png",
        time: helper.formatDate(new Date)
    }
    //console.log("createNewMessage",req.body);
    data.setMessages([...data.messages, newMessage])
    try {
        const response = await agent(req.body.message);
        console.log("createNewMessage response:",response);
        res.status(201).json({"name":BOT_NAME,"img":BOT_IMG,"message":response[0].text.value});
    } catch (err){
        console.error(err);
    }
    
}

const updateMessage = (req, res) => {
    const message = data.messages.find(mes => mes.id === parseInt(req.body.id));
    if (!message) {
        return res.status(400).json({ "message": `Message ID ${req.body.id} not found` });
    }
    if (req.body.name) message.name = req.body.name;
    if (req.body.message) message.message = req.body.message;
    const filteredArray = data.messages.filter(mes => mes.id !== parseInt(req.body.id));
    const unsortedArray = [...filteredArray, message];
    data.setMessages(unsortedArray.sort((a, b) => a.id > b.id ? 1 : a.id < b.id ? -1 : 0));
    res.json(data.messages);
}

const deleteMessage = (req, res) => {
    const message = data.messages.find(mes => mes.id === parseInt(req.body.id));
    if (!message) {
        return res.status(400).json({ "message": `Message ID ${req.body.id} not found` });
    }
    const filteredArray = data.messages.filter(mes => mes.id !== parseInt(req.body.id));
    data.setMessages([...filteredArray]);
    res.json(data.messages);
}

const getMessage = (req,res) => {
    const message = data.messages.find(mes => mes.id === parseInt(req.params.id));
    if (!message) {
        return res.status(400).json({ "message": `Message ID ${req.params.id} not found` });
    }
    res.json(message);
}

export default { 
    getMessage, 
    deleteMessage, 
    updateMessage, 
    createNewMessage, 
    getAllMessages
}