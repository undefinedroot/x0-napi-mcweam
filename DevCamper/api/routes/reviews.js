const
  express = require('express'),
  { ROLE } = require('../utils/rolesEnum'),
  {
    getReviews,
    getReview,
    addReview,
    updateReview,
    deleteReview
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
  .post(protectRoute, authorizeRoute(ROLE.USER, ROLE.ADMIN), addReview);

router
  .route('/:id')
  .get(getReview)
  .put(protectRoute, authorizeRoute(ROLE.USER, ROLE.ADMIN), updateReview)
  .delete(protectRoute, authorizeRoute(ROLE.USER, ROLE.ADMIN), deleteReview);

module.exports = router;