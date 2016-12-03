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
    let tags = _.chain(result.dataset)
                .map('keyword')
                .flatten()
                .uniq()
                .value();

    let organizations = _.chain(result.dataset)
                         .map('publisher')
                         .map('name')
                         .uniq()
                         .value();

    return {
      count: result.dataset.length,
      categories: [],
      tags: tags,
      organizations: organizations
    };
  });
};
