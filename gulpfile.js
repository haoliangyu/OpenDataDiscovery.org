var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-spawn-mocha');
var runSequence = require('run-sequence');
var cache = require('gulp-cached');

var scripts = {
  crawler: ['./crawler/**/*.js'],
  server: ['./server/**/*.js'],
  tile_server: ['./tile-server/**/*.js', '!./tile-server/test/*.js']
};

var tests = {
  crawler: ['./crawler/test/**/*.js'],
  server: ['./server/test/**/*.js']
};

/**
 * Testing
 */

function addTestTask(name, paths) {
  gulp.task(name, function() {
    return gulp.src(paths)
      .pipe(mocha({
        istanbul: { report: 'none' }
      }));
  });
}

addTestTask('test-server', tests.server);
addTestTask('test-crawler', tests.crawler);

/**
 * Linting
 */

function addLintingTask(name, paths) {
  gulp.task(name, function () {
    return gulp.src(paths)
      .pipe(cache(name, { optimizeMemory: true }))
      .pipe(eslint({
        quiet: true
      }))
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  });
}

addLintingTask('eslint-server', scripts.server);
addLintingTask('eslint-crawler', scripts.crawler);
addLintingTask('eslint-tile-server', scripts.tile_server);

/**
 * Watch
 */

function addWatchTask(name, paths, tasks) {
  gulp.task(name, function() {
    gulp.watch(paths, function() {
      runSequence.call(this, tasks);
    });
  });
}

addWatchTask('watch-crawler', scripts.crawler, ['eslint-crawler', 'test-crawler']);
addWatchTask('watch-server', scripts.server, ['eslint-server', 'test-server']);
addWatchTask('watch-tile-server', scripts.tile_server, ['eslint-tile-server']);

/**
 * Tasks
 */

gulp.task('watch', ['watch-crawler', 'watch-server', 'watch-tile-server']);
gulp.task('default', ['watch']);
