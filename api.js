const express = require("express");
const profiles = require("./routes/users");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());
app.use("/api/profiles", profiles);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
