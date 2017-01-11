const request = require('request-promise');
const userAgents = require('../userAgents.js');
const _ = require('lodash');
const core = require('../core.js');

exports.getFullMetadata = url => {
  let task = request({
    method: 'GET',
    uri: `${url}/datasets`,
    headers: {
      'User-Agent': _.sample(userAgents)
    },
    json: true
  })
  .then(result => {
    let tags = _.chain(result.data)
                .map('tags')
                .flatten()
                .uniq()
                .value();

    let tagData = _.map(tags, tag => {
      return {
        display_name: tag,
        count: _.filter(result.data, dataset => {
          return _.includes(dataset.tags, tag);
        }).length
      };
    });

    let organizations = _.chain(result.data)
                        .map('main_group_title')
                        .uniq()
                        .value();

    let organizationData = _.map(organizations, organization => {
      return {
        display_name: organization,
        count: _.filter(result.data, dataset => {
          return dataset.main_group_title === organization;
        }).length
      };
    });

    return {
      count: result.metadata.stats.total_count,
      categories: [],
      tags: tagData,
      organizations: organizationData
    };
  });

  return core.gentleRequest(task);
};
