"use strict";

var https = require("https");
var async = require("async");
var url = require("url");
var cache = {};

function request(key, resource, parameters, cb) {
    if (!key) {
        return cb("missing key");
    }
    https.request({
        hostname: "api.myintervals.com",
        path: url.format({pathname: "/" + resource, query: parameters}),
        auth: key + ":X",
        headers: {
            Accept: "application/json"
        }
    },
    function(res) {
        var str = "";
        res.on("data", function(data) {
            str += data;
        });
        res.on("end", function() {
            console.log("data: " + str);
            var data = JSON.parse(str);
            if (data.status != "OK")
                return cb(data, null);
            cb(null, data[resource]);
        });
    }).on("error", function(e) {
        return cb(e);
    }).end();
}

function cacheableRequest(key, resource, cb) {
    
}

var pa = module.exports = {
    getUser: function(key, cb) {
        request(key, "me", {}, cb);
    },
    getPersons: function(key, cb) {
        request(key, "person", {limit: 1000}, cb);
    },
    getClients: function(key, cb) {
        request(key, "client", {limit: 1000}, cb);
    },
    getProjects: function(key, cb) {
        request(key, "project", {limit: 1000, active: "t"}, cb);
    },
    getModules: function(key, cb) {
        request(key, "projectmodule", {limit: 1000, active: "t"}, cb);
    },
    getMilestones: function(key, cb) {
        request(key, "milestone", {limit: 1000, complete: "f"}, cb);
    },
    getTasks: function(key, cb) {
        request(key, "task", {limit: 1000, excludeclosed: "t"}, cb);
    },
    getTasksByProject: function(key, projectid, cb) {
        request(key, "task", {limit: 1000, excludeclosed: "t", localid: projectid}, cb);
    },
    getProjectData: function(key, project, cb) {
        async.parallel({
            milestone: function(asyncCb) {
                pa.getMilestones(key, project, asyncCb);
            },
            tasks: function(asyncCb) {
                pa.getTasks(key, project, asyncCb);
            }
        }, cb);
    },
    getUserData: function(key, cb) {
        async.parallel({
            projects: function(asyncCb) {
                pa.getProjects(key, asyncCb);
            },
            persons: function(asyncCb) {
                pa.getPersons(key, asyncCb);
            },
            clients: function(asyncCb) {
                pa.getClients(key, asyncCb);
            },
            tasks: function(asyncCb) {
                pa.getTasks(key, asyncCb);
            }
        }, cb);
    }
};