const Sequelize = require("sequelize");

const sequelize = require("./db");

class User extends Sequelize.Model {
  set firstName(val) {
    this.setDataValue("firstName", toTitleCase(val));
  }
}

User.init(
  {
    uid: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    firstName: { type: Sequelize.STRING, alloNull: false },
    otherName: {
      type: Sequelize.STRING,
      allowNull: false,
      set(val) {
        this.setDataValue("otherName", toTitleCase(val));
      },
      validate: { is: ["^[a-z]+$", "i"] }
    },
    email: { type: Sequelize.STRING, allowNull: false },
    username: { type: Sequelize.STRING, allowNull: false, unique: true },
    password: { type: Sequelize.STRING, allowNull: false },
    userlevel: { type: Sequelize.INTEGER, allowNull: false }
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

// User.create({
//   firstName: "kuteesa",
//   otherName: "pAul",
//   sex: "Male",
//   dateOfBirth: "1988-03-03"
// });

// const user = User.build({
//   firstName: "Buyinza",
//   otherName: "David",
//   sex: "Female",
//   dateOfBirth: "1988/03/03",
//   email: "sara.mirembe@gmail.com"
// });

// user
//   .save()
//   .then(() => {
//     console.log("User Successfully Saved");
//   })
//   .catch(error => {
//     console.log("An Error Happened While Inserting", error.errors[0]);
//   });

// console.log(
//   User.findAll()
//     .then(user => {
//       console.log(JSON.stringify(user));
//     })
//     .catch(error => {
//       console.log("This Error Happened", error);
//     })
// );

module.exports = User;
