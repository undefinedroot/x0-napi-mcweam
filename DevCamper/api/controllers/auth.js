const
  ErrorResponse = require('../utils/errorResponse'),
  asyncHandler = require('../middleware/async'),
  User = require('../models/User');

// @desc      Register user
// @route     GET /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  // Create user
  const user = await User.create({
    name, email, password, role
  });

  // Create token using a method that is available when model is initiated only, different from statics
  const token = user.getSignedJwtToken();

  res.status(200).json({ success: true, token });
});