const request = require('request-promise');
const userAgents = require('../userAgents.js');
const _ = require('lodash');
const database = require('../database.js');

const db = database.getConnection();

exports.getFullMetadata = url => {

  let sql = `
    SELECT api_url, api_key FROM junar_instance_info AS jii
    LEFT JOIN instance AS i ON i.id = jii.instance_id
    WHERE i.url = $1
  `;

  return db.one(sql, url)
    .then(result => {
      return request({
        method: 'GET',
        uri: `${result.api_url}/api/v2/datasets/?auth_key=${result.api_key}`,
        headers: {
          'User-Agent': _.sample(userAgents)
        },
        json: true
      });
    })
    .then(results => {

      let tags = _.chain(results)
                  .map('tags')
                  .flatten()
                  .uniq()
                  .filter(tag => tag !== '')
                  .value();

      let tagData = _.map(tags, tag => {
        return {
          display_name: tag,
          count: _.filter(results, dataset => {
            return _.includes(dataset.tags, tag);
          }).length
        };
      });

      let categories = _.chain(results)
                        .map('category_name')
                        .uniq()
                        .value();

      let categoryData = _.map(categories, category => {
        return {
          display_name: category,
          count: _.filter(results, dataset => dataset.category_name === category).length
        };
      });

      return {
        count: results.length,
        categories: categoryData,
        tags: tagData,
        organizations: []
      };
    });
};
