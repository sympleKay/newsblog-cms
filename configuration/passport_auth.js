//dependencies
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const user = require('../models/userModel');

passport.use(new localStrategy((username, password, done) => {
    user.findOne( { username:username }, (err, docs) => {
        if (err) {
            console.error(err);
            res.render('error/500');
        }
        if (!docs) {
            return done(null, false, {message: 'Username does not exist'});
        }
        //Match Password with Hash Password
        bcrypt.compare(password, docs.password, (err, isMatch) => {
            if (err) {
                console.error(err);
                res.render('error/500');
            }
            if (isMatch) {
                return done (null, docs)
            } else {
                return done(null, false, {message: 'Incorrect Password'});
            }
        })
    })
    passport.serializeUser((docs, done) => {
        done(null, docs.id);
    })
    passport.deserializeUser((id, done) => {
        user.findById(id, (err, docs) => {
            done(err, docs)
        })
    })
}))

module.exports = passport;