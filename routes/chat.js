import express from 'express';
const chatrouter = express.Router();
import chatController from '../controllers/chatController.js'

chatrouter.route('/')
    .get(chatController.getAllMessages)
    .post(chatController.createNewMessage)
    .put(chatController.updateMessage)
    .delete(chatController.deleteMessage);

chatrouter.route('/:id')
    .get(chatController.getMessage);

export default chatrouter;