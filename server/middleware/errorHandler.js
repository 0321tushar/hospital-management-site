// 404 Route Not Found Middleware
export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Global Error Handler Middleware
export const errorHandler = (err, req, res, next) => {
  console.error('[API Exception]:', err.stack || err.message);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected server error occurred'
  });
};
