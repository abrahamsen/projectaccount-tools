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
      if (i in this) a[i] = callback.call(thisArg, this[i]);
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

function paPopup(cbs) {
  var apiKey, project;
  var p = $("<div>").attr("id", "projectPopup").css("display", "none");
  $("<div>").text("Please enter your ProjectAccount API key:").appendTo(p);
  $("<input>").attr("id", "apiKey").css("width", "100%").appendTo(p);
  $("<button>").text("Load Project List").appendTo(p).button().on("click", function() {
    apiKey = $("#apiKey").val();
    setCookie("apiKey", apiKey);
    
    $("#apiKeyOk").prop("disabled", true);
    
    $.ajax({
      url: "/project",
      data: { 
        key: apiKey
      },
      dataType: "json",
      type: "GET",
      success: function(data, textStatus, jqXHR) {
        console.log("projects status", textStatus);
        console.log("projects data", data);
        $.each(data, function() {
          $("<option>").val(this.id).text(this.name).data("project", this).appendTo("#projectSelector");
        });
        $("#projectSelector").prop("disabled", false);
      },
      complete: function(jqXHR, textStatus) {
        console.log("apikey load: " + textStatus);
        $("#apiKeyOk").prop("disabled", false);
      }
    });
  });
  
  $("<br>").appendTo(p);
  $("<div>").text("Please choose your project:").appendTo(p);
  $("<select>").attr("id", "projectSelector").prop("disabled", true).css("width", "100%").appendTo(p);
  $("<button>").text("Load Project").appendTo(p).button().on("click", function() {
    project = $("#projectSelector > option:selected").data("project");
    if (!project)
      return;
    
    $("#paLoad").prop("disabled", true);
    
    $.ajax({
      url: "/projectdata",
      data: { 
        key: apiKey,
        project: project.id
      },
      dataType: "json",
      type: "GET",
      success: function(data, textStatus, jqXHR) {
        console.log("project data", data);
        
        project.start = $.datepicker.parseDate("yy-mm-dd", project.datestart);
        project.end = project.dateend == null ? null : $.datepicker.parseDate("yy-mm-dd", project.dateend);
        
        (cbs.project || $.noop)(project)
        
        $.each(data.milestone, function() {
          var milestone = this,
            tasks = $.grep(data.tasks, function(task) {
              return task.milestoneid == milestone.id;
            });
          
          milestone.start = milestone.dateopen == null ? project.start : $.datepicker.parseDate("yy-mm-dd", milestone.dateopen);
          milestone.end = milestone.datedue == null ? project.end : $.datepicker.parseDate("yy-mm-dd", milestone.datedue);
          
          (cbs.milestone || $.noop)(project, milestone);
          console.log("milestone tasks: ", tasks);
          
          $.each(tasks, function() {
            var task = this;
            
            task.start = task.dateopen == null ? milestone.start : $.datepicker.parseDate("yy-mm-dd", task.dateopen);
            task.end = task.datedue == null ? milestone.end : $.datepicker.parseDate("yy-mm-dd", task.datedue);
            
            (cbs.task || $.noop)(project, milestone, task);
          });
        });
        $("#projectPopup").dialog("close");
        (cbs.done || $.noop)(false);
      },
      complete: function(jqXHR, textStatus) {
        $("#paLoad").prop("disabled", false);
      }
    });
  });
  $("<span>").html("&nbsp;&nbsp;&nbsp;").appendTo(p);
  $("<button>").text("Just load demo data").appendTo(p).button().on("click", function() {
    (cbs.demo || $.noop)(true);
    $("#projectPopup").dialog("close");
  });
  
  p.appendTo("body");
  $("#apiKey").val(getCookie("apiKey") || ""); //devtest
  $("#projectPopup").dialog({
    modal: true,
    resizable: false,
    width: 400,
    title: "Load Project"
  });
}