'use strict';

// Imports
const express = require('express'),
  passport = require('passport'),
  router = express.Router(),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Group = mongoose.model('Group'),
  multer = require('multer'),
  upload = multer(),
  flash = require('express-flash'),
  validate = require('validate.js'),
  generatePassword = require('password-generator'),
  sendgrid  = require('sendgrid')('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');

module.exports = app => app.use('/user', router);


//****************************************************************************//
// Validator                                                                  //
//****************************************************************************//

const registerValidator = {
  firstname: {
    presence: true,
    length: {
      minimum: 3,
      tooShort: "Needs to have %{count} words or more."
    }
  },
  lastname: {
    presence: true,
    length: {
      minimum: 3,
      tooShort: "Needs to have %{count} words or more."
    }
  },
  email: {
    presence: true,
    email: true
  },
  password: {
    presence: true,
    length: {
      minimum: 5,
      tooShort: "Needs to have %{count} words or more."
    }
  },
  'password-verify': {
    presence: true,
    equality: 'password'
  },
  terms: {
    presence: true,
    format: {
      pattern: 'on',
      flags: "i",
      message: "Terms must be accepted"
    }
  }
};

const updateValidator = {
  email: {
    presence: true,
    email: true
  },
  password: {
    length: {
      minimum: 5,
      tooShort: "Needs to have %{count} words or more."
    }
  },
  'repassword': {
    equality: 'password'
  },
  'current-password': {
    presence: true,
    length: {
      minimum: 5,
      tooShort: "Needs to have %{count} words or more."
    }
  }
};

const reminderValidator = {
  email: {
    presence: true,
    email: true
  }
};

//****************************************************************************//

router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  res.render('user/authentication', {
    title: 'FrameWork - Log in',
    loginError: req.flash('error'),
    registerError: req.flash('registerError'),
    reminderError: req.flash('reminderError')
  });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/user/login',
  failureFlash: true
}));

router.post('/register', (req, res, next) => {
  const isNotValid = validate(req.body, registerValidator, {format: "flat"});

  if (isNotValid) {
    req.flash('registerError', isNotValid);
    res.redirect('/user/login#register');
  } else {
    User.register(new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      username: req.body.email
    }), req.body.password, err => {
      if (err) {
        req.flash('registerError', [err.message.replace(/username/, 'email')]);
        res.redirect('/user/login#register');
      } else res.redirect('/');
    });
  }
});

router.post('/reminder', (req, res, next) => {
  const isNotValid = validate(req.body, reminderValidator, {format: "flat"});

  if (isNotValid) {
    req.flash('reminderError', 'Bad email');
    res.redirect('/user/login#reminder');
  } else {
    User.findOne({email: req.body.email}).then(user => {
      if (!user) {
        req.flash('reminderError', 'Bad email');
        return res.redirect('/user/login#reminder');
      }
      const newPassword = generatePassword(8, false);
      var email     = new sendgrid.Email({
        to:       user.email,
        from:     'tcaron@student.42.fr',
        subject:  'Your new password',
        text:     newPassword
      });
      sendgrid.send(email, function(err, json) {
        if (err) {
          console.error(err);
          return res.sendStatus(500);
        }
        console.log(json);
        user.setPassword(newPassword, () => user.save(() => res.redirect('/user/login')));
      });
    }).catch(error => {
      console.error(error);
      res.sendStatus(500);
    });
  }
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/user/login');
});

router.put('/update/:id', isAuthenticated, upload.array(), (req, res) => {
  if (req.params.id !== req.user.id) return req.sendStatus(403);

  const isNotValid = validate(req.body, updateValidator);

  if (isNotValid) {
    req.sendStatus(400);
  } else {
    User.authenticate()(req.user.email, req.body['current-password'], (err, result) => {
      if (!result) {
        res.json({
          status: 'fail',
          errors: {
            'current-password': 'Wrong password'
          }
        });
      } else {
        req.user.email = req.body.email;
        req.user.save();
        if (req.body.password) req.user.setPassword(req.body.password, () => {
          req.user.save();
        });
        res.json({
          status: 'ok'
        });
      }
    });
  }
});

// Middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/user/login');
}
