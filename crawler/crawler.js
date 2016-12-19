const Promise = require('bluebird');
const Queue = require('promise-queue');
const worker = require('./src/worker.js');
const database = require('./src/database.js');
const logger = require('log4js').getLogger('crawler');
const _ = require('lodash');

Queue.configure(Promise);

exports.harvestAll = function(db) {
  let queue;
  let sql = `
    SELECT i.id, i.name, i.url, lower(p.name) AS platform FROM instance AS i
      LEFT JOIN platform AS p ON i.platform_id = p.id
    WHERE i.active
  `;

  return db.any(sql)
    .then(function(instances) {
      return new Promise(function(resolve) {
        queue = new Queue(5, Infinity, {
          onEmpty: function() {
            resolve();
          }
        });

        _.forEach(instances, function(instance) {
          queue.add(function() {
            return worker.crawl(db, instance, true);
          });
        });
      });
    })
    .then(() => {
      logger.info('Crawling complete!');

      let updateCat = `
        UPDATE category_data SET update_date = now() WHERE id IN (
          SELECT DISTINCT ON (cd.instance_category_xref_id) cd.id
          FROM category_data cd
          ORDER BY cd.instance_category_xref_id, cd.update_date DESC
        );
      `;

      let updateTag = `
        UPDATE tag_data SET update_date = now() WHERE id IN (
          SELECT DISTINCT ON (td.instance_tag_xref_id) td.id
          FROM tag_data td
          ORDER BY td.instance_tag_xref_id, td.update_date DESC
        );
      `;

      let updateOrg = `
        UPDATE organization_data SET update_date = now() WHERE id IN (
          SELECT DISTINCT ON (od.instance_organization_xref_id) od.id
          FROM organization_data od
          ORDER BY od.instance_organization_xref_id, od.update_date DESC
        );
      `;

      return db.none(updateCat + updateTag + updateOrg);
    })
    .then(() => {
      return database.refresh(db);
    });
};

exports.refresh = function(db) {
  return database.refresh(db);
};
