const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TagSchema = new Schema(
  {
    name: String,
  },
  {
    collection: 'tags',
  }
);

const TagModel = mongoose.model('tags', TagSchema);

module.exports = TagModel;
