"use strict";

var path = require("path");
var express = require("express");
var pa = require("./projectAccount.js");

var app = express();

app.use("/v1", express.static(path.resolve(__dirname, "v1")));
app.use(express.static(path.resolve(__dirname, "dhtmlx")));

app.all("*", function(req, res, next) {
  console.log("request: " + req.url);
  next();
});

app.get("/user", function(req, res){
  pa.getUser(req.query.key, function(err, user) {
    if (err)
      return res.status(500).send(err);
    res.send(user);
  });
});

app.get("/project", function(req, res){
  pa.getProjects(req.query.key,  respond(req, res));
});

app.get("/module", function(req, res){
  pa.getModules(req.query.key, req.query.project,  respond(req, res));
});

app.get("/milestone", function(req, res){
  pa.getMilestones(req.query.key, req.query.project,  respond(req, res));
});

app.get("/task", function(req, res){
  pa.getTasks(req.query.key, req.query.project, respond(req, res));
});

app.get("/projectdata", function(req, res){
  pa.getProjectData(req.query.key, req.query.project, respond(req, res));
});

app.all("/auth/callback", function(req, res) {
  res.header("Content-Type", "application/json");
  res.send(JSON.stringify(req.query, null, 2));
});

app.all("*", function(req, res) {
  res.status(404).send("Page was not found, sorry!");
});

app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  console.log("Server started");
});

function respond(req, res) {
  return function(err, data) {
    if (err)
      return res.status(400).send(err);
      
    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(data, null, 2));
  };
}