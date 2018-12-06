const Validator = require("validator");

//this comes in so that we can check
const isEmpty = require("./is-empty");

//this function lets us see whether the input is valid or not
//validator has a lot of other functions that can check to
//see whether or not there are certain characters in tha name,
//or password
//the data that we send in will be req.body
module.exports = function validateEducationInput(data) {
  let errors = {};

  data.school = !isEmpty(data.school) ? data.school : "";
  data.degree = !isEmpty(data.degree) ? data.degree : "";
  data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : "";
  data.from = !isEmpty(data.from) ? data.from : "";

  if (Validator.isEmpty(data.school)) {
    errors.school = "school is required";
  }

  if (Validator.isEmpty(data.degree)) {
    errors.degree = "degree is required";
  }

  if (Validator.isEmpty(data.fieldofstudy)) {
    errors.fieldofstudy = "field of study is required";
  }

  //I would really like to check for date values in
  //here as well. they throw bad errors if they get
  //through

  if (Validator.isEmpty(data.from)) {
    errors.from = "from date (start) is required";
  }

  //in this json string,
  //you don't need to say errors twice
  //becuase
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
