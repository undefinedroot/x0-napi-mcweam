const
  express = require('express'),
  { register, login, getMe, forgotPassword } = require('../controllers/auth'),
  { protectRoute } = require('../middleware/auth');

const router = express.Router();

router
  .post('/register', register)
  .post('/login', login)
  .get('/me', protectRoute, getMe) /* we use 'protectRoute' middleware so that req.user will have value */
  .post('/forgotpassword', forgotPassword);

module.exports = router;