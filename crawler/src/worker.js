var ckan = require('./ckan.js');
var Promise = require('bluebird');
var logger = require('log4js').getLogger('worker');
var _ = require('lodash');
var database = require('./database.js');
var pgp = require('pg-promise')({ promiseLib: Promise });
var params = require('./params.js');

exports.spatialCrawl = function(db, instanceID, instanceName, instanceUrl) {

  db = db || pgp(params.dbConnStr);

  var sql = 'SELECT region_id, Box2D(bbox) AS bbox FROM view_instance_region WHERE instance_id = $1';

  return db.one(sql, instanceID)
    .then(function(region) {
      var match = region.bbox.match(/BOX\(([-.0-9]+) ([-.0-9]+),([-.0-9]+) ([-.0-9]+)\)/);
      var bbox = _.chain(match).slice(1, 5).map(_.toNumber).value();

      return ckan.getFullMetadata(instanceUrl, {
        extras: { ext_bbox: bbox }
      })
      .then(function(data) {
        return db.tx(function(t) {
          return database.saveData(t, instanceID, region.region_id, data);
        });
      });
    })
    .catch(function(err) {
      logger.error(err);
      return Promise.resolve();
    });
};

exports.crawl = function(db, instanceID, instanceName, instanceUrl) {

  db = db || pgp(params.dbConnStr);

  logger.info('Crawling ' + instanceName + '...');

  var regionID;

  return db.one('SELECT region_id FROM instance_region_xref WHERE instance_id = $1', instanceID)
    .then(function(result) {
      regionID = result.region_id;
      return ckan.getFullMetadata(instanceUrl);
    })
    .then(function(data) {
      return db.tx(function(t) {
        return database.saveData(t, instanceID, regionID, data);
      });
    })
    .catch(function(err) {
      logger.error(err);
      return Promise.resolve();
    });
};
