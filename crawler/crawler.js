var Promise = require('bluebird');
var Queue = require('promise-queue');
var worker = require('./src/worker.js');
var database = require('./src/database.js');
var _ = require('lodash');

Queue.configure(Promise);

exports.harvestAll = function(db) {
  var queue;

  return db.any('SELECT id, name, url FROM instance')
    .then(function(instances) {
      return new Promise(function(resolve) {
        queue = new Queue(10, Infinity, {
          onEmpty: function() {
            resolve();
          }
        });

        _.forEach(instances, function(instance) {
          queue.add(function() {
            return worker.crawl(db, instance.id, instance.name, instance.url);
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
