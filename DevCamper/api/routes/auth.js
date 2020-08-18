const
  express = require('express'),
  { register } = require('../controllers/auth');

const router = express.Router();

router.route('/register')
  .post(register);

module.exports = router;