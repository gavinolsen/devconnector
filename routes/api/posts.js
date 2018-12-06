const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

//bring in post validation
const validatePostInput = require('../../validation/post');

//this router goes off of what we declared in teh
//server.js file, which is
//
//  app.use("/api/users", users);
//which users was declared as
//  const users = require("./routes/api/users");
// aka this file here

/**
 * @route   GET api/posts/test
 * @desc    Test post route
 * @access  Public
 */
router.get('/test', (req, res) => res.json({ msg: 'posts works' }));

/**
 * @route   GET api/posts/
 * @desc    get all of the posts
 * @access  Public
 */
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: 'no posts found' }));
});

/**
 * @route   GET api/posts/:id
 * @desc    get a post by it's id
 * @access  Public
 */
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ nopostfound: 'no post found with this id' })
    );
});

/**
 * @route   POST api/posts/
 * @desc    create a post!
 * @access  Private
 */
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      res.status(400).json(errors);
    }

    //make a new post variable.
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

/**
 * @route   POST api/posts/like/:id
 * @desc    like a post by it's id
 * @access  Private
 */
router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //if the id is already in the
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: 'user already liked this post' });
          }

          //otherwise add them to the array of likes
          post.likes.unshift({ user: req.user.id });
          post.save().then(post => res.json(post));
        })
        .catch(err =>
          res
            .status(404)
            .json({ postnotfount: "couldn't find a post by that id" })
        );
    });
  }
);

/**
 * @route   POST api/posts/unlike/:id
 * @desc    unlike a post by it's id
 * @access  Private
 *
 * this unlike functionality is the same type of validation
 * that I'll want to implement to allow users to delete their
 * own request
 */
router.post(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //if the id is already in the
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: 'you havent liked this post' });
          }

          //get the remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          post.likes.splice(removeIndex, 1);
          post.save().then(post => res.json(post));
        })
        .catch(err =>
          res
            .status(404)
            .json({ postnotfount: 'couldnt find a post by that id' })
        );
    });
  }
);

/**
 * @route   POST api/posts/comment/:id
 * @desc    add a comment to a post
 * @access  Private
 */
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        //now add it to the comments array
        post.comments.unshift(newComment);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: 'post not found' }));
  }
);

/**
 * @route   DELETE api/posts/comment/:id/:comment_id
 * @desc    delete a comment from a post
 * @access  Private
 */
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then(post => {
        //check to see if the comment exists!

        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          //the comment doesn't exist
          return res
            .status(404)
            .json({ commentnotexists: 'comment does not exist' });
        }

        //it exists
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        //splice to remove
        post.comments.splice(removeIndex, 1);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: 'post not found' }));
  }
);

/**
 * @route   DELETE api/posts/:id
 * @desc    delete a post by it's id
 * @access  Private
 */
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //check for the post owner!!!
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: 'user not authorized' });
          }
          //delet the post if it passed
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err =>
          res
            .status(404)
            .json({ postnotfount: 'couldnt find a post by that id' })
        );
    });
  }
);

//we have to export this module in order for the router to pick it up
module.exports = router;
