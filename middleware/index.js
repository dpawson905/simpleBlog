const { cloudinary } = require('../cloudinary');
const User = require('../models/user');
const Blog = require('../models/blog');

const middleware = {
  asyncErrorHandler: fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  },

  isAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      req.flash('error', 'You are currently logged in.');
      res.redirect('/');
    } else {
      return next();
    }
  },

  isLoggedIn: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash('error', 'You must be logged in to do this!');
      req.session.redirectTo = req.originalUrl;
      res.redirect('/');
    }
  },

  isNotAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash('error', 'You must be logged in to view this page');
      req.session.redirectTo = req.originalUrl;
      res.redirect('/users/login');
    }
  },

  // isAdmin checker
  isAdmin: (req, res, next) => {
    if (req.isAuthenticated() && req.user.roles.admin) {
      return next();
    }
    req.flash('error', 'You don\'t have the privileges to do that.');
    res.redirect('/users/login');
  },

  deleteProfileImage: async req => {
    if (req.file) await cloudinary.v2.uploader.destroy(req.file.public_id);
  },

  isVerified: async(req, res, next) => {
    let user = await User.findOne({ email: req.body.email });
    if (!user.isVerified) {
      return next();
    }
    req.flash('error', 'Your account is already active.');
    res.redirect('/');
  },

  isBlogOwner: async(req, res, next) => {
    let blog = await Blog.findOne({
      slug: req.params.slug,
      author: req.user._id
    });
    if (!blog) {
      req.flash('error', 'You are not permitted to view this');
      return res.redirect('/');
    }
    next();
  }
};

module.exports = middleware;