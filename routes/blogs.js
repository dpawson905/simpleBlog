const Blog = require('../models/blog.js');
const User = require('../models/user');
const crypto = require('crypto');
const moment = require('moment');
const slug = require('slug');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

const {
  cloudinary
} = require('../cloudinary/');

const { 
  deleteProfileImage
} = require("../middleware");

const showdown = require('showdown');
const showdownHighlight = require('showdown-highlight');
const prettify = require('showdown-prettify');
const converter = new showdown.Converter({
  extensions: [
    showdownHighlight,
    prettify
  ]
});

module.exports = {
  async getBlogs(req, res, next) {
    const user = await User.findOne({ username: req.params.username });

  }
}