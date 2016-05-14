var scheduler = require('node-schedule');
var logger = require('log4js').getLogger('crawler');
var Promise = require('bluebird');
var pgp = require('pg-promise')({ promiseLib: Promise });
var _ = require('lodash');
var params = require('./src/params.js');
var worker = require('./src/worker.js');

var db = pgp(params.dbConnStr);

db.any('SELECT id, url, crawl_schedule FROM instance')
  .then(function(instances) {
    if (instances.length < 1) { return; }

    _.forEach(instances, function(instance) {
      scheduler.scheduleJob(instance.crawl_schedule, function(){
        logger.info('\nSceduled data fetching at ' + (new Date()).toString());
        worker.crawlInstance(instance.id, instance.url);
      });
    });
  });
