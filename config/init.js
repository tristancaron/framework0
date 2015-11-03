"use strict";

const mongoose = require('mongoose'),
  yaml = require('js-yaml'),
  fs = require('fs'),
  config = require('./config'),
  glob = require('glob');

(() => {
  mongoose.connect(config.db);
  const db = mongoose.connection;

  glob.sync(config.root + '/app/models/*.js').forEach(model => require(model));

  const data = yaml.safeLoad(fs.readFileSync('./config/database.yaml', 'utf8'));

  const listAsync = [];

  const Group = mongoose.model('Group');
  for (const group of data['groups']) {
    const entry = new Group(group);
    listAsync.push(new Promise((resolve, reject) => {
      entry.save(resolve);
    }));
  }

  Promise.all(listAsync).then(() => {
    const User = mongoose.model('User');
    for (const user of data['users']) {
      Group.findOne({name: user.group}).then(group => {
        user.group = group.id;
        User.register(new User(user), 'Azerty2015!', err => {
          console.log(`err: ${err}`);
        });
      });
    }
  });
})();
