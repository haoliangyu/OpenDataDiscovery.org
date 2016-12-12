const _ = require('lodash');
const logger = require('log4js').getLogger('info');
const pgService = require('../util/pgService.js');
const db = require('../database.js').getConnection();

exports.getInstances = function(req, res) {
  var response = { success: true };

  let sql = `
    SELECT
      i.id,
      i.name,
      p.name AS platform,
      vii.count AS dataset_count,
      vii.region_name AS formatted_location,
      json_build_object(
        'country', r.country
      ) AS location,
      ST_AsGeoJSON(r.bbox, 3) AS bbox,
      ST_AsGeoJSON(r.center, 3) AS center
    FROM instance AS i
      LEFT JOIN view_instance_info AS vii ON vii.instance_id = i.id
      LEFT JOIN region AS r ON r.id = vii.region_id
      LEFT JOIN platform AS p ON p.id = i.platform_id
    WHERE i.active
  `;

  db.any(sql)
    .then(function(results) {
      _.forEach(results, result => {
        result.bbox = JSON.parse(result.bbox);
        result.center = JSON.parse(result.center);

        pgService.camelCase(result, 'formatted_location');
        pgService.camelCase(result, 'dataset_count');
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
  // const db = pgp(params.dbConnStr);
  const sql = `
    SELECT
      COUNT(DISTINCT vii.instance_id) AS portal_count,
      SUM(vii.count) AS dataset_count
    FROM view_instance_info AS vii
  `;

  db.one(sql)
    .then(function(result) {
      res.json({
        success: true,
        summary: {
          datasetCount: result.dataset_count,
          portalCount: result.portal_count
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
  // var db = pgp(params.dbConnStr);

  var sql = [
    'SELECT instance_name AS name, vii.description, url, region_name AS location, platform_name AS platform,',
    ' update_date, count, tags[1:$1], categories[1:$1], organizations[1:$1]',
    'FROM view_instance_info AS vii',
    ' LEFT JOIN instance AS i ON i.id = vii.instance_id',
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
