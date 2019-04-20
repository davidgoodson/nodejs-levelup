const Joi = require("joi");
const jwt = require("jsonwebtoken");

module.exports = {
  validateSignup: () => {
    return (req, res, next) => {
      const result = Joi.validate(req.body, schemas.signUp);
      if (result.error)
        return res.status(400).json({ error: result.error.details[0].message });
      next();
    };
  },
  validateLogin: () => {
    return (req, res, next) => {
      const result = Joi.validate(req.body, schemas.webLogin);
      if (result.error)
        return res.status(400).json({ error: result.error.details[0].message });
      next();
    };
  },

  //Authenticate Loged In User
  authenticate: (req, res, next) => {
    const header = req.headers["authorization"];
    let token;
    if (!header) return res.status(401).json({ error: "No token specified!" });

    if (header.startsWith("Bearer ")) token = header.split(" ")[1];
    else
      return res
        .status(401)
        .json({ error: "Provided token is in an invalid format!" });

    jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
      if (err) {
        // console.log("Token verification error", err);
        return res.status(500).json({ error: "Provided token is invalid!" });
      } else {
        req.uid = decoded.uid;
        next();
      }
    });
  }
};

const schemas = {
  signUp: {
    firstname: Joi.string()
      .min(3)
      .required(),
    othername: Joi.string()
      .min(3)
      .required(),
    password: Joi.string()
      .min(5)
      .required(),
    username: Joi.string()
      .min(5)
      .required()
  },
  webLogin: {
    password: Joi.string()
      .min(5)
      .required(),
    username: Joi.string()
      .min(5)
      .required()
  }
};
