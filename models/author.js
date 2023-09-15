const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AuthorSchema = new Schema(
  {
    name: String,
  },
  {
    collection: 'authors',
  }
);

const AuthorModel = mongoose.model('authors', AuthorSchema);

module.exports = AuthorModel;
