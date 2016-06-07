var Promise = require('bluebird');
var pgp = require('pg-promise')({ promiseLib: Promise });
var worker = require('./src/worker.js');
var params = require('./src/params.js');
var _ = require('lodash');
var logger = require('log4js').getLogger('data.gov');
var argv = require('yargs').argv;

var db = pgp(params.dbConnStr);
var promise;

if (argv['-d']) {
  promise = db.any('SELECT id, name, url FROM instance WHERE name = $1', argv['-d']);
} else {
  promise = db.any('SELECT id, name, url FROM instance');
}

promise.then(function(results) {
  var tasks = _.map(results, function(result) {
    return Promise.resolve()
      .then(function() {
        logger.info('Crawling instance: ', result.name);
      })
      .then(function() {
        return worker.crawlInstance(result.id, result.url);
      });
  });

  return Promise.all(tasks);
})
.catch(function(err) {
  logger.error(err);
});
