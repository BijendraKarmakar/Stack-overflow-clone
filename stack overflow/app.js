const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const passport = require("passport");

var app = express();

//Bring all the routes
const auth = require("./routes/api/auth");
const profile = require("./routes/api/profile");
const questions = require("./routes/api/questions");

//mongoDB configuration
const db = require("./setup/connect").mongoURL;

//Attempt to connect to the database
mongoose
  .connect(db)
  .then(() => console.log("Mongodb connected succesfully"))
  .catch(err => console.log(err));

//Middleware for bodyparser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

const port = process.env.PORT || 3000;

//Passport middleware
app.use(passport.initialize());

//Config for JMT Strategy
require("./strategies/wtStrategies")(passport);

//route for testing
app.get("/", (req, res) => {
  res.send("<h2> Hello BNA </h2>");
});

//actual routes
app.use("/api/auth", auth);
app.use("/api/profile", profile);
app.use("/api/questions", questions);

app.listen(port, () => console.log(`Server is running at port ${port}`));
