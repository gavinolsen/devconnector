const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const keys = require('../../config/keys');

//load the input validation!!!
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

//bring in the user model
const User = require('../../models/User');

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
router.get('/test', (req, res) =>
  res.json({
    msg: 'users works'
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
router.post('/register', (req, res) => {
  //get the values given by the function we made
  const { errors, isValid } = validateRegisterInput(req.body);

  //check to see if validation passed. this is
  //our custom validation from the file we made
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = 'Email already exists';
      return res.status(400).json(errors);
    } else {
      //this is what we are using for the pictures
      const avatar = gravatar.url(req.body.email, {
        s: '200',
        r: 'pg',
        d: 'mm'
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
 * @route   POST api/users/login
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

router.post('/login', (req, res) => {
  //get the values given by the function we made
  const { errors, isValid } = validateLoginInput(req.body);

  //check to see if validation passed. this is
  //our custom validation from the file we made
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  //find the user by their email
  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = 'user not found';
      return res.status(404).json(errors);
    }

    //check password!
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        //user has matched!

        //make the payload with java web tokens
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        };

        //sign the token
        //this function gives us a special token we can use!!!
        //pretty dope
        jwt.sign(payload, keys.secret, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: 'Bearer ' + token
          });
        });
      } else {
        errors.password = 'incorrect password';
        return res.status(400).json(errors);
      }
    });
  });
});

/**
 * @route   GET api/users/current
 * @desc    return the current user
 * @access  Private
 *
 *          simple example of how to
 *          access private routes
 *          //look at ./config/passport.js
 */
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

//
//we have to export this module in order for the router to pick it up
module.exports = router;
