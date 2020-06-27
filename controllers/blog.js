const Blog = require('../models/blog.js');
const User = require('../models/user');
const crypto = require('crypto');
const moment = require('moment');
const slug = require('slug');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

const { cloudinary } = require('../cloudinary/');

const { deleteProfileImage } = require('../middleware');

const showdown = require('showdown');
const showdownHighlight = require('showdown-highlight');
const prettify = require('showdown-prettify');
const converter = new showdown.Converter({
  extensions: [
    showdownHighlight,
    'prettify'
  ]
});

module.exports = {
  async getBlogs(req, res, next) {
    // const user = await User.find().populate('followers').exec();    
    const blogs = await Blog.find({ 
      author: {
        $eq: req.user._id,
        // $in: user[0].followers,
      },
      publishDate: {
        $lte: Date.now()
      }
    });
    res.render('blogs/index', {
      blogs,
      subTitle: '- Your Blogs',
      entities,
      converter
    });
  },

  getNewBlog(req, res, next) {
    res.render('blogs/new');
  },

  async postNewBlog(req, res, next) {
    try {
      req.body.title = req.sanitize(req.body.title);
      console.log(req.body)
      let tags = req.body.tags;
      req.body.tags = tags.split(',').map(tag => tag.trim());
      req.body.author = req.user._id;
      if (req.file) {
        const { secure_url, public_id } = req.file;
        req.body.image = {
          secure_url,
          public_id
        };
      }
      if (!req.body.publishDate) {
        req.body.publishDate = Date.now();
      }
      if (req.body.private) {
        req.body.private = true;
      }
      req.body.content = entities.encode(req.body.content);
      const slugCheck = await Blog.findOne({slug: req.body.slug});
      if (slugCheck) {
        req.body.slug = await slug(moment(Date.now()).format("DD-MM-YYYY") + '-' + req.body.title) + '-' + crypto.randomBytes(5).toString("hex");
      } else {
        req.body.slug = await slug(moment(Date.now()).format("DD-MM-YYYY") + '-' + req.body.title);
      }
      if (req.body.featured) {
        const featureCheck = await Blog.findOne({ featured: true });
        if (featureCheck) {
          featureCheck.featured = false
          await featureCheck.save()
        }
        req.body.featured = true
      }
      
      const newBlog =  await Blog.create(req.body);
      // await user.blogs.push(newBlog);
      // await user.save();
      req.flash('success', 'Blog created Successfully');
      res.redirect('/');
    } catch(err) {
      console.log(err)
      deleteProfileImage(req);
      req.flash('error', err.message);
      return res.redirect('/');
    }
  }
}