const
  ErrorResponse = require('../utils/errorResponse'),
  asyncHandler = require('../middleware/async'),
  User = require('../models/User');

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  // Create user
  const user = await User.create({ name, email, password, role });

  sendTokenResponse(user, 200, res);
});

// @desc      Login User
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if both 'email' and 'password' fields exist on request
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user if exists, let us also include the password field for validation (because it is not included on model)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid Credentials', 401));
  }

  // Check if password matches using the matchPassword() method from the model
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid Credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token using a method that is available when model is initiated only, different from statics
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true; /* send in https */
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};

// @desc      Get current logged in user
// @route     POST /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorResponse('Please login', 403));
  }

  const user = await User.findById(req.user.id); /* user exists on req if we access it via login or register */

  if (user) {
    res.status(200).json({
      success: true,
      data: user
    })
  } else {
    return next(new ErrorResponse('Invalid Credentials', 401));
  }
});