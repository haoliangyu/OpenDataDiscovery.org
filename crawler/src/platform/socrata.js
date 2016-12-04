const request = require('request-promise');
const userAgents = require('../userAgents.js');
const _ = require('lodash');

exports.getFullMetadata = url => {
  return request({
    method: 'GET',
    uri: `http://api.us.socrata.com/api/catalog/v1/domains/${url}/facets`,
    headers: {
      'User-Agent': _.sample(userAgents)
    },
    json: true
  })
  .then(result => {
    return {
      count: _.find(result, { facet: 'datatypes' }).count,
      categories: facetNormalize(result, 'categories'),
      tags: facetNormalize(result, 'tags'),
      // because socrata API doesn't provide publisher information
      organizations: []
    };
  });
};

function facetNormalize(data, facet) {
  return _.chain(data)
          .find({ facet: facet })
          .get('values')
          .map(fact => {
            return { display_name: fact.value, count: fact.count };
          })
          .value();
}
