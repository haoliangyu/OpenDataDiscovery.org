var gulp = require('gulp');
var eslint = require('gulp-eslint');

var paths = {
  scripts: ['**/*.js', '!node_modules/**']
};

gulp.task('eslint', function () {
  return gulp.src(paths.scripts)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['eslint']);
});

gulp.task('default', ['watch']);
