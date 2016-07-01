var Promise = require('bluebird');
var pgp = require('pg-promise')({ promiseLib: Promise });
var logger = require('log4js').getLogger('tile-server');
var Tilesplash = require('tilesplash');
var _ = require('lodash');
var sprintf = require('sprintf-js').sprintf;
var params = require('./params.js');

var util = require('./util.js');

var app = new Tilesplash(params.dbConnStr, 'redis');

var getCacheTime = function(week, day) {
  week = _.isInteger(week) && week > 0 ? week : 0;
  day = _.isInteger(day) && day > 0 ? day : 0;

  return 604800000 * week + 86400000 * day;
};

var db = pgp(params.dbConnStr);
var sql = [
  'WITH bbox AS (SELECT !bbox_4326! AS geom)',
  'SELECT ST_AsGeoJSON(vir.geom, 5) AS the_geom_geojson,',
  'viri.instance_id, viri.instance_name, viri.level, viri.level_name, viri.count, viri.update_date,',
  'viri.region_id, viri.region_name, viri.tags, viri.categories, viri.organizations',
  'FROM bbox, view_instance_region_info AS viri',
  'LEFT JOIN view_instance_region AS vir',
  '  ON vir.instance_id = viri.instance_id AND vir.region_id = viri.region_id',
  'WHERE viri.instance_id = %d AND viri.level = %d AND',
  'ST_Intersects(vir.geom, bbox.geom)'
].join(' ');

db.any('SELECT instance_id, level, layer_name FROM view_vector_tile_layer WHERE layer_name IS NOT NULL')
  .then(function(results) {
    _.forEach(results, function(layer) {
      app.layer(layer.layer_name, function(tile, render) {
        this.cache(function(tile) {
          return app.defaultCacheKeyGenerator(tile);
        }, getCacheTime(0, 3));

        render(sprintf(sql, layer.instance_id, layer.level), function(geojson) {

          _.forEach(geojson.features, function(feature) {
            feature.properties.top_tag = util.getTopItems(feature.properties.tags, 1)[0];
            feature.properties.top_category = util.getTopItems(feature.properties.categories, 1)[0];
            feature.properties.top_organization = util.getTopItems(feature.properties.organizations, 1)[0];

            delete feature.properties.tags;
            delete feature.properties.categories;
            delete feature.properties.organizations;
          });

          return geojson;
        });
      });
    });
  })
  .then(function() {
    app.server.listen(params.port);
    logger.info('Tile server running at', params.port);
  })
  .catch(function(err) {
    logger.info('Unable to initialize tile server:');
    logger.error(err);
  });
