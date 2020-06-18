const { cloudinary } = require('../cloudinary');
const { deleteProfileImage } = require('../middleware');
const util = require('util');
const User = require('../models/user');
const Blogs = require('../models/blog');

module.exports = {
  async getProfile(req, res, next) {
    let user = await User.findById(req.user.id);
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
      subTitle: '- Profile',
      startPage,
      endPage,
      currentPage,
      totalPages
    });
  },

  async putEditProfile(req, res, next) {
    const { username, email, private } = req.body;
    const { currentUser } = res.locals;
    if (username) currentUser.username = username;
    if (email) currentUser.email = email;
    if (req.file) {
      if (currentUser.image.public_id)
        // Changed user to currentUser
        await cloudinary.v2.uploader.destroy(currentUser.image.public_id);
      const { secure_url, public_id } = req.file;
      currentUser.image = {
        secure_url,
        public_id
      };
    }
    if (private) currentUser.private = true;
    if (!private) currentUser.private = false;
    await currentUser.save();
    const login = util.promisify(req.login.bind(req));
    await login(currentUser);
    req.flash('success', 'Profile updated.')
    res.redirect('back');
  }
}