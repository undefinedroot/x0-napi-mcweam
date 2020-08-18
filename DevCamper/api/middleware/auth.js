const jwt = require('jsonwebtoken'),
  asyncHandler = require('./async'),
  ErrorResponse = require('../utils/errorResponse'),
  User = require('../models/User');

// Protect routes
exports.protectRoute = asyncHandler(async (req, res, next) => {
  let token;

  // let us check the headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const item = req.headers.authorization.split(' ');
    token = item[item.length - 1];
  }
  // else if (req.cookies.token) {
  //   token = req.cookies.token
  // }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});