var Promise = require('bluebird');
var pgp = require('pg-promise')({ promiseLib: Promise });
var _ = require('lodash');
var fs = require('fs');
var sprintf = require('sprintf-js').sprintf;
var writeFile = Promise.promisify(require('fs').writeFile);
var exec = require('process-promises').exec;

var params = require('./params.js');

exports.preseed = function(instanceID) {
  var db = pgp(params.dbConnStr);
  var sql = [
    'SELECT instance_id, level, layer_name FROM view_vector_tile_layer',
    'WHERE layer_name IS NOT NULL AND active'
  ];

  if (instanceID) {
    sql.push('AND instance_id = $1');
  }

  return db.any(sql.join(' '), instanceID)
    .then(function(layers) {
      // get GeoJSON for each layer
      var tasks = [];

      sql = [
        'SELECT ST_AsGeoJSON(vir.geom, 4) AS geom,',
        'viri.instance_id, viri.instance_name, viri.level, viri.level_name, viri.count, viri.update_date,',
        'viri.region_id, viri.region_name,',
        'viri.tags[1] AS top_tag, viri.categories[1] AS top_category, viri.organizations[1] AS top_organization',
        'FROM view_instance_region_info AS viri',
        'LEFT JOIN view_instance_region AS vir',
        '  ON vir.instance_id = viri.instance_id AND vir.region_id = viri.region_id',
        'WHERE viri.instance_id = $1 AND viri.level = $2 AND vir.geom IS NOT NULL'
      ].join(' ');

      _.forEach(layers, function(layer) {
        var promise = db.any(sql, [layer.instance_id, layer.level])
          .then(function(results) {
            var features = _.map(results, function(feature) {
              return {
                type: 'Feature',
                geometry: JSON.parse(feature.geom),
                properties: _.omit(feature, 'geom')
              };
            });

            if (!fs.existsSync(params.tempDir)){
              fs.mkdirSync(params.tempDir);
            }

            var geoJSON = { type: 'FeatureCollection', features: features };
            var fileName = sprintf('%s/%s.geojson', params.tempDir, layer.layer_name);
            return writeFile(fileName, JSON.stringify(geoJSON));
          })
          .then(function() {
            return layer.layer_name;
          });

        tasks.push(promise);
      });

      return Promise.all(tasks);
    })
    .then(function(results) {
      // create .mbtiles file

      if (!fs.existsSync(params.tileDir)){
        fs.mkdirSync(params.tileDir);
      }

      var tasks = [];

      _.forEach(results, function(layer) {
        var source = sprintf('%s/%s.geojson', params.tempDir, layer);
        var target = sprintf('%s/%s.mbtiles', params.tileDir, layer);
        var command = [
          'cat ' + source + ' |',
          'tippecanoe',
          '--output=' + target,
          '--layer=' + layer,
          '--maximum-zoom=' + params.maxZoom,
          '--minimum-zoom=' + params.minZoom,
          '--force',
          '--drop-polygons',
          '--no-polygon-splitting',
          '--reverse'
        ].join(' ');

        tasks.push(exec(command));
      });

      return Promise.all(tasks).then(function() { return results; });
    })
    .then(function(layers) {
      // update tile-server config
      var serverConfig = JSON.parse(fs.readFileSync('./tile-server/config.json', 'utf8'));

      _.forEach(layers, function(layer) {
        var url = params.tileBaseUrl + layer;
        var filePath = sprintf('%s/%s.mbtiles', params.tileDir, layer);
        serverConfig[url] = 'mbtiles://' + filePath;
      });

      fs.writeFileSync('./tile-server/config.json', JSON.stringify(serverConfig));
    });
};
