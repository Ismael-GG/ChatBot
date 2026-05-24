import { Router } from 'express';
import { postChat } from '../controllers/chat.controller.js';
import { validateChatMessage } from '../middleware/validateChatMessage.js';

const router = Router();

router.post('/', validateChatMessage, postChat);

export default router;
