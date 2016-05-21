var Promise = require('bluebird');
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
 * @param  {object}   db          pgp database object
 * @param  {integer}  instanceID  instance ID
 * @param  {integer}  regionID    region ID
 * @param  {object}   data        open data summary
 * @return {object}   promise
 */
exports.saveData = function(db, instanceID, regionID, data) {
  return db.tx(function(tx) {
    var sql = 'SELECT id FROM instance_region_xref WHERE instance_id = $1 AND region_id = $2';
    var instanceRegionID;

    return tx.one(sql, [instanceID, regionID])
             .then(function(result) {
               instanceRegionID = result.id;
               return exports.updateRegionData(tx, instanceRegionID, data.count);
             })
             .then(function() {
               // get all available tags, organizations, and categories for this region
               sql = [
                 'SELECT t.id, t.name, xref.id AS xref_id FROM $1^ AS xref',
                 'RIGHT JOIN $2^ AS t ON t.id = xref.$3^ WHERE xref.instance_region_xref_id = $4'
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
               var tags = _.zipObject(_.map(result.tag, 'name'), result.tag);
               var organizations = _.zipObject(_.map(result.organization, 'name'), result.organization);
               var categories = _.zipObject(_.map(result.category, 'name'), result.category);
               var tasks = [];

               var tagPromise = Promise.each(data.tags, function(tag) {
                 return exports.updateItemData(tx, instanceRegionID, tags, dbSchema.tag, tag.display_name, tag.count);
               });
               tasks.push(tagPromise);

               var orgPromise = Promise.each(data.organizations, function(organization) {
                 return exports.updateItemData(tx, instanceRegionID, organizations, dbSchema.organization, organization.display_name, organization.count);
               });
               tasks.push(orgPromise);

               var catPromise = Promise.each(data.categories, function(category) {
                 return exports.updateItemData(tx, instanceRegionID, categories, dbSchema.category, category.display_name, category.count);
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
 * @return {object}   promise
 */
exports.updateRegionData = function(db, irID, count) {
  // check if the data is the same as the latest record
  var sql = [
    'SELECT count FROM region_data WHERE instance_region_xref_id = $1',
    'ORDER BY update_date DESC LIMIT 1'
  ].join(' ');

  return db.oneOrNone(sql, irID)
           .then(function(result) {
             if (result && result.count === count) {
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
           });
};

/**
 * save region data,
 * @param  {object}   db                pgp database object
 * @param  {integer}  irID              instance region ID
 * @param  {object}   items             items for this region
 * @param  {object}   itemSchema        item database schema infor
 * @param  {string}   name              tag name
 * @param  {integer}  count             data count
 * @return {object}   promise
 */
exports.updateItemData = function(db, irID, items, itemSchema, name, count) {
  var promise = Promise.resolve();

  if (!items[name]) {
    // if the tag doesn't exit at all, insert the new tag
    promise = promise.then(function() {
      var sql = [
        'WITH new_item AS (INSERT INTO $1^ (name) VALUES ($4) RETURNING id)',
        'INSERT INTO $2^ ($3^, instance_region_xref_id) (',
        'SELECT new_item.id, $5 FROM new_item) RETURNING *'
      ].join(' ');

      return db.one(sql, [itemSchema.table, itemSchema.xrefTable, itemSchema.idColumn, name, irID])
               .then(function(result) {
                 items[name] = { id: result.tag_id, name: name, xref_id: result.id };
               });
    });
  } else if (!items[name].xref_id) {
    // if the tag doesn't exit for this region, insert the new tag to this region
    promise = promise.then(function() {
      var sql = 'INSERT INTO $1^ ($2^, instance_region_xref_id) VALUES ($3, $4) RETURNING *';
      return db.one(sql, [itemSchema.xrefTable, itemSchema.idColumn, name, items[name].id])
               .then(function(result) {
                 items[name].xref_id = result.id;
               });
    });
  }

  // get latest record
  var sql = 'SELECT count FROM $1^ WHERE $2^ = $3 ORDER BY update_date DESC LIMIT 1';
  return promise.then(function() {
    db.oneOrNone(sql, [itemSchema.dataTable, itemSchema.xrefID, irID]);
  })
  .then(function(result) {
    if (result && result.count === count) {
      sql = 'UPDATE $1^ SET update_date = now() WHERE $2^ = $3 AND count = $4';
    } else {
      sql = 'INSERT INTO $1^ ($2^, count, create_date, update_date) VALUES ($3, $4, now(), now())';
    }

    return db.none(sql, [itemSchema.dataTable, itemSchema.xrefID, items[name].xref_id, count]);
  });
};

/**
 * Refresh mateiral views at the database
 * @param  {object}     db    pgp database connection object
 * @return {undefined}
 */
exports.refresh = function(db) {
  return db.none('REFRESH MATERIALIZED VIEW view_instance_region_info');
};
