const ErrorResponse = require("../utils/errorResponse");

// this is only used on server.js as middleware, serves as a catch-all
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
    // extract error message from mongoose schema
    const messages = Object.values(err.errors).map(error => error.message);

    error = new ErrorResponse(messages, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({
      success: false,
      error: error.message || 'Server Error'
    });
}

module.exports = errorHandler;
