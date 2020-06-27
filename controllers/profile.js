const { cloudinary } = require('../cloudinary');
const { deleteProfileImage } = require('../middleware');
const util = require('util');
const User = require('../models/user');
const Blogs = require('../models/blog');

module.exports = {
  async getProfile(req, res, next) {
    let user = await User.findOne({ username: req.params.username });
    let blogs = await Blogs.paginate(
      { author: req.user.id },
      {
        page: req.query.page || 1,
        limit: 10,
        sort: '-_id'
      }
    );
    blogs.page = Number(blogs.page);
    let totalPages = blogs.pages;
    let currentPage = blogs.page;
    let startPage;
    let endPage;

    if (totalPages <= 10) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= 6) {
        startPage = 1;
        endPage = 10;
      } else if (currentPage + 4 >= totalPages) {
        startPage = totalPages - 9;
        endPage = totalPages;
      } else {
        startPage = currentPage - 5;
        endPage = currentPage + 4;
      }
    }
    res.render('profile/index', { 
      blogs, 
      user, 
      url: 'profile', 
      startPage,
      endPage,
      currentPage,
      totalPages
    });
  },

  async putEditProfile(req, res, next) {
    const { username, email, private } = req.body;
    let user = await User.findOne({ username: req.params.username });
    if (username) user.username = username;
    if (email) user.email = email;
    if (req.file) {
      if (user.image.public_id)
        // Changed user to user
        await cloudinary.v2.uploader.destroy(user.image.public_id);
      const { secure_url, public_id } = req.file;
      user.image = {
        secure_url,
        public_id
      };
    }
    if (private) user.private = true;
    if (!private) user.private = false;
    await user.save();
    const login = util.promisify(req.login.bind(req));
    await login(user);
    req.flash('success', 'Profile updated.')
    res.redirect(`/users/user/${user.username}`);
  }
}