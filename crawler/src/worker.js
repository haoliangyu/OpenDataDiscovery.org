var ckan = require('./ckan.js');
var Promise = require('bluebird');
var logger = require('log4js').getLogger('worker');
var pgp = require('pg-promise')({ promiseLib: Promise });
var Queue = require('promise-queue');
var _ = require('lodash');
var ProgressBar = require('progress');
var vsprintf = require("sprintf-js").vsprintf;

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

  var sql = 'SELECT * FROM view_region WHERE instance = $1';

  return db.any(sql, instanceID)
           .then(function(regions) {
             if (regions.length < 1) {
               return Promise.reject('no regions');
             }

             return Promise.props({
               tags: db.any('SELECT id, ')
             })

             var taskQueue = new Queue(1, Infinity);
             var bar = new ProgressBar('Crawling data: [:bar] :current/:total', results.length);

             _.forEach(regions, function(region) {
               taskQueue.add(function() {
                 bar.tick();
                 return exports.getRegionData(db, {
                     extras: { ext_bbox: region.bbox.coordinates[0] }
                   })
                  .then(function(data) {

                  });
               });
             });


           })
  })
  .catch(function(err) {
    logger.warn('Failed to fetch data from ' + instanceUrl);
    logger.error(err);
  });
};
