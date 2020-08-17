const
  express = require('express'),
  {
    getCourses
  } = require('../controllers/courses');

const router = express.Router({ mergeParams: true }); /* required parameter */

router
  .route('/')
  .get(getCourses);

module.exports = router;