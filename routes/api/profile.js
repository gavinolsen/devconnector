const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//load the profile model
const Profile = require("../../models/Profile");
//load the profile validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

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
 * @route   GET api/profile
 * @desc    Test profile r
 * @access  Public
 */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
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

/**
 * @route   GET api/profile/all
 * @desc    Get the profile by the handle
 * @access  Public
 */
router.get("/all", (req, res) => {
  const errors = {};

  Profile.find({})
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      errors.noprofile = "there are no profiles";
      if (!profiles) return res.status(404).json(errors);

      res.json(profiles);
    })
    .catch(() => {
      errors.profile = "there are no profiles";
      return res.status(404).json(errors);
    });
});

/**
 * @route   GET api/profile/handle/:handle
 * @desc    Get the profile by the handle
 * @access  Public
 *
 * this is a backend api. not actually used
 * by the user
 *
 */

router.get("/handle/:handle", (req, res) => {
  const errors = {};

  //get it from the request parameters
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.profile = "there's no profile for this user";
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(() => {
      errors.profile = "no profile exists for this user";
      return res.status(404).json(errors);
    });
});

/**
 * @route   GET api/profile/user/:user_id
 * @desc    Get the profile by user id
 * @access  Public
 */
router.get("/user/:user_id", (req, res) => {
  const errors = {};

  //get it from the request parameters
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.profile = "there's no profile for this user";
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(() => {
      errors.profile = "no profile exists for this user";
      return res.status(404).json(errors);
    });
});

/**
 * @route   POST api/profile/
 * @desc    create or edit the users profile
 * @access  Public
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    //check the validation
    if (!isValid) {
      //return the errors
      return res.status(400).json(errors);
    }

    //get all the fields
    const profileFields = {};

    //we can get this from the request that comes through.
    //this is the model that comes through
    profileFields.user = req.user.id;

    //if this was sent through the body, set it
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    if (req.body.handle) profileFields.handle = req.body.handle;

    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    // social

    profileFields.social = {};

    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //update the profile!
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        //create the profile
        //check to see if the handle exists -- seo friendly--
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          //if it already exists
          if (profile) {
            errors.handle = "that handle already exists";
            return res.status(400).json(errors);
          }
          //save the profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

/**
 * @route   POST api/profile/experience
 * @desc    add an experience to a profile
 * @access  Private
 */
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      //add this experience to the existing profile
      //unshift puts it to the front of the array!
      profile.experience.unshift(newExp);
      profile.save().then(profile => {
        res.json(profile);
      });
    });
  }
);

/**
 * @route   POST api/profile/education
 * @desc    add education to a profile
 * @access  Private
 */
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      //add this experience to the existing profile
      //unshift puts it to the front of the array!
      profile.education.unshift(newEdu);
      profile.save().then(profile => {
        res.json(profile);
      });
    });
  }
);

/**
 * @route   DELETE api/profile/experience/:exp_id
 * @desc    delete experience fom a profile
 * @access  Private
 */
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //ger the index to remove
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);
        //now we want to splice the array
        profile.experience.splice(removeIndex, 1);

        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.json(err));
  }
);

/**
 * @route   DELETE api/profile/education/:edu_id
 * @desc    delete education fom a profile
 * @access  Private
 */
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //ger the index to remove
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);
        //now we want to splice the array
        profile.education.splice(removeIndex, 1);

        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.json(err));
  }
);

/**
 * @route   DELETE api/profile/education/:edu_id
 * @desc    delete education fom a profile
 * @access  Private
 *
 * the way this is done, you don't need an id to put in!
 * it just deletes whatever user is logged in
 */
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ success: true })
      );
    });
  }
);

/**
 * @route   DELETE api/profile/education/:edu_id
 * @desc    delete education fom a profile
 * @access  Private
 */
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //ger the index to remove
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);
        //now we want to splice the array
        profile.education.splice(removeIndex, 1);

        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.json(err));
  }
);

//we have to export this module in order for the router to pick it up
module.exports = router;
