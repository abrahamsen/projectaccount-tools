"use strict";

const path = require("path");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const pa = require("./projectAccount");
const config = require("./config");
const auth = require("./oauth2");
const compression = require("compression");
const data = require("./data");

const app = express();

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

app.get("/", auth.required, (req, res, next) => {
  console.log("requesting /: ", req.user);
  next();
})

app.get("/user", auth.required, (req, res) => {
  pa.getUser(req.query.key, respond(req, res));
});

app.get("/project", auth.required, (req, res) => {
  console.log("projects, user: ", req.user);
  pa.getProjects(req.query.key, respond(req, res));
});

app.get("/module", auth.required, (req, res) => {
  pa.getModules(req.query.key, req.query.project, respond(req, res));
});

app.get("/milestone", auth.required, (req, res) => {
  pa.getMilestones(req.query.key, req.query.project, respond(req, res));
});

app.get("/task", auth.required, (req, res) => {
  pa.getTasks(req.query.key, req.query.project, respond(req, res));
});

app.get("/projectdata", auth.required, (req, res) => {
  pa.getProjectData(req.query.key, req.query.project, respond(req, res));
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
