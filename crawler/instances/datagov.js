var Promise = require('bluebird');
var pgp = require('pg-promise')({ promiseLib: Promise });
var worker = require('../src/worker.js');
var params = require('../src/params.js');

var db = pgp(params.dbConnStr);
var instance_name = 'Data.gov';

db.one('SELECT id, url FROM instance WHERE name = $1', instance_name)
  .then(function(result) {
    return worker.crawlInstance(db, result.id, result.url);
  })
  .catch(function(err) {
    console.error(err);
  });
