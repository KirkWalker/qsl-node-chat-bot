import express from 'express';
const chatrouter = express.Router();
import chatController from '../controllers/chatController.js'

chatrouter.route('/')
    .get(chatController.getAllMessages)
    .post(chatController.createNewMessage)

export default chatrouter;