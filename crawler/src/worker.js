var ckan = require('./ckan.js');
var Promise = require('bluebird');
var logger = require('log4js').getLogger('worker');
var Queue = require('promise-queue');
var _ = require('lodash');
var ProgressBar = require('progress');
var database = require('./database.js');

Queue.configure(Promise);

/**
 * Get data for a specific region
 * @param  {string}   url       CKAN instance url
 * @param  {object}   options   request options
 * @return {object}   promise
 */
exports.getRegionData = function(url, options) {
  return ckan.getFullMetadata(url, options);
};

exports.crawlInstance = function(db, instanceID, instanceUrl) {

  var sql = 'SELECT region_id FROM view_instance_region WHERE instacnce_id = $1';

  return db.any(sql, instanceID)
           .then(function(regions) {
             if (regions.length < 1) {
               return Promise.reject('no regions');
             }

             var taskQueue = new Queue(1, Infinity);
             var bar = new ProgressBar('Crawling data: [:bar] :current/:total', regions.length);

             _.forEach(regions, function(region) {
               taskQueue.add(function() {
                 bar.tick();

                 return exports.getRegionData(instanceUrl, {
                   extras: { ext_bbox: region.bbox.coordinates[0] }
                 })
                .then(function(data) {
                  return db.tx(function(t) {
                    return database.saveData(t, instanceID, region.region_id, data);
                  });
                });

               });
             });
           })
          .catch(function(err) {
            switch (err) {
              case 'no region':
                logger.info('No region is found for instance: ', instanceID);
                return Promise.resolve();
                break;
              default:
                logger.warn('Failed to fetch data from ' + instanceUrl);
                logger.error(err);
            }
          });
};
