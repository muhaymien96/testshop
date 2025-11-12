module.exports = (err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    code: err.status || 500,
    timestamp: new Date().toISOString()
  });
};