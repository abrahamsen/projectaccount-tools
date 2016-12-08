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

var pa = module.exports = {
    getUser: function(key, cb) {
        request(key, "me", {}, cb);
    },
    getCustomer: function(key, cb) {
        request(key, "customer", {}, cb);
    },
    getSettings: function(key, cb) {
        request(key, "settings", {}, cb);
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
    getTaskStatuses: function(key, cb) {
        request(key, "taskstatus", {limit: 1000}, cb);
    },
    getTaskPriorities: function(key, cb) {
        request(key, "taskpriority", {limit:1000}, cb);
    },
    getWorkTypes: function(key, cb) {
        request(key, "projectworktype", {limit: 1000}, cb);
    },
    getTasks: function(key, cb) {
        request(key, "task", {limit: 1000, excludeclosed: "t"}, cb);
    },
    getTaskNotes: function(key, taskid, cb) {
        request(key, "tasknote", {limit: 1000, taskid: taskid}, cb);
    },
    getTaskDocuments: function(key, taskid, cb) {
        request(key, "document", {limit: 1000, taskid: taskid}, cb);
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
            milestones: function(asyncCb) {
                pa.getMilestones(key, asyncCb);
            },
            modules: function(asyncCb) {
                pa.getModules(key, asyncCb);
            },
            statuses: function(asyncCb) {
                pa.getTaskStatuses(key, asyncCb);
            },
            priorities: function(asyncCb) {
                pa.getTaskPriorities(key, asyncCb);
            },
            worktypes: function(asyncCb) {
                pa.getWorkTypes(key, asyncCb);
            },
            tasks: function(asyncCb) {
                pa.getTasks(key, asyncCb);
            },
            user: function(asyncCb) {
                pa.getUser(key, asyncCb);
            },
            customer: function(asyncCb) {
                pa.getCustomer(key, asyncCb);
            }/*, //commented out, as settings API is currently returning server error 500
            settings: function(asyncCb) {
                pa.getSettings(key, asyncCb);
            }*/
        }, cb);
    },
    getTaskDetails: function(key, taskid, cb) {
        async.parallel({
            notes: function(asyncCb) {
                pa.getTaskNotes(key, taskid, asyncCb);
            }
            //TODO: documents
        }, cb);
    }
};