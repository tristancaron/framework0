'use strict';

const mongoose = require('mongoose'),
  uniqueValidator = require('mongoose-unique-validator'),
  Schema = mongoose.Schema;

const GroupSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  rules: Schema.Types.Mixed
});

GroupSchema.plugin(uniqueValidator);

mongoose.model('Group', GroupSchema);
