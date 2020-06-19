require('dotenv').config();

const debug = require('debug')('simpleblog:app');
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
const cors = require('cors');
const expressSanitizer = require("express-sanitizer");

const PORT = process.env.port || 4000;

const indexRouter = require('./routes/index');
const blogRouter = require('./routes/blog');
const usersRouter = require('./routes/users');

const User = require('./models/user');

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

app.use(logger('dev'));
app.use(expressSanitizer());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(methodOverride('_method'));
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.locals.moment = require('moment');

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

app.use('/', indexRouter);
app.use('/:username', blogRouter);
app.use('/users', usersRouter);

// catch 404 and display message to user
app.use(function(req, res, next) {
  req.flash('error', 'That page does not exist.');
  res.redirect('back');
  next();
});

// error handler
app.use(function (err, req, res, next) {
  debug(err.stack);
  req.flash('error', err.message);
  res.redirect('back');
});

app.listen(PORT, function() {
  debug('Customers!');
});
