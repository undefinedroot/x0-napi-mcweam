const ErrorResponse = require('../utils/errorResponse'); /* custom class to modify passed error object */
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// NOTE: always specify the Content-Type on the header at postman if you need to pass a JSON object (use the presets)

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  // copy req.query
  const reqQuery = { ...req.query };

  // fields to exclude on filtering (these are the keywords that should not appear as value of fields in a query)
  const removeFields = ['select', 'sort'];

  // loop  over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // create query string
  let queryStr = JSON.stringify(reqQuery); /* make the query as a string so that we can manipulate it */

  // retrieve all operators via regular expression, and then append '$' prefix to use advanced filtering
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // find resource
  query = Bootcamp.find(JSON.parse(queryStr));

  // select fields, so that we only want to retrieve specific fields
  if (req.query.select) {
    // make value of query from 'select' property into space separated string for mongodb
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields); /* this function is from mongoose */
  }

  // sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy); /* this function is from mongoose */
  } else { /* default by date */
    query = query.sort('-createdAt');
  }

  // execute query
  const bootcamps = await query;

  res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
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
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }
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