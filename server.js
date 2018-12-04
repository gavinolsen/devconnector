const express = require("express");
const mongoose = require("mongoose");

//you want to put the models here!
const users = require("./routes/api/users");
const posts = require("./routes/api/posts");
const profile = require("./routes/api/profiles");

//initialize the app with express
const app = express();

//get the mongo key!
const db = require("./config/keys").mongoURI;

//connect to the database with the key!
mongoose
  .connect(db)
  .then(() => console.log("mongo db connected"))
  .catch(err => console.log(err));

//this is the main
app.get("/", (req, res) => res.send("hey"));

//use the routes we made above
app.use("/api/users", users);
app.use("/api/posts", posts);
app.use("/api/profile", profile);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
