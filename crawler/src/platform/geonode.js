const rp = require('request-promise');
const userAgents = require('../userAgents.js');
const _ = require('lodash');

exports.getFullMetadata = url => {
  return rp({
    method: 'GET',
    uri: `${url}/api/base`,
    headers: {
      'User-Agent': _.sample(userAgents)
    },
    json: true
  })
  .then(result => {
    let categories = _.reduce(result.objects, (count, dataset) => {
      if (dataset.category__gn_description) {
        if (count[dataset.category__gn_description]) {
          count[dataset.category__gn_description]++;
        } else {
          count[dataset.category__gn_description] = 1;
        }
      }

      return count;
    }, {});

    let catData = _.map(categories, (count, name) => {
      return {
        display_name: name,
        count: count
      };
    });

    return {
      count: result.meta.total_count,
      categories: catData,
      tags: [],
      organizations: []
    };
  });
};
