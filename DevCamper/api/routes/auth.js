const
  express = require('express'),
  { register, login, getMe, forgotPassword, resetPassword, updateDetails, updatePassword, logout }
    = require('../controllers/auth'),
  { protectRoute } = require('../middleware/auth');

const router = express.Router();

router
  .post('/register', register)
  .post('/login', login)
  .get('/logout', protectRoute, logout)
  .get('/me', protectRoute, getMe) /* we use 'protectRoute' middleware so that req.user will have value */
  .post('/forgotpassword', forgotPassword)
  .put('/resetpassword/:resettoken', resetPassword)
  .put('/updatedetails', protectRoute, updateDetails)
  .put('/updatepassword', protectRoute, updatePassword);

module.exports = router;