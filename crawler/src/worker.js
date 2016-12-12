const Promise = require('bluebird');
const logger = require('log4js').getLogger('worker');
const _ = require('lodash');
const database = require('./database.js');
const pgp = require('pg-promise')({ promiseLib: Promise });
const params = require('./params.js');
const fs = require('fs');
const path = require('path');

let platform = {};

fs.readdir(path.resolve(__dirname, './platform'), (err, files) => {
  if (err) {
    logger.error(err);
    return;
  }

  _.forEach(files, file => {
    platform[path.basename(file, '.js')] = require(`./platform/${file}`);
  });
});

exports.crawl = function(db, instance) {

  db = db || pgp(params.dbConnStr);

  logger.info('Crawling ' + instance.name + '...');

  return platform[instance.platform.toLowerCase()].getFullMetadata(instance.url)
    .then(function(data) {
      return db.tx(function(t) {
        return database.saveData(t, instance.id, data);
      });
    })
    .catch(function(err) {
      logger.warn(`Unable to get metadata: ${instance.name}`);
      logger.error(err);
    });
};
