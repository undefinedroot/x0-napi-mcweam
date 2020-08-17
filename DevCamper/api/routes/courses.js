const
  express = require('express'),
  {
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
  } = require('../controllers/courses');

const router = express.Router({ mergeParams: true }); /* required parameter */

router
  .route('/')
  .get(getCourses)
  .post(addCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(updateCourse)
  .delete(deleteCourse);

module.exports = router;