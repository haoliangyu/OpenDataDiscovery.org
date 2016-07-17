var Promise = require('bluebird');
var pgp = require('pg-promise')({ promiseLib: Promise });
var _ = require('lodash');
var logger = require('log4js').getLogger('preseeding');
var argv = require('yargs').argv;
var exec = require('process-promises').exec;
var Queue = require('promise-queue');

var crawler = require('./crawler/crawler.js');
var params = require('./crawler/src/params.js');
var generator = require('./tile-generator/generator.js');

Queue.configure(Promise);

var db = pgp(params.dbConnStr);
var promise;

if (argv['-d']) {
  promise = db.any('SELECT id, name, url, georeferenced FROM instance WHERE name = $1', argv['-d']);
} else {
  promise = db.any('SELECT id, name, url, georeferenced FROM instance');
}

var queue = new Queue(1, Infinity, {
  onEmpty: function() {
    return crawler.refresh(db)
      .then(function() { return generator.preseed(); })
      .then(function() { return exec('pm2 restart odd.tile-server'); })
      .then(function() { process.exit(); });
  }
});

promise.then(function(results) {
  var tasks = _.map(results, function(instance) {
    return crawler.crawl(instance.name, instance.id, instance.url, instance.georeferenced, queue);
  });

  return Promise.all(tasks);
})
.catch(function(err) {
  logger.error(err);
});
