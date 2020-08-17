const
  ErrorResponse = require('../utils/errorResponse'), /* custom class to modify passed error object */
  asyncHandler = require('../middleware/async'),
  Course = require('../models/Course');

// @desc      Get courses
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    query =
      Course
        .find({ bootcamp: req.params.bootcampId })
        .populate({ path: 'bootcamp', select: 'name description' }); /* link to 'bootcamp' relationship */
  } else {
    query =
      Course
        .find()
        .populate({ path: 'bootcamp', select: 'name description' }); /* link to 'bootcamp' relationship */
  }

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});