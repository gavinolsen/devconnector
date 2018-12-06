const Validator = require("validator");

//this comes in so that we can check
import isEmpty from "./is-empty";

//this function lets us see whether the input is valid or not
//validator has a lot of other functions that can check to
//see whether or not there are certain characters in tha name,
//or password
module.exports = function validateRegisterInput(data) {
  let errors = {};

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "name must be between 2 & 30 characters";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
