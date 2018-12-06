const Validator = require("validator");

//this comes in so that we can check
const isEmpty = require("./is-empty");

//this function lets us see whether the input is valid or not
//validator has a lot of other functions that can check to
//see whether or not there are certain characters in tha name,
//or password
//the data that we send in will be req.body
module.exports = function validatePostInput(data) {
  let errors = {};

  data.text = !isEmpty(data.text) ? data.text : "";

  if (!Validator.isLength(data.text, { min: 10, max: 300 })) {
    errors.text = "text must be between 10 and 300 characters";
  }

  //we are assigning errors a key of name with the
  //associated valued
  if (Validator.isEmpty(data.text)) {
    errors.text = "text field is required";
  }

  //in this json string,
  //you don't need to say errors twice
  //becuase
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
