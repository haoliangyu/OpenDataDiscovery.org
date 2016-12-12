const Promise = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: Promise });
const params = require('./params.js');
const _ = require('lodash');

const dbSchema = {
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
               let tags = _.keyBy(result.tag, 'name');
               let organizations = _.keyBy(result.organization, 'name');
               let categories = _.keyBy(result.category, 'name');

               let tagUpdates = _.map(data.tags, tag => {
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

               let orgUpdates = _.map(data.organizations, organization => {
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

               let catUpdates = _.map(data.categories, category => {
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

               return Promise.all(_.concat(tagUpdates, orgUpdates, catUpdates))
                .then(updates => {
                  let updateSQL = _.reduce(updates, (updateSQL, update) => {
                    return updateSQL + update;
                  }, '');

                  if (data.count !== dataCount) {
                    updateSQL += `
                      INSERT INTO instance_data (instance_id, count, create_date, update_date)
                      VALUES (${instanceID}, ${data.count}, now(), now());
                    `;
                  } else {
                    updateSQL += `
                      UPDATE instance_data SET update_date = now() WHERE instance_id = ${instanceID} AND count = ${data.count};
                    `;
                  }

                  return db.none(updateSQL);
                });
             });
  });
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

  return promise.then(() => {
    if (lastUpdate && lastUpdate.count === count) {
      return `
        UPDATE ${itemSchema.dataTable} SET update_date = now() WHERE ${itemSchema.xrefID} = ${item.xref_id} AND count = ${count};
      `;
    }

    return `
      INSERT INTO ${itemSchema.dataTable} (${itemSchema.xrefID}, count, create_date, update_date)
      VALUES (${item.xref_id}, ${count}, now(), now());
    `;
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
