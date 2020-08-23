const
  express = require('express'),
  {
    getReviews,
    getReview,
    addReview
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
  .get(advancedResults(Review, { path: 'bootcamp', select: 'name description' }), getReviews)
  .post(protectRoute, authorizeRoute('user', 'admin'), addReview);

router
  .route('/:id')
  .get(getReview);

module.exports = router;