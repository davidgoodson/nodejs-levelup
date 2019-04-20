const Sequelize = require("sequelize");
const bcryp = require("bcrypt");
const sequelize = require("../config/db");

class User extends Sequelize.Model {}

User.init(
  {
    uid: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    oauthid: { type: Sequelize.STRING, allowNull: true },
    method: { type: Sequelize.STRING, allowNull: false },
    displayName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    firstName: { type: Sequelize.STRING, alloNull: false },
    otherName: {
      type: Sequelize.STRING,
      allowNull: false,
      set(val) {
        this.setDataValue("otherName", toTitleCase(val));
      },
      validate: { is: ["^[a-z]+$", "i"] }
    },
    username: { type: Sequelize.STRING, allowNull: false, unique: true },
    password: {
      type: Sequelize.STRING,
      allowNull: true,
      set(val) {
        if (val) this.setDataValue("password", bcryp.hashSync(val, 10));
      }
    },
    userlevel: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 4 }
  },
  { sequelize }
);

// User.sync({ force: true }).catch(error => {
//   console.log("An Error Happened While Synchronizoing Forcefully", error);
// });

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

module.exports = User;
