const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const BearerStrategy = require("passport-http-bearer").Strategy;
const { ExtractJwt } = require("passport-jwt");
//THIS DOES NOT WORK WITH CLIENT SIDE LOGIN, ONLY FOR BACKEND PURPOSES
//const GooglePlusTokenStrategy = require("passport-google-plus-token");
const GooglePlusTokenStrategy = require("passport-google-oauth20").Strategy;
const FacebookTokenStrategy = require("passport-facebook").Strategy;
const User = require("./models/users");
const jwt = require("jsonwebtoken");

//JwtStrategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader("authorization"),
      secretOrKey: process.env.JWT_SECRET
    },
    async (payload, done) => {
      try {
        const user = await User.findByPk(payload.uid);
        if (!user) return done(null, false);
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

//HTTP Bearer Strategy
passport.use(
  new BearerStrategy((token, done) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        switch (err.name) {
          case "TokenExpiredError":
            user = {
              error: "TokenExpiredError",
              message: "Your token has expired. please sign in again."
            };
            break;
          case "JsonWebTokenError":
            user = {
              error: "JsonWebTokenError",
              message: "The provided token was invalid!"
            };
            break;
          case "NotBeforeError":
            user = {
              error: "JsonWebTokenError",
              message: "Invalid client timestamp!"
            };
        }
        done(null, user);
      } else {
        done(null, user);
      }
    });
  })
);

//fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

//GOOGLE OAUTH STRATEGY - Using OAuth2 2.0 to retrieve email, names and IDs of the User through Signin
//Wieth Google - Same method for facebook OAuth
passport.use(
  "googleOAuth",
  new GooglePlusTokenStrategy(
    {
      clientID: process.env.GOAuth_ClientID,
      clientSecret: process.env.GOAuth_ClientSecret,
      callbackURL: process.env.GOAuth_Callback,
      accessType: "offline",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("ACCESS TOKEN:", accessToken);
      console.log("REFRESH TOKEN:", refreshToken);
      console.log("PROFILE:", profile);

      try {
        const existingUser = await User.findOne({
          where: { method: "google", oauthid: profile.id }
        });

        //IF THE USER EXISTS, RETURN EXISTING USER
        if (existingUser) {
          console.log("EXISTING USER: ", existingUser);
          return done(null, existingUser);
        }

        //ELSE CREATE THE USER AND SAVE THE USER THEN CALL DONE TO RETURN SAVED USER
        User.build({
          method: "google",
          oauthid: profile.id,
          username: profile.emails[0].value,
          firstName: profile.name.familyName,
          otherName: profile.name.givenName,
          displayName: profile.displayName
        })
          .save()
          .then(saved => {
            console.log("NEW USER: ", saved);
            done(null, saved);
          })
          .catch(error => {
            console.log("ERROR IN OAUTH:", error);
            done(error, false);
          });
      } catch (error) {
        console.log("ERROR IN OAUTH:", error);
        done(error, false);
      }
    }
  )
);

//GOOGLE OAUTH STRATEGY - Using OAuth2 2.0 to retrieve email, names and IDs of the User through Signin
//Wieth Google - Same method for facebook OAuth
passport.use(
  "facebookOAuth",
  new FacebookTokenStrategy(
    {
      clientID: process.env.FOAuth_AppID,
      clientSecret: process.env.FOAuth_ClientSecret,
      callbackURL: process.env.FOAuth_Callback
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("ACCESS TOKEN:", accessToken);
      console.log("REFRESH TOKEN:", refreshToken);
      console.log("PROFILE:", profile);

      try {
        const existingUser = await User.findOne({
          where: { method: "google", oauthid: profile.id }
        });

        //IF THE USER EXISTS, RETURN EXISTING USER
        if (existingUser) {
          console.log("EXISTING USER: ", existingUser);
          return done(null, existingUser);
        }

        //ELSE CREATE THE USER AND SAVE THE USER THEN CALL DONE TO RETURN SAVED USER
        User.build({
          method: "google",
          oauthid: profile.id,
          username: profile.emails[0].value,
          firstName: profile.name.familyName,
          otherName: profile.name.givenName,
          displayName: profile.displayName
        })
          .save()
          .then(saved => {
            console.log("NEW USER: ", saved);
            done(null, saved);
          })
          .catch(error => {
            console.log("ERROR IN OAUTH:", error);
            done(error, false);
          });
      } catch (error) {
        console.log("ERROR IN OAUTH:", error);
        done(error, false);
      }
    }
  )
);
