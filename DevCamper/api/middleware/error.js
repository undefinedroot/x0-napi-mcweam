const ErrorResponse = require("../utils/errorResponse");

// middleware that serves as a catch-all
const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Log to console for dev
  console.log(err);

  // Mongoose bad ObjectId (incorrectly formatted)
  if (err.name === 'CastError') {
    error = new ErrorResponse(`Resource not found with id of ${err.value}`, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error = new ErrorResponse('Duplicate field value entered', 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message); /* extract error message from mongoose schema */
    error = new ErrorResponse(message, 400);
  }

  // does 'err' object contain a 'statusCode' property?
  res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Server Error' });
}

module.exports = errorHandler;
