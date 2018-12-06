const Validator = require("validator");

//this comes in so that we can check
const isEmpty = require("./is-empty");

//this function lets us see whether the input is valid or not
//validator has a lot of other functions that can check to
//see whether or not there are certain characters in tha name,
//or password
//the data that we send in will be req.body
module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  //we are assigning errors a key of name with the
  //associated value
  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "name must be between 2 & 30 characters";
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = "name field is required";
  }
  if (!Validator.isEmail(data.email)) {
    errors.email = "please enter a valid email";
  }
  if (Validator.isEmpty(data.email)) {
    errors.email = "email field is required";
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "password must be at lease 6 characters";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "password field is required";
  }
  if (Validator.isEmpty(data.password2)) {
    errors.password2 = "password field is required";
  }
  //don't use the matches funciton
  //use this equals. matches won't work at all
  if (
    !Validator.equals(data.password, data.password2) ||
    Validator.isEmpty(data.password2)
  ) {
    errors.password2 = "passwords must match";
  }

  //in this json string,
  //you don't need to say errors twice
  //becuase
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
