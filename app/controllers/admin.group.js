'use strict';

// Imports

const express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Group = mongoose.model('Group'),
  validate = require('validate.js');

const _rules = [
  'groups',
  'users'
];

//****************************************************************************//
// Validators                                                                 //
//****************************************************************************//

const groupValidator = {
  'group-name': {
    presence: true
  }
};

//****************************************************************************//

router.get('/group', isAdminAllow('groups'), (req, res) =>
  res.render('admin/group', {
    title: 'Framework',
    user: req.user,
    rules: _rules
  })
);

router.get('/group/list', isAdminAllow('groups'), (req, res) =>
  Group
    .find({})
    .select('name rules')
    .then(groups => res.json({data: groups}))
    .catch(error => {
      console.error(error);
      res.sendStatus(500);
    })
);

router.get('/group/rules', isAdminAllow('groups'), (req, res) =>
  res.json({data: _rules})
);

router.post('/group/add', isAdminAllow('groups'), (req, res) => {
  if (!req.user.group.rules['groups']['write'])
    return res.sendStatus(403);

  const isNotValid = validate(req.body, groupValidator);

  if (isNotValid) return req.sendStatus(400);

  const name = req.body['group-name'];

  const rules = {};

  for (const rule of _rules) {
    rules[rule] = {
      read: req.body[`${rule}.read`] === 'on',
      write: req.body[`${rule}.write`] === 'on'
    }
  }

  const group = new Group({
    name,
    rules
  });

  group.save(err => {
    if (err && err.name !== 'ValidationError') {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.redirect('/admin/group')
    }
  });
});

router.post('/group/update/:id', isAdminAllow('groups'), (req, res) => {
  if (!req.user.group.rules['groups']['write'])
    return res.sendStatus(403);

  const rules = {};

  for (const rule of _rules) {
    rules[rule] = {
      read: req.body[`${rule}.read`] === 'on',
      write: req.body[`${rule}.write`] === 'on'
    }
  }

  Group
    .findByIdAndUpdate(req.params.id, {$set: {rules}})
    .then(() => res.redirect('/admin/group'))
    .catch(error => {
      console.error(error);
      res.sendStatus(400);
    });
});

router.delete('/group/delete/:id', isAdminAllow('groups'), (req, res) => {
  if (!req.user.group.rules['groups']['write'])
    return res.sendStatus(403);

  Group.findById(req.params.id).remove().exec(error => {
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
