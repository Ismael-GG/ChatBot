import { generateChatResponse } from '../services/gemini.service.js';
import { getEstatutoContext } from '../services/estatuto.service.js';

export async function postChat(req, res, next) {
  try {
    const { message } = req.body;
    const estatutoContext = getEstatutoContext();
    const reply = await generateChatResponse(message, estatutoContext);

    res.status(200).json({
      success: true,
      data: {
        message: reply,
      },
    });
  } catch (error) {
    next(error);
  }
}
