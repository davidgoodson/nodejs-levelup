const express = require("express");
const router = require("express-promise-router")();
const passport = require("passport");
const passportConf = require("../passport");

const {
  validateSignup,
  validateLogin,
  authenticate
} = require("../helpers/routeHelper");

const UserController = require("../controllers/users");

router.route("/signup").post(validateSignup(), UserController.signup);

router.route("/login/local").post(validateLogin(), UserController.login);

//Login with google, for front end purposes, use the oauth/google/callback below for backend and configure as instructed
router.route("/oauth/login/google").get(
  (req, res, next) => {
    if (req.query.return) {
      req.session.oauth2return = req.query.return;
    }
    next();
  },

  // Start OAuth 2 flow using Passport.js
  passport.authenticate("googleOAuth", { scope: ["email", "profile"] })
);

//Call Back to google, to Work for Backend POSTMAN Testing, Configure method to POST so that you can provide body of access-token
router
  .route("/oauth/google/callback")
  .get(
    passport.authenticate("googleOAuth", { session: false }),
    UserController.OAuth
  );

//Login with facebook, for front end purposes, use the oauth/facebook/callback below for backend and configure as instructed
router.route("/oauth/login/facebook").get(
  (req, res, next) => {
    if (req.query.return) {
      req.session.oauth2return = req.query.return;
    }
    next();
  },

  // Start OAuth 2 flow using Passport.js
  passport.authenticate("facebookOAuth")
);

//Call Back to facebook, to Work for Backend POSTMAN Testing, Configure method to POST so that you can provide body of access-token
router
  .route("/oauth/facebook/callback")
  .get(
    passport.authenticate("facebookOAuth", { session: false }),
    UserController.OAuth
  );

//View all Users
router
  .route("/users")
  .get(
    passport.authenticate("bearer", { session: false }),
    UserController.viewUsers
  );

router.route("/users/:id").post(authenticate, UserController.singleUser);

module.exports = router;
