var Promise = require('bluebird');
var pgp = require('pg-promise')({ promiseLib: Promise });
var params = require('./params.js');
var _ = require('lodash');

var dbSchema = {
  tag: {
    idColumn: 'tag_id',
    xrefID: 'instance_tag_xref_id',
    table: 'tag',
    dataTable: 'tag_data',
    xrefTable: 'instance_tag_xref'
  },
  organization: {
    idColumn: 'organization_id',
    xrefID: 'instance_organization_xref_id',
    table: 'organization',
    dataTable: 'organization_data',
    xrefTable: 'instance_organization_xref'
  },
  category: {
    idColumn: 'category_id',
    xrefID: 'instance_category_xref_id',
    table: 'category',
    dataTable: 'category_data',
    xrefTable: 'instance_category_xref'
  }
};

/**
 * main entry to save crawled data into database
 * @param  {object}   db            pgp database object
 * @param  {integer}  instanceID    instance ID
 * @param  {object}   data          open data summary
 * @return {object}   promise
 */
exports.saveData = function(db, instanceID, data) {
  return db.tx(function(tx) {
    var tagData = {};
    var catData = {};
    var orgData = {};
    var dataCount;

    let sql = `
      SELECT count, tags, categories, organizations FROM view_instance_info
      WHERE instance_id = $1
    `;

    return tx.oneOrNone(sql, instanceID)
             .then(function(result) {
               if (result) {
                 dataCount = result.count;
                 tagData = _.keyBy(result.tags, 'name');
                 catData = _.keyBy(result.categories, 'name');
                 orgData = _.keyBy(result.organizations, 'name');
               }

               sql = `
                SELECT t.id, t.name, xref.id AS xref_id FROM $2^ AS t
                  LEFT JOIN $1^ AS xref ON t.id = xref.$3^ AND xref.instance_id = $4
               `;

               return Promise.props({
                 tag: tx.any(sql, [
                   dbSchema.tag.xrefTable,
                   dbSchema.tag.table,
                   dbSchema.tag.idColumn,
                   instanceID
                 ]),
                 organization: tx.any(sql, [
                   dbSchema.organization.xrefTable,
                   dbSchema.organization.table,
                   dbSchema.organization.idColumn,
                   instanceID
                 ]),
                 category: tx.any(sql, [
                   dbSchema.category.xrefTable,
                   dbSchema.category.table,
                   dbSchema.category.idColumn,
                   instanceID
                 ])
               });
             })
             .then(function(result) {
               var tags = _.keyBy(result.tag, 'name');
               var organizations = _.keyBy(result.organization, 'name');
               var categories = _.keyBy(result.category, 'name');
               var tasks = [];

               var dataPromise = exports.updateInstanceData(tx, instanceID, data.count, dataCount);
               tasks.push(dataPromise);

               var tagPromise = Promise.each(data.tags, function(tag) {
                 return exports.updateItemData(
                   tx,
                   instanceID,
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
                   instanceID,
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
                   instanceID,
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
 * @param  {integer}  instanceID        instance ID
 * @param  {object}   count             data count
 * @param  {integer}  lastUpdate        latest data count for this region
 * @return {object}   promise
 */
exports.updateInstanceData = function(db, instanceID, count, lastUpdate) {
  let sql;

  // check if the data is the same as the latest record
  if (lastUpdate === count) {
    sql = [
      'UPDATE instance_data SET update_date = now()',
      'WHERE instance_id = $1 AND count = $2'
    ].join(' ');
  } else {
    sql = [
      'INSERT INTO instance_data (instance_id, count, create_date, update_date)',
      'VALUES ($1, $2, now(), now())'
    ].join(' ');
  }

  return db.none(sql, [instanceID, count]);
};

/**
 * save region data,
 * @param  {object}   db                pgp database object
 * @param  {integer}  instanceID        instance ID
 * @param  {object}   item              data item
 * @param  {object}   itemSchema        item database schema infor
 * @param  {string}   name              tag name
 * @param  {integer}  count             data count
 * @param  {object}   lastUpdate        latest data for this item
 * @return {object}   promise
 */
exports.updateItemData = function(db, instanceID, item, itemSchema, name, count, lastUpdate) {
  let promise, sql;

  if (!item) {
    // if the tag doesn't exit at all, insert the new tag
    sql = `
      WITH new_item AS (INSERT INTO $1^ (name) VALUES ($4) RETURNING id)
      INSERT INTO $2^ ($3^, instance_id) (
        SELECT new_item.id, $5 FROM new_item) RETURNING *
    `;

    promise = db.one(sql, [itemSchema.table, itemSchema.xrefTable, itemSchema.idColumn, name, instanceID])
                 .then(function(result) {
                   item = { id: result[itemSchema.idColumn], name: name, xref_id: result.id };
                 });
  } else if (!item.xref_id) {
    // if the item doesn't exit for this region, insert the new tag to this region
    sql = 'INSERT INTO $1^ ($2^, instance_id) VALUES ($3, $4) RETURNING *';

    promise = db.one(sql, [itemSchema.xrefTable, itemSchema.idColumn, item.id, instanceID])
                 .then(function(result) {
                   item.xref_id = result.id;
                 });
  } else {
    promise = Promise.resolve();
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
  return db.none('REFRESH MATERIALIZED VIEW view_instance_info;');
};
