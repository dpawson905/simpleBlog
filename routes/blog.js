const express = require('express');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const router = express.Router({ mergeParams: true });

const {
  isLoggedIn,
  asyncErrorHandler
} = require('../middleware');

const {
  getNewBlog,
  postNewBlog
} = require('../controllers/blog');

/* GET new blog. */
router.get('/new-blog', isLoggedIn, getNewBlog);

/* POST new blog */
router.post('/new-blog', upload.single('image'), isLoggedIn, asyncErrorHandler(postNewBlog));

module.exports = router;