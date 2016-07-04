var scheduler = require('node-schedule');
var logger = require('log4js').getLogger('crawler');
var Promise = require('bluebird');
var pgp = require('pg-promise')({ promiseLib: Promise });
var _ = require('lodash');

var params = require('./src/params.js');
var worker = require('./src/worker.js');
var database = require('./src/database.js');

var db = pgp(params.dbConnStr);

db.any('SELECT name, id, url, crawl_schedule, is_georeferenced FROM instance')
  .then(function(instances) {
    _.forEach(instances, function(instance) {
      scheduler.scheduleJob(instance.crawl_schedule, function(){
        logger.info('Sceduled data fetching at ' + (new Date()).toString());

        if (instance.is_georeferenced) {
          worker.spatialCrawl(instance.name, instance.id, instance.url);
        } else {
          worker.crawl(instance.name, instance.id, instance.url);
        }

      });
    });
  });

scheduler.scheduleJob('* 1 * * 7', function(){
  logger.info('Refreshing Database...');
  database.refresh(pgp(params.dbConnStr));
});
