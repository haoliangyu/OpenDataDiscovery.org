var Promise = require('bluebird');
var pgp = require('pg-promise')({ promiseLib: Promise });
var logger = require('log4js').getLogger('map');
var geostats = require('geostats');
var cb = require('colorbrewer');

var params = require('../config/params.js');

exports.getStyles = function(req, res) {
  var response = { success: true };
  var db = pgp(params.dbConnStr);
  var sql = [
    'SELECT array_agg(viri.count ORDER BY viri.count) AS counts FROM view_instance_region_info AS viri',
    'LEFT JOIN instance_region_xref AS irx ON irx.instance_id = viri.instance_id AND viri.region_id = irx.region_id',
    'LEFT JOIN instance_region_level AS irl ON irl.id = irx.instance_region_level_id',
    'WHERE irl.active AND viri.count IS NOT NULL'
  ];

  var instances = req.body.instances;
  var count = req.body.class || 5;
  var palette = cb.YlGnBu[count];

  if (instances) { sql.push('AND viri.instance_id IN ($1^)'); }

  db.one(sql.join(' '), instances ? pgp.as.csv(instances) : undefined)
    .then(function(result) {
      var breaks = getClassBreaks(result.counts, count);

      response.styles = [];

      for (var i = 0, n = breaks.length - 1; i < n; i++) {
        response.styles.push({
          fill: palette[i],
          lowerBound: breaks[i],
          upperBound: breaks[i + 1],
          percentTile: 1 / n * (i + 1)
        });
      }

      res.json(response);
    })
    .catch(function(err) {
      logger.error(err);
      res.status(500).json({
        success: false,
        message: err.message
      });
    });
};

function getClassBreaks(data, count) {
  var stats = new geostats(data);
  return stats.getClassQuantile(count);
}
