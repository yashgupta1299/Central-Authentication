const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Google = require('./../models/googleModel');

passport.use(
    new GoogleStrategy(
        {
            callbackURL: `${process.env.callbackURLdomain}/auth/callback`,
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
                try {
                    await Google.create(googleData);
                } catch (err) {
                    // console.log(err);
                }
                const user = {
                    id: profile.id
                };

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
