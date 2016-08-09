var _ = require('lodash');
var Promise = require('bluebird');
var pgp = require('pg-promise')({ promiseLib: Promise });
var sprintf = require('sprintf-js').sprintf;
var logger = require('log4js').getLogger('info');

var params = require('../config/params.js');

exports.getInstances = function(req, res) {
  var response = { success: true };
  var db = pgp(params.dbConnStr);
  var sql = [
    'WITH extent AS (',
    ' SELECT DISTINCT ON (instance_id) instance_id, bbox',
    ' FROM view_instance_region ORDER BY instance_id, level)',
    'SELECT i.name, url, ST_AsGeoJSON(extent.bbox, 3) AS bbox,',
    'array_agg(json_build_object(\'level\', vvtl.level_name, \'name\', layer_name) ORDER BY vvtl.level) AS layers',
    'FROM view_vector_tile_layer AS vvtl',
    'LEFT JOIN instance AS i ON vvtl.instance_id = i.id',
    'LEFT JOIN extent ON extent.instance_id = i.id',
    'GROUP BY i.name, url, bbox'
  ].join(' ');

  db.any(sql)
    .then(function(results) {
      _.forEach(results, function(instance) {
        instance.bbox = JSON.parse(instance.bbox);
        _.forEach(instance.layers, function(layer) {
          layer.url = sprintf(params.vtRequestUrl, layer.name);
        });
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

exports.getRegionLevels = function(req, res) {
  var response = { success: true };
  var db = pgp(params.dbConnStr);

  db.any('SELECT id AS level, name FROM region_level ORDER BY id')
    .then(function(results) {
      response.levels = results;
      res.json(response);
    })
    .catch(function(err) {
      logger.error(err);

      response.message = 'Unable to get region level information';
      res.status(500).json(response);
    });
};

exports.getInstanceInfo = function(req, res) {
  var instanceID = req.params.instanceID;
  var regionID = req.params.regionID;
  var itemCount = req.query.item_count || 10;

  var db = pgp(params.dbConnStr);

  var sql = [
    'SELECT instance_name AS name, region_name AS region,',
    ' update_date, count, tags[1:$1], categories[1:$1], organizations[1:$1]',
    'FROM view_instance_region_info AS viri',
    'WHERE instance_id = $2 AND region_id = $3'
  ].join(' ');

  db.oneOrNone(sql, [itemCount, instanceID, regionID])
    .then(function(result) {
      res.json({
        success: true,
        instance: result
      });
    })
    .catch(function(err) {
      if (_.isError(err)) {
        logger.error(err);
      }

      res.status(500).json({
        success: false,
        message: err.message
      });
    });
};
