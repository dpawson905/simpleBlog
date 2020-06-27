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
  getBlogs,
  getNewBlog,
  postNewBlog
} = require('../controllers/blog');

/* Get blogs */
router.get('/blogs', isLoggedIn, asyncErrorHandler(getBlogs));

/* GET new blog. */
router.get('/new-blog', isLoggedIn, getNewBlog);

/* POST new blog */
router.post('/new-blog', upload.single('image'), isLoggedIn, asyncErrorHandler(postNewBlog));

module.exports = router;