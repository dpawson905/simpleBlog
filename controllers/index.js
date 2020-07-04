const User = require('../models/user');
const Blog = require('../models/blog');

module.exports = {
  async index(req, res, next) {
    const blog = await Blog.find({});
    res.render('index', { url: 'home', blog });
  }
}