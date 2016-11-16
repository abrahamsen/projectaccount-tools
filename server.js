"use strict";

var path = require("path");
var express = require("express");
var session = require("express-session");
var passport = require("passport");
var pa = require("./projectAccount");
var config = require("./config");
var auth = require("./oauth2");
var compression = require("compression");

var app = express();

//enable gzip
app.use(compression()); 

//enable session storage
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: config.get("SECRET"),
  signed: true
}));

app.all("*", function (req, res, next) {
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

app.get("/", auth.required, function(req, res, next) {
  console.log("requesting /: ", req.user);
  next();
})

app.get("/user", auth.required, function (req, res) {
  pa.getUser(req.query.key, respond(req, res));
});

app.get("/project", auth.required, function (req, res) {
  console.log("projects, user: ", req.user);
  pa.getProjects(req.query.key, respond(req, res));
});

app.get("/module", auth.required, function (req, res) {
  pa.getModules(req.query.key, req.query.project, respond(req, res));
});

app.get("/milestone", auth.required, function (req, res) {
  pa.getMilestones(req.query.key, req.query.project, respond(req, res));
});

app.get("/task", auth.required, function (req, res) {
  pa.getTasks(req.query.key, req.query.project, respond(req, res));
});

app.get("/projectdata", auth.required, function (req, res) {
  pa.getProjectData(req.query.key, req.query.project, respond(req, res));
});

app.use("/v1", express.static(path.resolve(__dirname, "v1")));
app.use(express.static(path.resolve(__dirname, "client")));

app.all("*", function (req, res) {
  res.status(404).send("Page was not found, sorry!");
});

app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var address = this.address();
  console.log(`Server started on http://${address.address}:${address.port}`);
});
