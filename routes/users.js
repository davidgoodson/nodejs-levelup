require("dotenv").config();
const Joi = require("joi");
const express = require("express");
const User = require("../models/users");
const bcryp = require("bcrypt");
const jwt = require("jsonwebtoken");

var router = express.Router();
router.use(express.json());

router.post("/signup", (req, res) => {
  const { error } = validitateParams(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  User.findOne({ where: { username: req.body.username } }).then(user => {
    //console.log(user);
    if (user)
      return res.status(200).json({
        message: "Username exists, choose another username!"
      });
    else {
      bcryp.hash(req.body.password, saltRounds, (err, hash) => {
        if (err) return res.status(400).send("Invalid Password!");
        else {
          const user = User.build({
            firstName: req.body.firstname,
            otherName: req.body.othername,
            username: req.body.username,
            password: hash,
            email: req.body.email,
            userlevel: req.body.userlevel
          })
            .save()
            .then(saved => {
              res.status(200).send(JSON.stringify(saved));
            })
            .catch(error => {
              res.status(400).send(error.errors[0]);
            });
        }
      });
    }
  });
  const saltRounds = 10;
});

router.post("/login", (req, res) => {
  const schema = {
    username: Joi.string()
      .min(5)
      .required(),
    password: Joi.string()
      .min(6)
      .required()
  };
  const { error } = Joi.validate(req.body, schema);
  if (error) res.status(400).send(error.details[0].message);

  User.findOne({ where: { username: req.body.username } })
    .then(user => {
      // console.log("Login User: ", user);
      if (user)
        bcryp.compare(
          req.body.password,
          user.dataValues.password,
          (err, result) => {
            if (err)
              return res
                .status(401)
                .json({ message: "Authentication failed!" });
            if (result) {
              const token = jwt.sign(
                {
                  uid: user.dataValues.uid,
                  email: user.dataValues.email
                },
                process.env.JWT_TOKEN,
                { expiresIn: "5m" }
              );
              return res.status(200).json({ auth: true, token: token });
            } else {
              return res.status(401).json({ message: "Invalid Password!" });
            }
          }
        );
      else return res.status(404).json({ message: "Invalid Username!" });
    })
    .catch(error => {
      console.log("Error while loging in: ", error);
    });
});

authenticate = (req, res, next) => {
  const header = req.headers["authorization"];
  let token;

  if (!header) return res.status(401).json({ message: "No token specified!" });

  if (header.startsWith("Bearer ")) token = header.split(" ")[1];
  else
    return res
      .status(401)
      .json({ message: "Provided token is in an invalid format!" });

  jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
    if (err) {
      // console.log("Token verification error", err);
      return res.status(500).json({ message: "Provided token is invalid!" });
    } else {
      req.uid = decoded.uid;
      next();
    }
  });
};

router.get("/users", authenticate, (req, res) => {
  User.findOne({ where: { uid: req.uid } }).then(user => {
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
});

router.get("/users/:id", (req, res) => {
  const { error } = validitateParams(req.params);
  if (error) return res.status(400).send(error.details[0].message);
  User.findByPk(req.params.id)
    .then(users => {
      res.status(200).send(JSON.stringify(users));
    })
    .catch(error => {
      res.status(400).send(error.errors[0]);
    });
});

function validitateParams(params) {
  const schema = {
    firstname: Joi.string()
      .min(3)
      .required(),
    othername: Joi.string()
      .min(3)
      .required(),
    password: Joi.string()
      .min(5)
      .required(),
    email: Joi.string()
      .min(10)
      .required(),
    username: Joi.string()
      .min(5)
      .required(),
    userlevel: Joi.string()
      .min(1)
      .max(1)
      .required()
  };
  return Joi.validate(params, schema);
}

module.exports = router;
