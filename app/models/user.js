'use strict';

const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  email: String,
  firstname: String,
  lastname: String,
  group : {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  }
});

UserSchema.plugin(passportLocalMongoose, {usernameQueryFields: ['email'], usernameField: 'email'});

mongoose.model('User', UserSchema);
