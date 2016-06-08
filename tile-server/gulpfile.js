var gulp = require('gulp');
var eslint = require('gulp-eslint');
var cache = require('gulp-cached');

var paths = {
  scripts: ['**/*.js', '!node_modules/**', '!gulpfile.js', '!.eslintrc.js']
};

gulp.task('eslint', function () {
  return gulp.src(paths.scripts)
    .pipe(cache('eslint', {
      optimizeMemory: true
    }))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['eslint']);
});

gulp.task('default', ['watch']);
