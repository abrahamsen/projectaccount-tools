"use strict";

if (typeof String.prototype.trimLeft !== "function") {
    String.prototype.trimLeft = function() {
        return this.replace(/^\s+/, "");
    };
}
if (typeof String.prototype.trimRight !== "function") {
    String.prototype.trimRight = function() {
        return this.replace(/\s+$/, "");
    };
}
if (typeof Array.prototype.map !== "function") {
    Array.prototype.map = function(callback, thisArg) {
        var i, 
                n = this.length, 
                a = [];
        for (i = 0; i < n; i++) {
            if (i in this) 
                a[i] = callback.call(thisArg, this[i]);
        }
        return a;
    };
}
function getCookies() {
    var c = document.cookie, v = 0, cookies = {};
    if (document.cookie.match(/^\s*\$Version=(?:"1"|1);\s*(.*)/)) {
        c = RegExp.$1;
        v = 1;
    }
    if (v === 0) {
        c.split(/[,;]/).map(function(cookie) {
            var parts = cookie.split(new RegExp("="), 2),
                name = decodeURIComponent(parts[0].trimLeft()),
                value = parts.length > 1 ? decodeURIComponent(parts[1].trimRight()) : null;
            cookies[name] = value;
        });
    } else {
        c.match(/(?:^|\s+)([!#$%&'*+\-.0-9A-Z\^`a-z\|~]+)=([!#$%&'*+\-.0-9A-Z\^`a-z\|~]*|"(?:[\x20-\x7E\x80\xFF]|\\[\x00-\x7F])*")(?=\s*[,;]|$)/g).map(function($0, $1) { //test escaping of 2x ^ + | 
            var name = $0,
                value = $1.charAt(0) === '"' ? $1.substr(1, -1).replace(/\\(.)/g, "$1") : $1;
            cookies[name] = value;
        });
    }
    return cookies;
}
function getCookie(name) {
    return getCookies()[name];
}
function setCookie(name, value) {
    document.cookie = name + "=" + value + "; expires=Thu, 18 Dec 2099 12:00:00 UTC";
}
function htmlToText(html) {
    return $("<span>").html(html).text();
}
function dateDiffInDays(a, b) {
    if (b == null)
        return null;
    // Discard the time and time-zone information.
    var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

function dateDiffInDaysMinOne(a, b) {
    var d = dateDiffInDays(a, b);
    if (d === null || d < 1)
        return 1;
    return d;
}

function initGantt(id) {
    gantt.config.xml_date = "%Y-%m-%d %H:%i:%s";
    gantt.config.scale_unit = "week";
    gantt.config.subscales = [{
        unit: "month",
        step: 1,
        date: "%F"
        /*step: 3, //quarter only works if the gantt start date matches the start of a quarter
        template: function(date) {
            console.log("subscale date: " + date);
            return "Q" + (Math.floor(date.getMonth()/3) + 1)
        }*/
    }];
    gantt.config.date_scale = "Week %W";
    gantt.config.scale_height = 40;
    
    /*//add "Today" marker
    var marker = gantt.addMarker({ start_date: new Date(), css: "today", title:date_to_str( new Date())});
    setInterval(function(){
        var today = gantt.getMarker(marker);
        today.start_date = new Date();
        today.title = date_to_str(today.start_date);
        gantt.updateMarker(marker);
    }, 1000*60);*/
    
    gantt.init(id);
}

var ganttConverters = {
    id: 1,
    project: function(project) {
        ganttConverters.lastProject = ganttConverters.id++;
        return {
            id: ganttConverters.id++,
            text: project.name,
            start_date: project.start,
            duration: dateDiffInDaysMinOne(project.start, project.end),
            open: true,
            base: project
        };
    },
    milestone: function(milestone) {
        ganttConverters.lastMilestone = ganttConverters.id++;
        return {
            id: ganttConverters.lastMilestone,
            text: milestone.title,
            start_date: milestone.start,
            duration: dateDiffInDaysMinOne(milestone.start, milestone.end),
            open: true,
            parent: ganttConverters.lastProject,
            progress: parseFloat(milestone.progress) / 100,
            base: milestone
        };
    },
    task: function(task) {
        return {
            id: ganttConverters.id++,
            text: task.title,
            start_date: task.start,
            duration: dateDiffInDaysMinOne(task.start, task.end),
            parent: ganttConverters.lastMilestone,
            base: task
        };
    }
};