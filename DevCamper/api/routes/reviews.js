const
  express = require('express'),
  {
    getReviews,
    getReview
  } = require('../controllers/reviews'),
  Review = require('../models/Review'),
  advancedResults = require('../middleware/advancedResults'),
  {
    protectRoute,
    authorizeRoute
  } = require('../middleware/auth');

const router = express.Router({ mergeParams: true }); // for re-routing

router
  .route('/')
  .get(advancedResults(Review, { path: 'bootcamp', select: 'name description' }), getReviews);

router
  .route('/:id')
  .get(getReview);

module.exports = router;