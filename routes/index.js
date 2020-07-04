const express = require('express');
const router = express.Router();

const {
  asyncErrorHandler
} = require('../middleware');

const {
  index
} = require('../controllers/index');

/* GET home page. */
router.get('/', asyncErrorHandler(index));

router.all('*', (req, res, next) => {
  return res.render('404');
});

module.exports = router;
