const
  express = require('express'),
  {
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
  } = require('../controllers/courses'),
  Course = require('../models/Course'),
  advancedResults = require('../middleware/advancedResults'),
  {
    protectRoute,
    authorizeRoute
  } = require('../middleware/auth');

const router = express.Router({ mergeParams: true }); /* required parameter */

router.route('/')
  /* using middleware for this method, passing the 'model' and 'object relationship' */
  .get(advancedResults(Course, { path: 'bootcamp', select: 'name description' }), getCourses)
  .post(protectRoute, authorizeRoute('publisher', 'admin'), addCourse);

router.route('/:id')
  .get(getCourse)
  .put(protectRoute, authorizeRoute('publisher', 'admin'), updateCourse)
  .delete(protectRoute, authorizeRoute('publisher', 'admin'), deleteCourse);

module.exports = router;