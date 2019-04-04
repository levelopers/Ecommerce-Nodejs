const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var Cart = require('../models/Cart');

//GET /login
router.get('/login', function (req, res) {
  let errors = res.locals.error //extract authenticate failure message
  if (errors.length > 0) {
    res.status(400).send({ errors })
  } else {
    res.send('login')
  }
});

//GET /signin
router.get('/signin', function (req, res) {
  res.send('signin')
});

//POST /signin
router.post('/signin', function (req, res, next) {
  const { username, fullName, password, verifyPassword } = req.body
  req.checkBody('fullName', 'Full name is required').notEmpty();
  req.checkBody('username', 'Email is required').notEmpty();
  req.checkBody('username', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password', 'Passwords have to match').equals(req.body.verifyPasswordField);

  var errors = req.validationErrors();
  if (errors) {
    res.status(400).send({
      errors: errors,
      title: 'Signin',
    });
  } else {
    var newUser = new User({
      username: username,
      password: password,
      fullname: fullName
    });
    User.createUser(newUser, function (err, user) {
      if (err) throw err;
    });
    req.flash('success_msg', 'You are registered and you can login');
    res.redirect('/users/login');
  }
});


//passport localstrategy
passport.use(new LocalStrategy(function (username, password, done) {
  User.getUserByUsername(username, function (err, user) {
    if (err) throw err;
    if (!user) {
      return done(null, false, { message: 'Unknown User' });
    }
    User.comparePassword(password, user.password, function (err, isMatch) {
      if (err) throw err;
      if (isMatch) {
        return done(null, user);
      }
      else {
        return done(null, false, { message: 'Invalid password' });
      }
    });
  });
}));

// Serialize user
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});

//POST /login
router.post('/login',
  passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: true }),
  //pass authenticate
  function (req, res, next) {
    let uid = req.session.passport.user;
    User.getUserById(uid, function (e, user) {
      if (e) {
        console.log("Failed on router.get('/login')\nError:".error, e.message.error + "\n")
        e.status = 406; next(e);
      }
      else {
        //initialize Cart
        let cart = new Cart(user.cart ? user.cart : {});
        req.session.cart = cart;
        req.session.user = {} //clear user?
        return res.redirect('/');
      }
    })
  }
)

//GET /logout
router.get('/logout', function (req, res, next) {
  let uid = req.session.passport.user
  let cart = req.session.cart
  if (cart && cart.userId == uid) {
    User.findOneAndUpdate({ "_id": uid }, //mongoose api
      {
        $set: {
          "cart": req.session.cart
        }
      },
      { new: true }, function (e, result) {
        if (e) {
          console.log("Failed on router.post('/logout')\nError:".error, e.message.error + "\n")
          e.status = 406; next(e);
        }
        else {
          req.logout();
          req.flash('success_msg', 'You are logged out');
          res.redirect('/');
        }
      });
  }
  else {
    req.session.cart = null;
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  }
})

module.exports = router;