var debug = require('debug')('simpleblog:auth');
const passport = require("passport");
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");
const util = require("util");
const { cloudinary } = require("../cloudinary");
const { deleteProfileImage } = require("../middleware");

const kickbox = require('kickbox').client(process.env.KICKBOX_API_KEY).kickbox();

const User = require("../models/user");
const Token = require("../models/token");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  async getStarted(req, res, next) {
    const userCheck = "noUser";
    if (req.user) {
      res.redirect("/blogs");
    } else {
      res.render("index", {
        userCheck,
        url: "home"
      });
    }
  },

  getRegister(req, res, next) {
    res.render("auth/register", {
      subTitle: "- Register",
      url: "register",
      userInfo: {
        firstName: "",
        lastName: "",
        email: "",
        username: ""
      }
    });
  },

  async postRegisterUser(req, res, next) {
    const userInfo = req.body;
    try {
      await kickbox.verify(req.body.email, async(err, response) => {
        debug(response.body.result)
        if(err) {
          req.flash('error', err.message);
          return res.redirect('/users/register');
        }
        if (response.body.result !== 'deliverable') {
          req.flash('error', 'This is not a valid email account. Registration terminated!')
          return res.redirect('/users/register');
        }
        const newUser = new User({
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          email: userInfo.email,
          username: userInfo.username,
          expiresDateCheck: Date.now(),
          isVerified: false
        });
        delete userInfo.password2;
        const user = await User.register(newUser, userInfo.password);
        const userToken = new Token({
          _userId: user._id,
          token: crypto.randomBytes(256).toString("hex")
        });
        await userToken.save();
        const msg = {
          from: "Darrell Pawson <darrell@djpawson.me>",
          to: user.email,
          subject: `Welcome to SimpleBlog ${
            user.firstName
          } - Validate your account!`,
          html: `
                <h1>Hey There</h1>
                <p>It looks like you have registered for an account on our site, please click the link below to validate your account.</p>
                <p><a href="http://${
                  req.headers.host
                }/users/validate-account?token=${
            userToken.token
          }">Validate your account</a></p>
              `
        };
        await sgMail.send(msg);
        req.flash(
          "success",
          "Thanks for registering, Please check your email to verify your account."
        );
        return res.redirect("/");
      });
    } catch (err) {
      if (err.name === "MongoError" && err.code === 11000) {
        deleteProfileImage(req);
        const error = "Sorry, this email address is already in use.";
        return res.render("auth/register", {
          error,
          userInfo,
          subTitle: "- Register",
          url: "register"
        });
      } else {
        deleteProfileImage(req);
        console.log(err);
        const error = err.message;
        return res.render("auth/register", {
          error,
          userInfo,
          subTitle: "- Register",
          url: "register"
        });
      }
    }
  },

  async validateNewAccount(req, res, next) {
    const token = await Token.findOne({ token: req.query.token });
    if (!token) {
      req.flash(
        "error",
        "This token is either invalid or expired. Please request a new one."
      );
      return res.redirect("/");
    }
    let user = await User.findOne({ _id: token._userId });
    if (!user) {
      req.flash(
        "error",
        "Hmmmm, for some reason there is no user associated with that token. Please contact us so we can look into this."
      );
      return res.redirect("back");
    }
    user.isVerified = true;
    user.expiresDateCheck = null;
    user.online = true;
    await user.save();
    await token.remove();
    /* req.flash('success', 'Your account is now valid.');
    res.redirect('/'); */
    await req.login(user, err => {
      if (err) return next(err);
      req.flash("success", `Welcome to SimpleBlog ${user.username}`);
      const redirectUrl = req.session.redirectTo || "/";
      delete req.session.redirectTo;
      res.redirect(redirectUrl);
    });
  },

  getNewToken(req, res, next) {
    res.render("auth/newToken", {
      userInfo: {
        email: ""
      },
      title: "Resend Token",
      subTitle: ""
    });
  },

  async postNewToken(req, res, next) {
    const userInfo = req.body;
    const user = await User.findOne({ email: userInfo.email });
    const token = await Token.findOne({ _userId: user.id });
    if (!user) {
      const error = "This email address does not exist!";
      return res.render("auth/newToken", { error, userInfo });
    }
    if (token) {
      await token.remove();
    }
    const userToken = new Token({
      _userId: user._id,
      token: crypto.randomBytes(256).toString("hex")
    });
    await userToken.save();
    const msg = {
      from: "Darrell Pawson <darrell@djpawson.me>",
      to: user.email,
      subject: `SimpleBlog - New Token`,
      html: `
            <h1>Hey There</h1>
            <p>It looks like you have registered for an account on our site, please click the link below to validate your account.</p>
            <p><a href="http://${
              req.headers.host
            }/users/validate-account?token=${
        userToken.token
      }">Validate your account</a></p>
          `
    };
    await sgMail.send(msg);
    req.flash(
      "success",
      "Thanks for registering, Please check your email to verify your account."
    );
    return res.redirect("/");
  },

  async postLogin(req, res, next) {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      req.flash("error", "Invalid Username");
      return res.redirect("/");
    }

    if (!user.isVerified) {
      req.flash(
        "error",
        "You have not validated your account. Please check your email to do so."
      );
      return res.redirect("/");
    }
    user.online = true;
    await user.save();
    await passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/",
      successFlash: `Welcome back ${user.username}`,
      failureFlash: true
    })(req, res, next);
  },

  async changePassword(req, res, next) {
    const user = await User.findById(req.user.id);
    await user.setPassword(req.body.password, async err => {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      user.attempts = 0;
      user.expiresDateCheck = null;
      await user.save();
      req.flash("success", "Password has been changed.");
      res.redirect("back");
    });
  },

  async forgotPasswordEmail(req, res, next) {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const userToken = new Token({
        _userId: user._id,
        token: crypto.randomBytes(256).toString("hex")
      });
      await userToken.save();
      const msg = {
        from: "Darrell Pawson <darrell@djpawson.me>",
        to: user.email,
        subject: "Forgot password request",
        html: `
              <h1>Hey There</h1>
              <p>It looks like you have forgotten your password, please click the link below to validate your account.</p>
              <p>If this was not you then please reply to this message so we can look into it.</p>
              <p><a href="http://${req.headers.host}/users/reset?token=${
          userToken.token
        }&username=${user.username}">Reset your password</a></p>
            `
      };
      await sgMail.send(msg);
    }
    req.flash(
      "success",
      "If the email address is in our system, we will send an email for your password reset request."
    );
    return res.redirect("/");
  },

  async getForgottenPassword(req, res, next) {
    const token = await Token.findOne({ token: req.query.token });
    console.log(token);
    if (token) {
      const user = await User.findById(token._userId);
      const username = user.username;
      return res.render("auth/forgotPass", {
        username,
        title: "Forgot Password",
        subTitle: "",
        url: ""
      });
    } else {
      req.flash(
        "error",
        "That token has expired, please request a new link using the Forgot Password button."
      );
      res.redirect("/");
    }
  },

  async postForgotPassword(req, res, next) {
    const user = await User.findOne({ username: req.body.username });

    await user.setPassword(req.body.password, async err => {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      user.attempts = 0;
      user.expiresDateCheck = null;
      await user.save();
      await token.remove();
      const msg = {
        from: "Darrell Pawson <darrell@djpawson.me>",
        to: user.email,
        subject: "Password Changed",
        html: `
              <h1>Hey There</h1>
              <p>It looks like your password was changed.</p>
              <p>If this was not you then please reply to this message so we can look into it.</p>
              <p>Thanks... Admin</p>
            `
      };
      await sgMail.send(msg);
      req.flash(
        "success",
        "Your password has been successfully updated. Please login using your new password"
      );
      res.redirect("/");
    });
  },

  async logOut(req, res, next) {
    const user = await User.findById(req.user.id);
    user.online = false;
    await user.save();
    req.logout();
    return res.redirect("/");
  }
};