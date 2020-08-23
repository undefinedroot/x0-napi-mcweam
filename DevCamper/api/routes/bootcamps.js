const
  express = require('express'),
  { ROLE } = require('../utils/rolesEnum'),
  {
    getBootcamps,
    createBootcamp,
    getBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload
  } = require('../controllers/bootcamps'),
  courseRouter = require('./courses'),
  reviewRouter = require('./reviews'),
  advancedResults = require('../middleware/advancedResults'),
  Bootcamp = require('../models/Bootcamp'),
  {
    protectRoute,
    authorizeRoute
  } = require('../middleware/auth');

const router = express.Router();

/*
   re-route into other routers, we forward the route to courseRouter,
   so example, we use /api/v1/bootcamps/:bootcampId/courses
   it will be sent to; /api/v1/courses
*/
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius);

router.route('/:id/photo') /* NOTE: the 'protect..' and 'authorize...' should be in order */
  .put(protectRoute, authorizeRoute(ROLE.PUBLISHER, ROLE.ADMIN), bootcampPhotoUpload);

router.route('/')
  /* using 'advancedResults' middleware, passing the 'Bootcamp model' and 'virtual property name' */
  .get(advancedResults(Bootcamp, 'courses_virtual'), getBootcamps)
  .post(protectRoute, authorizeRoute(ROLE.PUBLISHER, ROLE.ADMIN), createBootcamp);

router.route('/:id')
  .get(getBootcamp)
  .put(protectRoute, authorizeRoute(ROLE.PUBLISHER, ROLE.ADMIN), updateBootcamp)
  .delete(protectRoute, authorizeRoute(ROLE.PUBLISHER, ROLE.ADMIN), deleteBootcamp);

module.exports = router;