import { Router } from "express";
import { deleteConversation, getConversations, getMessages, getOrCreatedConversation, sendMessage } from "../controllers/messageController.js";
import upload from "../middlewares/upload.js";

const messageRouter = Router();

messageRouter.get('/conversations', getConversations);
messageRouter.get('/conversations/:conversationId/messages', getMessages);
messageRouter.get('/conversations/with/:targetUserId', getOrCreatedConversation);
messageRouter.post('/send',upload.single("file"), sendMessage);

messageRouter.delete('/conversations/:conversationId', deleteConversation)

export default messageRouter;