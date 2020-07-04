require('dotenv').config()

const debug = require('debug')('newsimpleblog:app');
const createError = require('http-errors');
const compression = require('compression');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('connect-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const helmet = require('helmet');
const passport = require('passport');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongo')(session);
const sassMiddleware = require('node-sass-middleware');
const expressSanitizer = require("express-sanitizer");

const authRouter = require('./routes/auth');
const blogRouter = require('./routes/blog');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const User = require('./models/user');
const Permission = require('./models/permission');

// Connect to db
mongoose.connect(process.env.DB_URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(() => {
  debug('Connected to MongoDB');
}).catch(err => {
  debug(err.message);
});

/* Set this for debbuging purposes only!!! */
//mongoose.set('debug', true);

const app = express();
app.use(compression());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.moment = require('moment');

app.use(expressSanitizer());
app.use(methodOverride('_method'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

const sess = {
  secret: process.env.COOKIE_SECRET,
  cookie: { httpOnly: true, expires: Date.now() + 1000 * 60 * 60, maxAge: 1000 * 60 * 60},
  store: new MongoDBStore({
    mongooseConnection: mongoose.connection,
    touchAfter: 24 * 3600,
    secret: process.env.COOKIE_SECRET
  }),
  resave: true,
  saveUninitialized: false
};

if (app.get('env') === 'production') {
  app.set('trust proxy', true); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}

app.use(flash());
app.use(helmet());
app.use(session(sess));

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async (req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.title = 'SimpleBlog';
  res.locals.token = req.query.token;
  res.locals.currentUser = req.user;
  res.locals.isAuthenticated = req.user ? true : false;
  next();
});

app.use(async function(err, req, res, next) {
  
  debug('Calling next')
  next();
});

app.use('/auth', authRouter);
app.use('/blog', blogRouter);
app.use('/users', usersRouter);
app.use('/', indexRouter);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  debug(err)
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

(async () => {
  const permission = await Permission.find({});
  if (!permission.length) {
    await Permission.create({});
  }
})();

module.exports = app;