const express = require('express');
const router = express.Router();

const {
  asyncErrorHandler
} = require('../middleware');

const {
  getProfile,
  getEditProfile,
  putEditProfile,
  putUpdatePassword,
  removeAccount
} = require('../controllers/users');

/* GET profile */
router.get('/profile/:username', asyncErrorHandler(getProfile));

/* GET edit profile */
router.get('/profile/:username/edit', asyncErrorHandler(getEditProfile));

/* PUT edit profile */
router.put('/profile/:username', asyncErrorHandler(putEditProfile));

/* PUT update password */
router.put('/profile/:username', asyncErrorHandler(putUpdatePassword));

/* Remove Account */
router.delete('/profile/:username', asyncErrorHandler(removeAccount));

module.exports = router;
