const Promise = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: Promise });
const QueryStream = require('pg-query-stream');
const JSONStream = require('JSONStream');
const logger = require('log4js').getLogger('export');

const params = require('../config/params.js');

exports.exportData = (req, res) => {
  const db = pgp(params.dbConnStr);

  let sql = req.query.date ? getHistoryData(req.query.date) : getLatestData();
  let qs = new QueryStream(sql);

  db.stream(qs, s => {
    var jsonStart = '{ "success": true, "portals": [';
    var jsonEnd = ']}';
    var separator = ',';

    s.pipe(JSONStream.stringify(jsonStart, separator, jsonEnd)).pipe(res);
  })
  .catch(err => {
    logger.error(err);
    res.status(500).send({
      success: false,
      message: err.message
    });
  });
};

function getLatestData() {
  return `
    SELECT json_build_object(
      'name', vii.instance_name,
      'location', vii.region_name,
      'description', vii.description,
      'dataset_count', vii.count,
      'update_date', vii.update_date,
      'tags', vii.tags,
      'organizations', vii.organizations,
      'categories', vii.categories
    ) AS instance
    FROM view_instance_info AS vii
  `;
}

function getHistoryData(date) {
  return `
    WITH latest_category AS (
      SELECT
        icx.instance_id,
        array_agg(json_build_object(
          'name', c.name,
          'dataset_count', sorted_data.count,
          'update_date', sorted_data.update_date
        ) ORDER BY sorted_data.count DESC) AS grouped_data
      FROM (
        SELECT DISTINCT ON (cd.instance_category_xref_id)
          cd.instance_category_xref_id,
          cd.count,
          cd.update_date
        FROM category_data AS cd
        WHERE update_date <= DATE '${date}'
        ORDER BY cd.instance_category_xref_id, update_date DESC
      ) AS sorted_data
      LEFT JOIN instance_category_xref AS icx ON icx.id = sorted_data.instance_category_xref_id
      LEFT JOIN category AS c ON c.id = icx.category_id
      GROUP BY instance_id
    ), latest_tag AS (
      SELECT
        itx.instance_id,
        array_agg(json_build_object(
          'name', t.name,
          'dataset_count', sorted_data.count,
          'update_date', sorted_data.update_date
        ) ORDER BY sorted_data.count DESC) AS grouped_data
      FROM (
        SELECT DISTINCT ON (td.instance_tag_xref_id)
          td.instance_tag_xref_id,
          td.count,
          td.update_date
        FROM tag_data AS td
        WHERE update_date <= DATE '${date}'
        ORDER BY td.instance_tag_xref_id, update_date DESC
      ) AS sorted_data
      LEFT JOIN instance_tag_xref AS itx ON itx.id = sorted_data.instance_tag_xref_id
      LEFT JOIN tag AS t ON t.id = itx.tag_id
      GROUP BY instance_id
    ), latest_organization AS (
      SELECT
        iox.instance_id,
        array_agg(json_build_object(
          'name', o.name,
          'dataset_count', sorted_data.count,
          'update_date', sorted_data.update_date
        ) ORDER BY sorted_data.count DESC) AS grouped_data
      FROM (
        SELECT DISTINCT ON (od.instance_organization_xref_id)
          od.instance_organization_xref_id,
          od.count,
          od.update_date
        FROM organization_data AS od
        WHERE update_date <= DATE '${date}'
        ORDER BY od.instance_organization_xref_id, update_date DESC
      ) AS sorted_data
      LEFT JOIN instance_organization_xref AS iox ON iox.id = sorted_data.instance_organization_xref_id
      LEFT JOIN organization AS o ON o.id = iox.organization_id
      GROUP BY instance_id
    ), latest_data AS (
      SELECT DISTINCT ON (instance_id) instance_id, count, update_date
      FROM instance_data WHERE update_date <= DATE '${date}'
      ORDER BY instance_id, update_date DESC
    )
    SELECT
      i.name,
      i.description,
      i.location,
      ld.count AS dataset_count,
      ld.update_date,
      COALESCE(lt.grouped_data, '{}') AS tags,
      COALESCE(lc.grouped_data, '{}') AS categories,
      COALESCE(lo.grouped_data, '{}') AS organizations
    FROM instance AS i
      LEFT JOIN latest_data AS ld ON ld.instance_id = i.id
      LEFT JOIN latest_category AS lc ON lc.instance_id = i.id
      LEFT JOIN latest_tag AS lt ON lt.instance_id = i.id
      LEFT JOIN latest_organization AS lo ON lo.instance_id = i.id
    WHERE i.active;
  `;
}
