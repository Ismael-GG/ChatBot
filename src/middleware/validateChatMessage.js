export function validateChatMessage(req, res, next) {
  const { message } = req.body ?? {};

  if (typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'El campo "message" es obligatorio y debe ser una cadena de texto no vacía.',
    });
  }

  req.body.message = message.trim();
  next();
}
