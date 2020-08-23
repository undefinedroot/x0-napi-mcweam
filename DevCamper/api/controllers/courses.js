const
  ErrorResponse = require('../utils/errorResponse'), /* custom class to modify passed error object */
  asyncHandler = require('../middleware/async'),
  Course = require('../models/Course'),
  Bootcamp = require('../models/Bootcamp');

// @desc      Get courses
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    })
  } else {
    // this property exists because we passed the middleware on the route
    res.status(200).json(res.ar_prop);
  }

});

// @desc      Get single course
// @route     GET /api/v1/courses/:id
// @access    Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course =
    await Course
      .findById(req.params.id)
      .populate({
        path: 'bootcamp',
        select: 'name description'
      })

  if (!course) {
    return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404);
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc      Add single course
// @route     POST /api/v1/:bootcampId/courses
// @access    Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId; /* reassign the id from parameter */

  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`), 404);
  }

  // make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User '${req.user.id}' is not authorized to add a course to bootcamp '${bootcamp._id}'`, 401));
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc      Update course
// @route     PUT /api/v1/courses/:id
// @access    Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404);
  }

  // make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User '${req.user.id}' is not authorized to update course '${course._id}'`, 401));
  }

  /* do not forget to set the Content-Type on postman */

  course = await Course.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      new: true,
      runValidators: true
    }, async function (err, doc, res) {
      // we can't use any middleware during update, so trigger the recalculation of averageRating here
      await Course.getAverageCost(doc.bootcamp);
    });

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc      Delete course
// @route     DELETE /api/v1/courses/:id
// @access    Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404);
  }

  // make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User '${req.user.id}' is not authorized to delete course '${course._id}'`, 401));
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});