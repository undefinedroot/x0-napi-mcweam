const
  path = require('path'),
  ErrorResponse = require('../utils/errorResponse'), /* custom class to modify passed error object */
  asyncHandler = require('../middleware/async'),
  geocoder = require('../utils/geocoder'),
  Bootcamp = require('../models/Bootcamp');

// NOTE: always specify the Content-Type on the header at postman if you need to pass a JSON object (use the presets)

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // let us use the property that the middleware 'advancedResults' provides
  res.status(200).json(res.ar_prop);
});
//#region
/* old code:
  exports.getBootcamps = async (req, res, next) => {
    try {
      const bootcamps = await Bootcamp.find();
      res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
    } catch (err) {
      next(err);
    }
  }
*/
//#endregion

// @desc      Create new bootcamp
// @route     POST /api/v1/bootcamps
// @access    Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id; /* the logged in user id will be used */

  // checked for published bootcamps
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id }); /* find all bootcamps by this user */

  // if the user is not an admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(new ErrorResponse(`The user with ID '${req.user.id}' has already published a bootcamp`, 400));
  }

  const bootcamp = await Bootcamp.create(req.body); /* use built in method to create new document */

  res.status(201).json({ success: true, data: bootcamp });
});

// @desc      Get single bootcamp
// @route     GET /api/v1/bootcamps/:id
// @access    Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc      Update bootcamp
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc      Delete bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  // cascading delete will not work with this
  //const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }

  bootcamp.remove(); // this will trigger the middleware for cascading delete

  res.status(200).json({ success: true, data: {} });
});

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lag/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km

  const radius = distance / 6378;

  /* https://docs.mongodb.com/manual/reference/operator/query/centerSphere/ */
  /* using mongodb query operator '$*' */
  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius]
      }
    }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });

});

// @desc      Upload photo for bootcamp
// @route     PUT /api/v1/bootcamps/:id/photo
// @access    Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // make sure the image is a photo via mimetype
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // check filesize, currently 1000000 = 1mb
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    const file_size = Math.floor(process.env.MAX_FILE_UPLOAD / 1000 / 1000).toFixed(0);
    return next(new ErrorResponse(`Please upload an image less than ${file_size} MB.`, 400));
  }

  // create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  // move to the upload path
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});