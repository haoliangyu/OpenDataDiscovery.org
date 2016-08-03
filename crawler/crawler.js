var worker = require('./src/worker.js');
var database = require('./src/database.js');

exports.crawl = function(name, id, url, geoferenced, queue, db) {
  if (geoferenced) {
    return worker.spatialCrawl(name, id, url, queue, db);
  } else {
    return worker.crawl(name, id, url, queue, db);
  }
};

exports.refresh = function(db) {
  return database.refresh(db);
};
