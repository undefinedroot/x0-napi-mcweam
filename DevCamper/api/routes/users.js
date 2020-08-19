const
  express = require('express'),
  {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
  } = require('../controllers/users'),
  advancedResults = require('../middleware/advancedResults'),
  {
    protectRoute,
    authorizeRoute
  } = require('../middleware/auth'),
  User = require('../models/User');

const router = express.Router();

// anything below will use these middlewares
router.use(protectRoute);
router.use(authorizeRoute('admin'));

router
  .route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;