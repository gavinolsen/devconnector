const express = require('express');
const mongoose = require('mongoose');
const body_parser = require('body-parser');
const passport = require('passport');

//you want to put the models here!
const users = require('./routes/api/users');
const posts = require('./routes/api/posts');
const profile = require('./routes/api/profile');

//initialize the app with express
const app = express();

app.use(body_parser.urlencoded({ extended: false }));
app.use(body_parser.json());

//get the mongo key!
const db = require('./config/keys').mongoURI;

//connect to the database with the key!
// with useNewUrlParser : true
// we can make sure that we use new versions
//of the body parser.
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log('mongo db connected'))
  .catch(err => console.log(err));

//passport middleware setup
app.use(passport.initialize());

//everything else will be put into a passport
//config file
require('./config/passport')(passport);

//use the routes we made above
app.use('/api/users', users);
app.use('/api/posts', posts);
app.use('/api/profile', profile);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
