var Promise = require('bluebird');
var pgp = require('pg-promise')({ promiseLib: Promise });
var logger = require('log4js').getLogger('map');
var geostats = require('geostats');
var cb = require('colorbrewer');
var _ = require('lodash');

var params = require('../config/params.js');

exports.getStyles = function(req, res) {
  var response = { success: true };
  var db = pgp(params.dbConnStr);
  var count = req.params.count;
  var palette = cb.YlGnBu[count];

  db.any('SELECT SUM(count)::integer AS count FROM view_instance_region_info GROUP BY region_id')
    .then(function(results) {
      var counts = _.map(results, 'count');
      var breaks = getClassBreaks(counts, count);

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
