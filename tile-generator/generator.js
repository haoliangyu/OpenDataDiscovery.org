var Promise = require('bluebird');
var pgp = require('pg-promise')({ promiseLib: Promise });
var fs = require('fs');
var path = require('path');
var sprintf = require('sprintf-js').sprintf;
var exec = require('child-process-promise').exec;
var QueryStream = require('pg-query-stream');
var JSONStream = require('JSONStream');

var crawler = require('../crawler/crawler.js');
var params = require('./params.js');
var db = pgp(params.dbConnStr);
var source = sprintf('%s/regions.geojson', path.resolve(__dirname, params.tempDir));
var target = sprintf('%s/regions.mbtiles', path.resolve(__dirname, params.tileDir));

var sql = [
  'WITH info AS (',
  ' SELECT',
  '   viri.region_id AS id,',
  '   array_agg(json_build_object(',
  '     \'id\', viri.instance_id,',
  '     \'name\', viri.instance_name,',
  '     \'count\', viri.count,',
  '     \'update\', viri.update_date,',
  '     \'topTag\', viri.tags[1],',
  '     \'topOrganization\', viri.organizations[1],',
  '     \'topCategory\', viri.categories[1]',
  '   )) AS instances',
  ' FROM instance_region_xref AS irx',
  '   LEFT JOIN view_instance_region_info as viri',
  '     ON viri.instance_id = irx.instance_id AND viri.region_id = irx.region_id',
  '   LEFT JOIN instance AS i ON i.id = irx.instance_id',
  ' WHERE i.active',
  ' GROUP BY viri.region_name, viri.region_id',
  ')',
  'SELECT',
  ' \'Feature\' AS type,',
  ' json_build_object(\'maxzoom\', rl.max_tile_zoom, \'minzoom\', rl.min_tile_zoom) AS tippecanoe,',
  ' ST_AsGeoJSON(ST_Simplify(r.geom, 0.001), 3)::json AS geometry,',
  ' json_build_object(',
  '   \'id\', r.id,',
  '   \'name\', r.name,',
  '   \'bbox\', ST_AsGeoJSON(r.bbox, 3),',
  '   \'instances\', info.instances',
  ' ) AS properties',
  'FROM info, region AS r',
  ' LEFT JOIN instance_region_xref AS irx ON irx.region_id = r.id',
  ' LEFT JOIN region_level AS rl ON rl.id = r.region_level_id',
  'WHERE r.id = info.id AND r.geom IS NOT NULL',
  'ORDER BY rl.id DESC'
].join(' ');

var qs = new QueryStream(sql);

crawler.harvestAll(db)
  .then(function() {
    return db.stream(qs, function(s) {

      var jsonStart = '{"type": "FeatureCollection", "features": [';
      var jsonEnd = ']}';
      var separator = ',';
      var writeStream = fs.createWriteStream(source);

      s.pipe(JSONStream.stringify(jsonStart, separator, jsonEnd)).pipe(writeStream);

      return streamToPromise(s);
    });
  })
  .then(function() {
    var command = [
      'cat ' + source + ' |',
      'tippecanoe',
      '--output=' + target,
      '--preserve-input-order',
      '--simplification=8',
      '--force',
      '--no-polygon-splitting',
      '--reverse;'
    ].join(' ');

    return exec(command);
  })
  .then(function() {
    var configPath = path.resolve(__dirname, '../tile-server/config.json');
    var serverConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    serverConfig = {};
    serverConfig[params.tileUrl] = 'mbtiles://./tile-server/regions.mbtiles';

    fs.writeFileSync(configPath, JSON.stringify(serverConfig));
  })
  .catch(function(err) {
    console.error(err);
    process.exit();
  })
  .finally(function() {
    fs.access(source, function() {
      fs.unlink(source);
    });
  });

function streamToPromise(stream) {
  return new Promise(function(resolve, reject) {
    stream.on('end', resolve);
    stream.on('error', reject);
    stream.resume();
  });
}
