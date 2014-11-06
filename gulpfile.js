var gulp = require('gulp');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');

// clean
gulp.task('clean', function () {
    return gulp.src('build/*', {read: false})
        .pipe(clean());
});

//move
gulp.task('move', function() {
    return gulp.src(['extension/**/*.html', 'extension/**/*.png', 'extension/**/*.json'])
        .pipe(gulp.dest('build'));
});

//compress js
gulp.task('js',function(){
    return gulp.src('extension/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('build'));
});

//compress css
gulp.task('css',function(){
    return gulp.src('extension/**/*.css')
        .pipe(minifyCss())
        .pipe(gulp.dest('build'));
});

//maybe need sequence one day...
gulp.task('default', function(){
    runSequence('clean', 'move', 'css', 'js');
});