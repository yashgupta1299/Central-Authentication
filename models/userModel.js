const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
// const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email!'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please provide a valid email!']
    },
    photo: { type: String, default: 'default.jpg' },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide your password!'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password!'],
        validate: {
            validator: function(val) {
                return val === this.password;
            },
            message: 'Password do not match'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

// function to create hash before saving the password
// runs on CREATE and SAVE
userSchema.pre('save', async function(next) {
    // isModified function:
    // Returns true if any of the given paths is modified,
    // else false. If no arguments, returns true if any path
    // in this document is modified.
    if (!this.isModified('password')) return next();

    // hash the password with cost 12
    this.password = await bcrypt.hash(this.password, 12);

    // delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

// updating passwordChangedAt variable
userSchema.pre('save', function(next) {
    // if password is not modified or doc its new then return
    if (!this.isModified('password') || this.isNew) return next();

    // set the current time minus 1 sec (to accomodate delay if it happened)
    // because we are also issue jwt
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// pre query Middleware
userSchema.pre(/^find/, async function(next) {
    this.find({ active: { $ne: false } });
    next();
});

// instance method available for all documents of a certain collection
userSchema.methods.correctPassword = async function(origPass, hashPass) {
    return await bcrypt.compare(origPass, hashPass);
};

// function to check is Token Issued Before PassChanged
userSchema.methods.isTokenIssuedBeforePassChanged = function(JWTissuedTime) {
    if (this.passwordChangedAt) {
        const passChangedAt = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTissuedTime < passChangedAt;
    }
    return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
