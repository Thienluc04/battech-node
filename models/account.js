const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AccountSchema = new Schema(
  {
    username: String,
    password: String,
    email: String,
    avatar: String,
    role: String,
    refreshToken: String,
  },
  {
    collection: 'account',
  }
);

const AccountModel = mongoose.model('account', AccountSchema);

module.exports = AccountModel;
