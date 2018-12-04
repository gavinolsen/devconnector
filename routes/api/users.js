const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");

//bring in the user model
const User = require("../../models/User");

//this router goes off of what we declared in teh
//server.js file, which is
//
//  app.use("/api/users", users);
//which users was declared as
//  const users = require("./routes/api/users");
// aka this file here

/**
 * @route   GET api/users/test
 * @desc    Test users route
 * @access  Public
 */
router.get("/test", (req, res) =>
  res.json({
    msg: "users works"
  })
);

/**
 * @route   GET api/users/register
 * @desc    register users
 * @access  Public
 */
//we can only get the req.body.email
//with this line of code from server.js
// -->
router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "email already exists" });
    } else {
      //this is what we are using for the pictures
      const avatar = gravatar.url(req.body.email, {
        s: "200",
        r: "pg",
        d: "mm"
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

/**
 * @route   GET api/users/login
 * @desc    Login the user, and return the JWT
 * @access  Public
 *
 *
 * when we are returning a line like this vv
 *
 * return res.status(404).json({email: 'user not found'});
 *
 * the react model will get the parameter email
 */

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //find the user by their email
  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(404).json({ email: "user not found" });
    }

    //check password!
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        res.json({ msg: "Success" });
      } else {
        return res.status(400).json({ password: "Password incorrect" });
      }
    });
  });
});

//we have to export this module in order for the router to pick it up
module.exports = router;
