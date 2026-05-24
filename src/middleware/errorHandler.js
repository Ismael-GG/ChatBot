export function notFoundHandler(_req, res) {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada.',
  });
}

export function errorHandler(err, _req, res, _next) {
  console.error('[Error]', err);

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500
      ? 'Error interno del servidor. Intente nuevamente más tarde.'
      : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}
