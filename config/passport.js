//create the passport jwt strategy
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
//you'll need model stuff
//comes from your model files
const mongoose = require("mongoose");
const User = mongoose.model("users");

const keys = require("../config/keys");

//wtf is this???
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secret;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      //get the user sent in the token !

      User.findById(jwt_payload.id)
        .then(user => {
          if (user) {
            //there's no error, and give back the user
            console.log(jwt_payload);
            console.log(user);
            return done(null, user);
          }
          return done(null, false);
        })
        .catch(err => console.log(err));
    })
  );
};

/**
 * if you console.log(jwt_payload)
 * 
 * you get the following responst
 * 
 * { id: '5c06f32d669696daf8a692a9',
  name: 'Gavin',
  avatar:
   '//www.gravatar.com/avatar/c653b6423ae6aff58eaef6fe2d84219d?s=200&r=pg&d=mm',
  iat: 1543964368,
  exp: 1543967968 }
 * 
 * 
 * issued at 
 * expiration
 * 
 * 
 * done is actually a function!
 */
