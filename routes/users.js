const express = require('express');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const router = express.Router();

const {
  getStarted,
  getRegister,
  postRegisterUser,
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

const {
  getProfile,
  putEditProfile
} = require('../controllers/profile');

const {
  asyncErrorHandler,
  isLoggedIn,
  isVerified,
  isAuthenticated,
  isNotAuthenticated
} = require('../middleware');

/* Get Started */
router.get('/get-started', asyncErrorHandler(getStarted));

/* GET register page. */
router.get('/register', isAuthenticated, getRegister);

/* POST user */
router.post('/register', upload.single('image'), isAuthenticated, asyncErrorHandler(postRegisterUser));

/* GET validate-account */
router.get('/validate-account', isAuthenticated, asyncErrorHandler(validateNewAccount));

/* GET new-token */
router.get('/new-token', isAuthenticated, getNewToken);

/* POST new-token */
router.post('/new-token', asyncErrorHandler(isVerified), asyncErrorHandler(postNewToken));

/* POST login */
router.post('/login', isAuthenticated, asyncErrorHandler(postLogin));

/* Logout */
router.get('/logout', isNotAuthenticated, logOut);

/* GET user profile */
router.get('/user/:id', isNotAuthenticated, asyncErrorHandler(getProfile));

/* PUT edit profile */
router.put('/user/:id', upload.single('image'), isNotAuthenticated, asyncErrorHandler(putEditProfile));

/* PUT Change PW */
router.put('/user/:id/pw-change', isNotAuthenticated, asyncErrorHandler(changePassword));

/* post forgot password email */
router.post('/forgot', isAuthenticated, asyncErrorHandler(forgotPasswordEmail));

/* GET change pw email verify */
router.get('/reset', isAuthenticated, asyncErrorHandler(getForgottenPassword));

/* POST reset password */
router.put('/reset', isAuthenticated, asyncErrorHandler(postForgotPassword));

module.exports = router;