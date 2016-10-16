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
    var jsonStart = '[';
    var jsonEnd = ']';
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
      'name', viri.instance_name,
      'location', viri.region_name,
      'count', viri.count,
      'update_date', viri.update_date,
      'tags', viri.tags,
      'organizations', viri.organizations,
      'categories', viri.categories
    ) AS instance
    FROM view_instance_region_info AS viri
  `;
}

function getHistoryData(date) {
  return `
    WITH latest_category AS (
          SELECT sorted_data.instance_id,
             sorted_data.region_id,
             array_agg(sorted_data.item ORDER BY ((sorted_data.item ->> 'count')::integer) DESC) AS grouped_data
            FROM ( SELECT DISTINCT ON (irx_1.region_id, ircx.category_id) irx_1.instance_id,
                     irx_1.region_id,
                     json_build_object('name', c.name, 'count', cd.count, 'update_date', cd.update_date) AS item
                    FROM category_data cd
                      LEFT JOIN instance_region_category_xref ircx ON ircx.id = cd.instance_region_category_xref_id
                      LEFT JOIN instance_region_xref irx_1 ON irx_1.id = ircx.instance_region_xref_id
                      LEFT JOIN category c ON c.id = ircx.category_id
                   WHERE cd.update_date <= DATE '${date}'
                   ORDER BY irx_1.region_id, ircx.category_id, cd.update_date DESC) sorted_data
           GROUP BY sorted_data.instance_id, sorted_data.region_id
         ), latest_tag AS (
          SELECT sorted_data.instance_id,
             sorted_data.region_id,
             array_agg(sorted_data.item ORDER BY ((sorted_data.item ->> 'count')::integer) DESC) AS grouped_data
            FROM ( SELECT DISTINCT ON (irx_1.region_id, irtx.tag_id) irx_1.instance_id,
                     irx_1.region_id,
                     json_build_object('name', t.name, 'count', td.count, 'update_date', td.update_date) AS item
                    FROM tag_data td
                      LEFT JOIN instance_region_tag_xref irtx ON irtx.id = td.instance_region_tag_xref_id
                      LEFT JOIN instance_region_xref irx_1 ON irx_1.id = irtx.instance_region_xref_id
                      LEFT JOIN tag t ON t.id = irtx.tag_id
                   WHERE t.name <> '' AND td.update_date <= DATE '${date}'
                   ORDER BY irx_1.region_id, irtx.tag_id, td.update_date DESC) sorted_data
           GROUP BY sorted_data.instance_id, sorted_data.region_id
         ), latest_organization AS (
          SELECT sorted_data.instance_id,
             sorted_data.region_id,
             array_agg(sorted_data.item ORDER BY ((sorted_data.item ->> 'count')::integer) DESC) AS grouped_data
            FROM ( SELECT DISTINCT ON (irx_1.instance_id, irx_1.region_id, irox.organization_id) irx_1.instance_id,
                     irx_1.region_id,
                     json_build_object('name', o.name, 'count', od.count, 'update_date', od.update_date) AS item
                    FROM organization_data od
                      LEFT JOIN instance_region_organization_xref irox ON irox.id = od.instance_region_organization_xref_id
                      LEFT JOIN instance_region_xref irx_1 ON irx_1.id = irox.instance_region_xref_id
                      LEFT JOIN organization o ON o.id = irox.organization_id
                   WHERE od.update_date <= DATE '${date}'
                   ORDER BY irx_1.instance_id, irx_1.region_id, irox.organization_id, od.update_date DESC) sorted_data
           GROUP BY sorted_data.instance_id, sorted_data.region_id
         ), latest_data AS (
          SELECT DISTINCT ON (irx_1.instance_id, irx_1.region_id) irx_1.instance_id,
             irx_1.region_id,
             rd.count,
             rd.update_date
            FROM region_data rd
              LEFT JOIN instance_region_xref irx_1 ON irx_1.id = rd.instance_region_xref_id
            WHERE rd.update_date <= DATE '${date}'
            ORDER BY irx_1.instance_id, irx_1.region_id, rd.update_date DESC
         )
  SELECT i.id AS instance_id,
     i.name,
     r.name AS location,
     ld.count,
     ld.update_date,
     COALESCE(lt.grouped_data, '{}'::json[]) AS tags,
     COALESCE(lc.grouped_data, '{}'::json[]) AS categories,
     COALESCE(lo.grouped_data, '{}'::json[]) AS organizations
    FROM region r
      RIGHT JOIN instance_region_xref irx ON irx.region_id = r.id
      LEFT JOIN instance i ON irx.instance_id = i.id
      LEFT JOIN region_level rl ON r.region_level_id = rl.id
      LEFT JOIN latest_data ld ON ld.region_id = r.id AND ld.instance_id = i.id
      LEFT JOIN latest_category lc ON lc.region_id = r.id AND lc.instance_id = i.id
      LEFT JOIN latest_tag lt ON lt.region_id = r.id AND lt.instance_id = i.id
      LEFT JOIN latest_organization lo ON lo.region_id = r.id AND lo.instance_id = i.id
   WHERE ld.update_date IS NOT NULL
  `;
}
