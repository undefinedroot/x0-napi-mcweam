const
  express = require('express'),
  {
    getBootcamps,
    createBootcamp,
    getBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius
  } = require('../controllers/bootcamps'),
  courseRouter = require('./courses'); /* Include other resource routers */

const router = express.Router();

/* re-route into other routers, we forward the route to courseRouter,
   so example, we use /api/v1/bootcamps/:bootcampId/courses
   it will be sent to; /api/v1/courses
*/
router
  .use('/:bootcampId/courses', courseRouter);

router
  .route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius);

router
  .route('/')
  .get(getBootcamps)
  .post(createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;