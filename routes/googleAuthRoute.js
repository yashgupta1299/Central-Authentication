const express = require('express');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const router = express.Router();

const passport = require('../controllers/googleAuthController');

router.use(passport.initialize());

//////

router.get(
    '/',
    passport.authenticate('google', {
        session: false,
        scope: ['profile', 'email']
    })
);

////

router.get(
    '/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_DOMAIN}/?alert=authenticationFailed`,
        session: false
    }),
    (req, res) => {
        (async () => {
            try {
                await promisify(jwt.sign)(
                    { id: req.user.id },
                    process.env.JWT_SECRET_KEY_STA,
                    { expiresIn: '5min', algorithm: 'RS256' },
                    (err, token) => {
                        if (!err) {
                            // cookie for signup purpose
                            res.cookie(
                                'sta',
                                token,
                                {
                                    expires: new Date(
                                        Date.now() + 5 * 60 * 1000
                                    ),
                                    // cannot be changed by browser
                                    httpOnly: true,

                                    // cookie send back from browser if generated from the same origin
                                    // sameSite: 'strict',

                                    // connection can be done only over https(if true)
                                    secure:
                                        process.env.cookieSecure ||
                                        req.secure ||
                                        req.headers['x-forwarded-proto'] ===
                                            'https'
                                },
                                { path: '/' }
                            );

                            res.redirect(
                                302,
                                `${process.env.FRONTEND_DOMAIN}/signup/?signUpName=${req.user.name}&isPreviousSignup=${req.user.isPreviousSignup}`
                            );

                            // app.get('/redirect', (req, res) => {
                            //     res.cookie('name', 'value', { path: '/' });
                            //     res.redirect(302, '/newlocation');
                            //   });
                        }
                    }
                );
            } catch (err) {
                res.redirect(
                    `${process.env.FRONTEND_DOMAIN}/?alert=authenticationFailed`
                );
            }
        })();
    }
);

////

module.exports = router;
