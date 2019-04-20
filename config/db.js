require("dotenv").config();
const Sequelize = require("sequelize");

const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT
  }
);

// db.authenticate()
//   .then(() => {
//     console.log("Database Connnecton Established Successfully");
//   })
//   .catch(err => {
//     console.log("Database Connection Failed!", err);
//   });

module.exports = db;
