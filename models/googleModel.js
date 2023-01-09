const mongoose = require('mongoose');

// assumption _id and email is always available
const googleSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        default: 'User'
    },
    email: {
        type: String
    },
    picture: { type: String, default: 'default.jpg' }
});

const Google = mongoose.model('Google', googleSchema);

module.exports = Google;
