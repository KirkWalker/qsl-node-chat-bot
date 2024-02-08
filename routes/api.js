import express from 'express';
const chatrouter = express.Router();
import chatController from '../controllers/chatController.js'
import ROLES_LIST from '../config/roles_list.js'
import verifyRoles  from '../middleware/verifyRoles.js'

chatrouter.route('/')
    .get(verifyRoles(ROLES_LIST.Admin,ROLES_LIST.Editor),chatController.getAllMessages)
    .post(verifyRoles(ROLES_LIST.Admin),chatController.createNewMessage)

export default chatrouter;