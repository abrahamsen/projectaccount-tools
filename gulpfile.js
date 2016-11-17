var gulp = require("gulp");
var sass = require("gulp-sass");
var concatCss = require("gulp-concat-css");
var cleanCss = require("gulp-clean-css");
var path = require("path");

var styles = path.resolve("styles","*.scss");

gulp.task("css", function() {
    gulp.src(styles)
        .pipe(sass())
        .pipe(concatCss("client/styles.min.css"))
        .pipe(cleanCss())
        .pipe(gulp.dest(function(f) {
            return ".";
        }));
});

gulp.task("default", ["css"], function() {
    gulp.watch(styles, ["css"]);
})