const User = require("../models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

signToken = user => {
  return jwt.sign(
    {
      uid: user.dataValues.uid
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

module.exports = {
  signup: (req, res) => {
    User.findOne({ where: { username: req.body.username } }).then(user => {
      if (user)
        return res.status(200).json({
          error: "Username exists, choose another username!"
        });
      else {
        User.build({
          firstName: req.body.firstname,
          otherName: req.body.othername,
          username: req.body.username,
          password: req.body.password
        })
          .save(result => {
            console.log("Logging At Save: ", result);
          })
          .then(saved => {
            const token = signToken(saved);
            console.log("Logging Token:", token);
            res.status(200).json({ token: token });
          })
          .catch(error => {
            res.status(400).json({ error });
          });
      }
    });
  },

  //Login the user
  login: (req, res) => {
    User.findOne({ where: { username: req.body.username } })
      .then(user => {
        console.log(req.body);
        if (user)
          bcrypt.compare(
            req.body.password,
            user.dataValues.password,
            (err, result) => {
              if (err)
                return res
                  .status(401)
                  .json({ error: "Authentication failed!" });
              if (result) {
                const token = signToken(user);
                return res.status(200).json({ token: token });
              } else {
                return res.status(401).json({ error: "Invalid Password!" });
              }
            }
          );
        else return res.status(404).json({ error: "Invalid Username!" });
      })
      .catch(error => {
        console.log("Error while loging in: ", error);
      });
  },

  //View Users
  viewUsers: (payload, res, next) => {
    /** IN THIS CASE COMMING FROM PASSPORT
     * payload contains all info, including the object from the passport and the requests, which is either error or user
     */
    const user = payload.user;
    if (user.error) {
      const error = user.error;
      message = user.message;
      res.status(400).json({ error: error, message: message });
    } else {
      User.findOne({ where: { uid: user.uid } }).then(user => {
        if (!user) {
          return res.status(401).json({
            message: "Access denied!"
          });
        } else {
          if (user.userlevel < 3)
            return res.status(400).json({
              message: "You do not have multiple users view permissions!"
            });
          else {
            User.findAll()
              .then(users => {
                res.status(200).send(users);
              })
              .catch(error => {
                console.log("Terrible Error", error);
                res.status(400).json({ message: "Failed to fetch Users!" });
              });
          }
        }
      });
    }
  },

  //Single User
  singleUser: (req, res) => {
    // const { error } = require("../helpers/routeHelper").findUser(req.params);
    // if (error) return res.status(400).send(error.details[0].message);
    User.findByPk(req.params.id)
      .then(users => {
        res.status(200).send(JSON.stringify(users));
      })
      .catch(error => {
        res.status(400).send(error.errors[0]);
      });
  },

  //Google OAuthSignIn
  OAuth: (req, res) => {
    const token = signToken(req.user);
    res.status(200).json({ token: token });
  }
};
