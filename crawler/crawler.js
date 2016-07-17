var Promise = require('bluebird');
var pgp = require('pg-promise')({ promiseLib: Promise });

var worker = require('./src/worker.js');
var database = require('./src/database.js');
var params = require('./src/params.js');

exports.crawl = function(name, id, url, geoferenced, queue) {
  if (geoferenced) {
    return worker.spatialCrawl(name, id, url, queue);
  } else {
    return worker.crawl(name, id, url, queue);
  }
};

exports.refresh = function() {
  return database.refresh(pgp(params.dbConnStr));
};
