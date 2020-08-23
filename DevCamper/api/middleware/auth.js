const jwt = require('jsonwebtoken'),
  asyncHandler = require('./async'),
  ErrorResponse = require('../utils/errorResponse'),
  User = require('../models/User');

// Protect routes, check if user is logged-in with a valid jsonwebtoken on the request header
exports.protectRoute = asyncHandler(async (req, res, next) => {
  let token;

  // let us check the headers
  if (req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')) {

    // Set token from Bearer token in header
    const item = req.headers.authorization.split(' ');
    token = item[item.length - 1];

    // } else if (req.cookies.token) {

    /*
       if you want to use cookies,
       uncomment this else-if block
       and remove the "Auth -> Bearer Token"
       setting from postman scripts
       and make it "Auth -> No Auth"
    */

    //   // Set token from cookie
    //   token = req.cookies.token
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // provide values for req.user
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles, does the logged-in user have the necessary role to use the route?
exports.authorizeRoute = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Please login', 403));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`User role '${req.user.role}' is not authorized to access this route`, 403));
    }
    next();
  }
};