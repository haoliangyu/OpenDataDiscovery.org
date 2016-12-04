const Promise = require('bluebird');
const Queue = require('promise-queue');
const worker = require('./src/worker.js');
const database = require('./src/database.js');
const _ = require('lodash');

Queue.configure(Promise);

exports.harvestAll = function(db) {
  let queue;
  let sql = `
    SELECT i.id, i.name, i.url, lower(p.name) AS platform FROM instance AS i
      LEFT JOIN platform AS p ON i.platform_id = p.id
    WHERE i.active
  `;

  return db.any(sql)
    .then(function(instances) {
      return new Promise(function(resolve) {
        queue = new Queue(10, Infinity, {
          onEmpty: function() {
            resolve();
          }
        });

        _.forEach(instances, function(instance) {
          queue.add(function() {
            return worker.crawl(db, instance);
          });
        });
      });
    })
    .then(function() {
      return database.refresh(db);
    });
};

exports.refresh = function(db) {
  return database.refresh(db);
};
