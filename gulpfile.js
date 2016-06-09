var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-spawn-mocha');
var runSequence = require('run-sequence');
var cache = require('gulp-cached');
var nodemon = require('gulp-nodemon');

var scripts = {
  crawler: ['./crawler/**/*.js'],
  server: ['./server/**/*.js'],
  tile_server: ['./tile-server/**/*.js']
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

addWatchTask('watch-crawler', scripts.server, ['eslint-crawler', 'test-crawler']);

/**
 * Nodemon
 */

function addNodemonTask(name, entry, path, before, after) {
  gulp.task(name, function() {
    nodemon({
      script: entry,
      watch: path,
      ext: 'js',
      tasks: before || [],
      env: { 'NODE_ENV': 'development' }
    })
    .on('restart', after || []);
  });
}

addNodemonTask('nodemon-server', './server/server.js', './server', ['eslint-server'], ['test-server']);
addNodemonTask('nodemon-tile-server', './tile-server/server.js', './tile-server', ['eslint-tile-server']);

/**
 * Tasks
 */

gulp.task('watch', ['watch-crawler']);
gulp.task('default', ['watch']);
