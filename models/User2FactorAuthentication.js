const mongoose = require('mongoose');
const { createAdapter } = require('sst/node/auth');
const Schema = mongoose.Schema;

const user2FactorAuthenticationSchema = new Schema({
    userId:String,
    code: String,
    createAt: Date,
    expiresAt: Date
});

const User2FactorAuthentication = mongoose.model('User2FactorAuthentication', user2FactorAuthenticationSchema);

module.exports = User2FactorAuthentication;