require("dotenv").config();
const express = require("express");
const users = require("./routes/users");
const app = express();

app.use("/api/profiles", users);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
