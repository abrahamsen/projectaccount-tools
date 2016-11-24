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
if (typeof Array.prototype.filter !== "function") {
    Array.prototype.filter = function(fun/*, thisArg*/) {
        if (this === void 0 || this === null) {
            throw new TypeError();
        }

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function') {
            throw new TypeError();
        }

        var res = [];
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i];
                if (fun.call(thisArg, val, i, t)) {
                    res.push(val);
                }
            }
        }

        return res;
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
    if (a == null || b == null)
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

function initGantt(id, ganttData) {
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
    gantt.parse(ganttData);
}

//parses dates in the format "2016-12-24" or "2016-12-24 23:59:59"
function parseDate(input) {
    var parts = input.split(" ");
    var dateParts = parts[0].split("-");
    var d = new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10)-1, parseInt(dateParts[2], 10));
    if (parts.length > 1) {
        var hms = parts[1].split(":");
        d.setHours(parseInt(hms[0], 10));
        d.setMinutes(parseInt(hms[1], 10));
        d.setSeconds(parseInt(hms[2], 10));
    }
    return d;
}

var ganttConverters = {
    id: 1,
    project: function(project) {
        ganttConverters.lastProject = ganttConverters.id++;

        project.start = parseDate(project.datestart);
        project.end = project.dateend == null ? null : parseDate(project.dateend);

        return {
            id: ganttConverters.id++,
            text: project.name,
            start_date: project.start,
            duration: dateDiffInDaysMinOne(project.start, project.end),
            open: true,
            base: project
        };
    },
    milestone: function(milestone, parent) {
        ganttConverters.lastMilestone = ganttConverters.id++;
        
        milestone.start = milestone.dateopen == null ? parent.start : parseDate(milestone.dateopen);
        milestone.end = milestone.datedue == null ? parent.end : parseDate(milestone.datedue);
        
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
    task: function(task, parent) {
        task.start = task.dateopen == null ? parent.start : parseDate(task.dateopen);
        task.end = task.datedue == null ? parent.end : parseDate(task.datedue);
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