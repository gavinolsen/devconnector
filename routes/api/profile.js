const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//load the profile model
const Profile = require("../../models/Profile");

//this router goes off of what we declared in teh
//server.js file, which is
//
//  app.use("/api/users", users);
//which users was declared as
//  const users = require("./routes/api/users");
// aka this file here

/**
 * @route   GET api/profile/test
 * @desc    Test profile route
 * @access  Public
 */
router.get("/test", (req, res) =>
  res.json({
    msg: "profiles works"
  })
);

/**
 * @route   GET api/profile/test
 * @desc    Test profile r
 * @access  Public
 */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }

        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

//we have to export this module in order for the router to pick it up
module.exports = router;
