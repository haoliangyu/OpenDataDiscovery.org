var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-spawn-mocha');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');

var paths = {
  scripts: ['**/*.js', '!node_modules/**', '!coverage/**']
};

gulp.task('test-mocha', function() {
  return gulp
    .src('./test/**/*.js')
    .pipe(mocha({
      istanbul: {
        report: 'none'
      }
    }));
});

gulp.task('clean-report', function() {
  return gulp.src('./coverage', { read: false })
             .pipe(clean());
});

gulp.task('test', function(callback) {
  runSequence('test-mocha', 'clean-report', callback);
});

gulp.task('eslint', function () {
  return gulp.src(paths.scripts)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['eslint', 'test']);
});

gulp.task('default', ['watch']);
