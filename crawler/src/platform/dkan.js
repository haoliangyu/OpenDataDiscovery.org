const request = require('request-promise');
const userAgents = require('../userAgents.js');
const _ = require('lodash');

exports.getFullMetadata = url => {
  return request({
    method: 'GET',
    uri: `${url}/data.json`,
    headers: {
      'User-Agent': _.sample(userAgents)
    },
    json: true
  })
  .then(result => {
    let datasets;

    if (_.isArray(result)) {
      datasets = _.remove(result, { title: 'Data Catalog' });
    } else {
      datasets = result.dataset;
    }

    let tags = _.chain(datasets)
                .map('keyword')
                .flatten()
                .uniq()
                .value();

    let tagData = _.map(tags, tag => {
      return {
        display_name: tag,
        count: _.filter(datasets, dataset => {
          return _.includes(datasets.keyword, tag);
        }).length
      };
    });

    let organizations = _.chain(datasets)
                         .map('publisher')
                         .map('name')
                         .uniq()
                         .value();

    let orgData = _.map(organizations, organization => {
      return {
        display_name: organization,
        count: _.filter(datasets, dataset => {
          return _.get(dataset.publisher, 'name') === organization;
        }).length
      };
    });

    return {
      count: datasets.length,
      categories: [],
      tags: tagData,
      organizations: orgData
    };
  });
};
