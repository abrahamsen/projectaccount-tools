"use strict";

const express = require("express");
const config = require("./config");
const passport = require("passport");
const Strategy = require("passport-google-oauth20").Strategy;
const router = express.Router();

function extractProfile(profile) {
    let imageUrl = "";
    let email = "";

    if (profile.photos && profile.photos.length) {
        imageUrl = profile.photos[0].value;
    }
    if (profile.emails && profile.emails.length) {
        email = profile.emails[0].value;
    }
    return {
        id: profile.id,
        displayName: profile.displayName,
        image: imageUrl,
        email: email
    };
}

passport.use(new Strategy({
    clientID: config.get("OAUTH2_CLIENT_ID"),
    clientSecret: config.get("OAUTH2_CLIENT_SECRET"),
    callbackURL: config.get("OAUTH2_CALLBACK"),
    accessType: "offline"
}, (accessToken, refreshToken, profile, cb) => {
    cb(null, extractProfile(profile));
}));

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((obj, cb) => {
    cb(null, obj);
});

function authRequired(req, res, next) {
    if (!req.user) {
        req.session.oauth2return = req.originalUrl;
        return res.redirect("/auth/login");
    }
    next();
}

function addTemplateVariables(req, res, next) {
    res.locals.profile = req.user;
    res.locals.login = `/auth/login?return=${encodeURIComponent(req.originalUrl)}`;
    res.locals.logout = `/auth/logout?return=${encodeURIComponent(req.originalUrl)}`;
    next();
}

router.get("/auth/login", (req, res, next) => {
    if (req.query.return) {
        req.session.oauth2return = req.query.return;
    }
    next();
},
    passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get("/auth/callback", passport.authenticate("google"), (req, res) => {
    const redirect = req.session.oauth2return || "/";
    delete req.session.oauth2return;
    res.redirect(redirect);
});

router.get("/auth/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

module.exports = {
    extractProfile: extractProfile,
    router: router,
    required: authRequired,
    template: addTemplateVariables
};