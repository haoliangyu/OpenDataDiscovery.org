var _ = require('lodash');
var Promise = require('bluebird');
var pgp = require('pg-promise')({ promiseLib: Promise });
var sprintf = require('sprintf-js').sprintf;
var logger = require('log4js').getLogger('');

var params = require('../../config/params.js');

exports.getInstances = function(req, res) {
  var response = { success: true };
  var db = pgp(params.dbConnStr);
  var sql = [
    'WITH extent AS (',
    ' SELECT DISTINCT ON (instance_id) instance_id, bbox',
    ' FROM view_instance_region ORDER BY instance_id, level)',
    'SELECT i.name, url, ST_AsGeoJSON(extent.bbox, 4) AS bbox,',
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
          layer.url = sprintf(params.vtRequestUrl.external, layer.name);
        });
      });

      response.instances = results;
      res.send(response);
    })
    .catch(function(err) {
      logger.error(err);

      response.message = 'Unable to get instacne information';
      res.status(500).send(response);
    });
};
