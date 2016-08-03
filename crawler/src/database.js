var Promise = require('bluebird');
var pgp = require('pg-promise')({ promiseLib: Promise });
var params = require('./params.js');
var _ = require('lodash');

var dbSchema = {
  tag: {
    idColumn: 'tag_id',
    xrefID: 'instance_region_tag_xref_id',
    table: 'tag',
    dataTable: 'tag_data',
    xrefTable: 'instance_region_tag_xref'
  },
  organization: {
    idColumn: 'organization_id',
    xrefID: 'instance_region_organization_xref_id',
    table: 'organization',
    dataTable: 'organization_data',
    xrefTable: 'instance_region_organization_xref'
  },
  category: {
    idColumn: 'category_id',
    xrefID: 'instance_region_category_xref_id',
    table: 'category',
    dataTable: 'category_data',
    xrefTable: 'instance_region_category_xref'
  }
};

/**
 * main entry to save crawled data into database
 * @param  {object}   db            pgp database object
 * @param  {integer}  instanceID    instance ID
 * @param  {integer}  regionID      region ID
 * @param  {object}   data          open data summary
 * @return {object}   promise
 */
exports.saveData = function(db, instanceID, regionID, data) {
  return db.tx(function(tx) {
    var sql = 'SELECT id FROM instance_region_xref WHERE instance_id = $1 AND region_id = $2';
    var tagData = {};
    var catData = {};
    var orgData = {};
    var instanceRegionID, dataCount;

    return tx.one(sql, [instanceID, regionID])
             .then(function(result) {
               instanceRegionID = result.id;

               sql = [
                 'SELECT count, tags, categories, organizations FROM view_instance_region_info',
                 'WHERE instance_id = $1 AND region_id = $2'
               ].join(' ');

               return tx.oneOrNone(sql, [instanceID, regionID]);
             })
             .then(function(result) {
               if (result) {
                 dataCount = result.count;
                 tagData = _.keyBy(result.tags, 'name');
                 catData = _.keyBy(result.categories, 'name');
                 orgData = _.keyBy(result.organizations, 'name');
               }

               sql = [
                 'SELECT t.id, t.name, xref.id AS xref_id FROM $2^ AS t',
                 'LEFT JOIN $1^ AS xref ON t.id = xref.$3^ AND xref.instance_region_xref_id = $4'
               ].join(' ');

               return Promise.props({
                 tag: tx.any(sql, [
                   dbSchema.tag.xrefTable,
                   dbSchema.tag.table,
                   dbSchema.tag.idColumn,
                   instanceRegionID
                 ]),
                 organization: tx.any(sql, [
                   dbSchema.organization.xrefTable,
                   dbSchema.organization.table,
                   dbSchema.organization.idColumn,
                   instanceRegionID
                 ]),
                 category: tx.any(sql, [
                   dbSchema.category.xrefTable,
                   dbSchema.category.table,
                   dbSchema.category.idColumn,
                   instanceRegionID
                 ])
               });
             })
             .then(function(result) {
               var tags = _.keyBy(result.tag, 'name');
               var organizations = _.keyBy(result.organization, 'name');
               var categories = _.keyBy(result.category, 'name');
               var tasks = [];

               var dataPromise = exports.updateRegionData(tx, instanceRegionID, data.count, dataCount);
               tasks.push(dataPromise);

               var tagPromise = Promise.each(data.tags, function(tag) {
                 return exports.updateItemData(
                   tx,
                   instanceRegionID,
                   tags[tag.display_name],
                   dbSchema.tag,
                   tag.display_name,
                   tag.count,
                   tagData[tag.display_name]
                 );
               });
               tasks.push(tagPromise);

               var orgPromise = Promise.each(data.organizations, function(organization) {
                 return exports.updateItemData(
                   tx,
                   instanceRegionID,
                   organizations[organization.display_name],
                   dbSchema.organization,
                   organization.display_name,
                   organization.count,
                   orgData[organization.display_name]
                 );
               });
               tasks.push(orgPromise);

               var catPromise = Promise.each(data.categories, function(category) {
                 return exports.updateItemData(
                   tx,
                   instanceRegionID,
                   categories[category.display_name],
                   dbSchema.category,
                   category.display_name,
                   category.count,
                   catData[category.display_name]
                 );
               });
               tasks.push(catPromise);

               return Promise.all(tasks);
             });
  });
};

/**
 * save region data,
 * @param  {object}   db                pgp database object
 * @param  {integer}  irID              instance region ID
 * @param  {object}   count             data count
 * @param  {integer}  lastUpdate        latest data count for this region
 * @return {object}   promise
 */
exports.updateRegionData = function(db, irID, count, lastUpdate) {
  // check if the data is the same as the latest record
  var sql = [
    'SELECT count FROM region_data WHERE instance_region_xref_id = $1',
    'ORDER BY update_date DESC LIMIT 1'
  ].join(' ');

  if (lastUpdate === count) {
    sql = [
      'UPDATE region_data SET update_date = now()',
      'WHERE instance_region_xref_id = $1 AND count = $2'
    ].join(' ');
  } else {
    sql = [
      'INSERT INTO region_data (instance_region_xref_id, count, create_date, update_date)',
      'VALUES ($1, $2, now(), now())'
    ].join(' ');
  }

  return db.none(sql, [irID, count]);
};

/**
 * save region data,
 * @param  {object}   db                pgp database object
 * @param  {integer}  irID              instance region ID
 * @param  {object}   item              data item
 * @param  {object}   itemSchema        item database schema infor
 * @param  {string}   name              tag name
 * @param  {integer}  count             data count
 * @param  {object}   lastUpdate        latest data for this item
 * @return {object}   promise
 */
exports.updateItemData = function(db, irID, item, itemSchema, name, count, lastUpdate) {
  var promise = Promise.resolve();
  var sql;

  if (!item) {
    // if the tag doesn't exit at all, insert the new tag
    promise = promise.then(function() {
      sql = [
        'WITH new_item AS (INSERT INTO $1^ (name) VALUES ($4) RETURNING id)',
        'INSERT INTO $2^ ($3^, instance_region_xref_id) (',
        'SELECT new_item.id, $5 FROM new_item) RETURNING *'
      ].join(' ');

      return db.one(sql, [itemSchema.table, itemSchema.xrefTable, itemSchema.idColumn, name, irID])
               .then(function(result) {
                 item = { id: result.tag_id, name: name, xref_id: result.id };
               });
    });
  } else if (!item.xref_id) {
    // if the item doesn't exit for this region, insert the new tag to this region
    promise = promise.then(function() {
      sql = 'INSERT INTO $1^ ($2^, instance_region_xref_id) VALUES ($3, $4) RETURNING *';
      return db.one(sql, [itemSchema.xrefTable, itemSchema.idColumn, item.id, irID])
               .then(function(result) {
                 item.xref_id = result.id;
               });
    });
  }

  return promise.then(function() {
    if (lastUpdate && lastUpdate.count === count) {
      sql = 'UPDATE $1^ SET update_date = now() WHERE $2^ = $3 AND count = $4';
    } else {
      sql = 'INSERT INTO $1^ ($2^, count, create_date, update_date) VALUES ($3, $4, now(), now())';
    }

    return db.none(sql, [itemSchema.dataTable, itemSchema.xrefID, item.xref_id, count]);
  });
};

/**
 * Refresh mateiral views at the database
 * @param  {object}     db    pgp database connection object
 * @return {undefined}
 */
exports.refresh = function(db) {
  db = db || pgp(params.dbConnStr);
  return db.none('REFRESH MATERIALIZED VIEW view_instance_region_info;');
};
