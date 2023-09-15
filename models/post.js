const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    title: String,
    description: String,
    content: String,
    slug: String,
    image: String,
    topic: String,
    author: String,
    tags: Array,
    date: String,
  },
  {
    collection: 'posts',
  }
);

const PostModel = mongoose.model('posts', PostSchema);

module.exports = PostModel;
