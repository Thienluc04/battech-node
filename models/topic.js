const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TopicSchema = new Schema(
  {
    name: String,
    slug: String,
    postNumber: Number,
  },
  {
    collection: 'topics',
  }
);

const TopicModel = mongoose.model('topics', TopicSchema);

module.exports = TopicModel;
