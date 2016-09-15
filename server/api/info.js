var _ = require('lodash');
var Promise = require('bluebird');
var pgp = require('pg-promise')({ promiseLib: Promise });
var logger = require('log4js').getLogger('info');

var params = require('../config/params.js');
var pgService = require('../util/pgService.js');

exports.getInstances = function(req, res) {
  var response = { success: true };
  var db = pgp(params.dbConnStr);
  var sql = [
    'SELECT i.id, i.name, ST_AsGeoJSON(r.bbox, 3) AS bbox FROM instance AS i',
    'LEFT JOIN instance_region_xref AS irx ON irx.instance_id = i.id',
    'LEFT JOIN region AS r ON irx.region_id = r.id',
    'WHERE i.active'
  ].join(' ');

  db.any(sql)
    .then(function(results) {
      _.forEach(results, result => {
        result.bbox = JSON.parse(result.bbox);
      });

      response.instances = results;
      res.json(response);
    })
    .catch(function(err) {
      logger.error(err);
      response.message = 'Unable to get instacne information';
      res.status(500).json(response);
    });
};

exports.getInstanceSummary = function(req, res) {
  var db = pgp(params.dbConnStr);
  var sql = [
    'SELECT SUM(viri.count) FROM view_instance_region_info AS viri',
    ' LEFT JOIN instance AS i ON i.id = viri.instance_id',
    'WHERE i.active'
  ].join(' ');

  db.one(sql)
    .then(function(result) {
      res.json({
        success: true,
        summary: {
          count: result.sum
        }
      });
    })
    .catch(function(err) {
      logger.error(err);
      res.status(500).json({
        success: false,
        message: err.message
      });
    });
};

exports.getInstanceInfo = function(req, res) {
  var instanceID = req.params.instanceID;
  var itemCount = req.query.item_count || 10;
  var db = pgp(params.dbConnStr);

  var sql = [
    'SELECT instance_name AS name, description, url, location,',
    ' update_date, count, tags[1:$1], categories[1:$1], organizations[1:$1]',
    'FROM view_instance_region_info AS viri',
    ' LEFT JOIN instance AS i ON i.id = viri.instance_id',
    'WHERE instance_id = $2'
  ].join(' ');

  db.oneOrNone(sql, [itemCount, instanceID])
    .then(function(result) {
      pgService.camelCase(result, 'update_date');

      _.forEach(result.tags, function(tag) {
        pgService.camelCase(tag, 'update_date');
      });

      _.forEach(result.organizations, function(organization) {
        pgService.camelCase(organization, 'update_date');
      });

      _.forEach(result.categories, function(category) {
        pgService.camelCase(category, 'update_date');
      });

      res.json({
        success: true,
        instance: result
      });
    })
    .catch(function(err) {
      logger.error(err);
      res.status(500).json({
        success: false,
        message: err.message
      });
    });
};
