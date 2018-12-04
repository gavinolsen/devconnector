const express = require("express");
const router = express.Router();

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

router.get("/test", (req, res) =>
  res.json({
    msg: "posts works"
  })
);

//we have to export this module in order for the router to pick it up
module.exports = router;
