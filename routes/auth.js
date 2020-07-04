const express = require('express');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const router = express.Router({  });

const {
  asyncErrorHandler,
  isVerified,
  isAuthenticated,
  isNotAuthenticated
} = require('../middleware');

const {
  getRegister,
  postRegister,
  validateNewAccount,
  getNewToken,
  changePassword,
  postNewToken,
  postLogin,
  logOut,
  forgotPasswordEmail,
  getForgottenPassword,
  postForgotPassword
} = require('../controllers/auth');

/* GET register page. */
router.get('/register', isAuthenticated, getRegister);

/* POST user */
router.post('/register', upload.single('image'), isAuthenticated, asyncErrorHandler(postRegister));

/* GET validate-account */
router.get('/validate-account', isAuthenticated, asyncErrorHandler(validateNewAccount));

/* GET new-token */
router.get('/new-token', isAuthenticated, getNewToken);

/* POST new-token */
router.post('/new-token', asyncErrorHandler(isVerified), asyncErrorHandler(postNewToken));

/* POST login */
router.post('/login', isAuthenticated, asyncErrorHandler(postLogin));

/* Logout */
router.get('/logout', isNotAuthenticated, asyncErrorHandler(logOut));

/* PUT Change PW */
router.put('/pw-change', isNotAuthenticated, asyncErrorHandler(changePassword));

/* post forgot password email */
router.post('/forgot', isAuthenticated, asyncErrorHandler(forgotPasswordEmail));

/* GET change pw email verify */
router.get('/reset', isAuthenticated, asyncErrorHandler(getForgottenPassword));

/* POST reset password */
router.put('/reset', isAuthenticated, asyncErrorHandler(postForgotPassword));

module.exports = router;