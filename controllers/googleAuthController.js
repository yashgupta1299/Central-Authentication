const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Google = require('../models/googleModel');
const User = require('../models/userModel');

passport.use(
    'shortTimeAccess',
    new GoogleStrategy(
        {
            callbackURL: `${process.env.AUTHENTICATION_DOMAIN}/auth/sta/callback`,
            clientID: process.env.clientID,
            clientSecret: process.env.clientSecret
        },
        (accessToken, refreshToken, profile, done) => {
            // console.log(profile);
            const googleData = { googleId: profile.id };
            ['name', 'email', 'picture'].forEach(ele => {
                if (profile._json[ele]) {
                    googleData[ele] = profile._json[ele];
                }
            });
            (async () => {
                const user = {
                    id: profile.id,
                    name: profile._json.name,
                    isPreviousSignup: false
                };
                try {
                    await Google.create(googleData);
                } catch (err) {
                    // console.log(err);
                    user.isPreviousSignup = true;
                }

                // i can pass error here
                // done(new Error("something went wrong..."), user);
                done(null, user);
                // i passed user here so that i can use this in callback url as req.user
            })();
        }
    )
);

passport.use(
    'googleLogin',
    new GoogleStrategy(
        {
            callbackURL: `${process.env.AUTHENTICATION_DOMAIN}/auth/signInwithGoogle/callback`,
            clientID: process.env.clientID,
            clientSecret: process.env.clientSecret
        },
        (accessToken, refreshToken, profile, done) => {
            // console.log(profile);
            (async () => {
                const user = {
                    loginAccess: true,
                    id: null
                };
                try {
                    // finding user in database
                    const dbUser = await User.findOne({
                        email: profile._json.email
                    });
                    if (!dbUser) {
                        user.loginAccess = false;
                    } else {
                        // user exist in database
                        user.id = dbUser.id;
                    }
                } catch (err) {
                    user.loginAccess = false;
                }

                // i can pass error here
                // done(new Error("something went wrong..."), user);
                done(null, user);
                // i passed user here so that i can use this in callback url as req.user
            })();
        }
    )
);

passport.serializeUser((user, done) => {
    if (user) return done(null, user);
    return done(null, false);
});

passport.deserializeUser((id, done) => {
    if (user) return done(null, user);
    return done(null, false);
});

module.exports = passport;
