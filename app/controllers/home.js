'use strict';

// Imports

const express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Article = mongoose.model('Article');

// Routes

router.get('/', isAuthenticated, (req, res) =>
  res.render('index', {
    title: 'Framework',
    user: req.user
  })
);

// Middleware

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    req.user.populate('group', () => {
      return next();
    });
  } else {
    res.redirect('/user/login');
  }
}

module.exports = app => app.use('/', router);
