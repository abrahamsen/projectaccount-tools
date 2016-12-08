"use strict";
//test3
const path = require("path");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const pa = require("./projectaccount-api");
const config = require("./config");
const auth = require("./oauth2");
const compression = require("compression");
const db = require("./data");

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}))

//enable gzip
app.use(compression()); 

//enable session storage
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: config.get("SECRET"),
    signed: true
}));

app.all("*", (req, res, next) => {
    console.log("request: " + req.url);
    next();
});

// OAuth2
app.use(passport.initialize());
app.use(passport.session());
app.use(auth.router);

function respond(req, res) {
    return function (err, data) {
        if (err) {
            return res.status(400).send(err);
        }

        res.header("Content-Type", "application/json");
        res.send(data);//JSON.stringify(data, null, 2));
    };
}

var requireUser = [
    auth.required, 
    (req, res, next) => {
        db.user.get(req.user.id, (err, user) => {
            if (user == null) {
                db.user.save(req.user, (err, user) => {
                    if (err) 
                        return console.error(err);
                    res.redirect("/usertoken");
                });
            }
            else if (!user.token)
                res.redirect("/usertoken");
            else {
                req.session.usertoken = user.token;
                next();
            }
        });
    }
];

function requireData(req, res, next) {
    if (req.session.pa) {
        next();
    }
    else {
        pa.getUserData(req.session.usertoken, function(err, data) {
            if (err) {
                console.error(err);
                return res.redirect("/usertoken/invalid");
            }
            req.session.pa = data;
            next();
        });
    }
}

function render(req, res, file, data) {
    res.render("master.ejs", { content: file, req: req, data: data});
}

app.get("/", (req, res, next) => {
    if (req.user)
        res.redirect("/gantt");
    else
        render(req, res, "login.ejs"); 
});

app.get("/gantt/:view?/:key?", requireUser, requireData, (req, res, next) => {
    render(req, res, "gantt.ejs");
});

app.get("/settings", requireUser, (req, res, next) => {
    render(req, res, "settings.ejs");
});

app.get("/usertoken/:error?", auth.required, (req, res, next) => {
    if (req.params.error) {
        db.user.get(req.user.id, (err, user) => {
            if (user != null) {
                user.token = null;
                db.user.save(req.user, (err, user) => {
                    next();
                });
            }
            else
                next();
        });
    }
    else
        next();
}, (req, res) => {
    render(req, res, "usertoken.ejs");
});

app.post("/usertoken", auth.required, (req, res) => {
    db.user.get(req.user.id, (err, user) => {
        if (user == null) {
            res.redirect("/usertoken/error");
        }
        else {
            user.token = req.body.usertoken;
            db.user.save(user, (err, result) => {
                res.redirect("/");
            });
        }
    });
});

app.use("/v1", express.static(path.resolve(__dirname, "v1")));
app.use(express.static(path.resolve(__dirname, "client")));

app.all("*", (req, res) => {
    res.status(404).send("Page was not found, sorry!");
});

var server = app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", () => {
    var address = server.address();
    console.log(`[${(new Date().toString()).substr(0, (new Date().toString()).indexOf(" ("))}] Server started on http://${address.address}:${address.port}`);
});
