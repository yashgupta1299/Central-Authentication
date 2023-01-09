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
        failureRedirect: 'http://127.0.0.1:4000/?alert=authenticationFailed',
        session: false
    }),
    (req, res) => {
        (async () => {
            try {
                // console.log('call back1');
                // const token = await jwtSignToken(req.user.id);
                // console.log('call back2');
                // console.log(token);
                // const token = await promisify(jwt.sign)(
                //     { id: req.user.id },
                //     process.env.JWT_SECRET_KEY,
                //     {
                //         expiresIn: '5m'
                //     }
                // );

                await promisify(jwt.sign)(
                    { id: req.user.id },
                    process.env.JWT_SECRET_KEY_STA,
                    { expiresIn: '5min', algorithm: 'RS256' },
                    (err, token) => {
                        if (!err) {
                            // cookie for signup purpose
                            res.cookie('sta', token, {
                                expires: new Date(Date.now() + 5 * 60 * 1000),
                                // cannot be changed by browser
                                httpOnly: true,
                                // connection can be done only over https
                                secure:
                                    req.secure ||
                                    req.headers['x-forwarded-proto'] === 'https'
                            });
                            res.redirect(`http://127.0.0.1:4000/signup`);
                        }
                    }
                );
            } catch (err) {
                res.redirect(
                    'http://127.0.0.1:4000/?alert=authenticationFailed'
                );
            }
        })();
    }
);

////

module.exports = router;
