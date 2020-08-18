const
  express = require('express'),
  {
    getBootcamps,
    createBootcamp,
    getBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload
  } = require('../controllers/bootcamps'),
  courseRouter = require('./courses'), /* Include other resource routers */
  advancedResults = require('../middleware/advancedResults'),
  Bootcamp = require('../models/Bootcamp'),
  {
    protectRoute
  } = require('../middleware/auth');

const router = express.Router();

/* re-route into other routers, we forward the route to courseRouter,
   so example, we use /api/v1/bootcamps/:bootcampId/courses
   it will be sent to; /api/v1/courses
*/
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius);

router.route('/:id/photo')
  .put(protectRoute, bootcampPhotoUpload);

router.route('/')
  /* using middleware for this method, passing the 'model' and 'virtual property name' */
  .get(advancedResults(Bootcamp, 'courses_virtual'), getBootcamps)
  .post(protectRoute, createBootcamp);

router.route('/:id')
  .get(getBootcamp)
  .put(protectRoute, updateBootcamp)
  .delete(protectRoute, deleteBootcamp);

module.exports = router;