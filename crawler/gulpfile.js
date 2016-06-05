var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-spawn-mocha');

var paths = {
  scripts: ['**/*.js', '!node_modules/**', '!coverage/**']
};

gulp.task('test', function() {
  return gulp
    .src('./test/**/*.js')
    .pipe(mocha({
      istanbul: {
        report: 'none'
      }
    }));
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
