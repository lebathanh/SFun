require("dotenv").config();
const express = require("express");
var cors = require("cors");
const app = express();

const Routes = require("./routes");
const db = require("./config/db");

var favicon = require("serve-favicon");
const path = require("path");

app.use(favicon(path.join(__dirname, "/public/images/favicon.ico")));

app.use(cors());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));
db.connect();

Routes(app);
app.get("/", (req, res) => {
  res.send("Wellcome to api server");
});

module.exports = app;
