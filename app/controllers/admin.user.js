'use strict';

// Imports

const express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Group = mongoose.model('Group'),
  validate = require('validate.js');

//****************************************************************************//
// Validators                                                                 //
//****************************************************************************//

const userValidator = {
  'email': {
    email: true,
    presence: true
  },
  'group': {
    presence: true
  },
  'password': {
    presence: true
  }
};

//****************************************************************************//


router.get('/user', isAdminAllow('users'), (req, res) =>
  res.render('admin/user', {
    title: 'Framework',
    user: req.user
  })
);

router.get('/user/list', isAdminAllow('users'), (req, res) =>
  User.find({}).populate('group').then(users => {
    res.json({data: users})
  }).catch(error => {
    console.error(error);
    res.sendStatus(500);
  })
);

router.get('/user/get/:id', isAdminAllow('users'), (req, res) =>
  User.findById(req.params.id, '-_id -__v').populate('group', 'name -_id').then(users => {
    res.json({data: users})
  }).catch(error => {
    console.error(error);
    res.sendStatus(400);
  })
);

router.post('/user/add', isAdminAllow('users'), (req, res) => {
  if (!req.user.group.rules['users']['write'])
    return res.sendStatus(403);

  const isNotValid = validate(req.body, userValidator);

  if (isNotValid) return res.sendStatus(400);

  Group.findOne({name: req.body.group}).then(group => {
    User.register(new User({
      email: req.body.email,
      username: req.body.email,
      group: group.id
    }), req.body.password, err => {
      if (err) {
        console.error(err);
        res.sendStatus(400);
      } else {
        res.sendStatus(200);
      }
    });
  }).catch(error => {
    console.error(error);
    res.sendStatus(400);
  });
});

router.put('/user/update/:id', isAdminAllow('users'), (req, res) => {
  if (!req.user.group.rules['users']['write'])
    return res.sendStatus(403);

  const isNotValid = validate({
    email: req.body.email,
    group: req.body.group,
    password: 'a'
  }, userValidator);

  if (isNotValid) return res.sendStatus(400);

  User.findById(req.params.id).then(user => {
    Group.findOne({name: req.body.group}).then(group => {
      req.body.group = group.id;
      Object.assign(user, req.body).save(err => {
        if (err) {
          console.error(err);
          res.sendStatus(500);
        } else {
          res.sendStatus(200);
        }
      });
    }).catch(error => {
      console.error(error);
      res.sendStatus(400);
    })
  }).catch(error => {
    console.error(error);
    res.sendStatus(400);
  })
});

router.delete('/user/delete/:id', isAdminAllow('users'), (req, res) => {
  if (!req.user.group.rules['users']['write'])
    return res.sendStatus(403);

  User.findById(req.params.id).remove().exec(error => {
    if (error) {
      console.error(error);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

function isAdminAllow(ruleName) {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      req.user.populate('group', (err) => {
        if (err) return res.redirect('/');

        if (!req.user.group
          || !req.user.group.rules[ruleName]
          || !req.user.group.rules[ruleName]['read']) return res.redirect('/');

        return next();
      })
    } else {
      res.redirect('/');
    }
  }
}

module.exports = app => app.use('/admin', router);
