const Promise = require('bluebird');
const rp = require('request-promise');
const userAgents = require('../userAgents.js');
const _ = require('lodash');

const requestRows = 500;

exports.getFullMetadata = url => {
  return rp({
    method: 'GET',
    uri: `${url}/api/datasets/1.0/search`,
    headers: {
      'User-Agent': _.sample(userAgents)
    },
    json: true
  })
  .then(result => {
    let requestCount = Math.ceil(result.nhits / requestRows);
    let requests = [];

    for (let i = 0; i < requestCount; i++) {
      let request = rp({
        method: 'GET',
        uri: `${url}/api/datasets/1.0/search?start=${i * requestRows}&rows=${requestRows}`,
        json: true
      })
      .then(result => {
        return result.datasets;
      });

      requests.push(request);
    }

    return Promise.all(requests);
  })
  .then(results => {
    let datasets = _.flatten(results);
    let tags = {};
    let organizations = {};

    _.forEach(datasets, dataset => {
      if (organizations[dataset.metas.publisher]) {
        organizations[dataset.metas.publisher]++;
      } else {
        organizations[dataset.metas.publisher] = 1;
      }

      _.forEach(dataset.metas.keyword, tag => {
        if (tags[tag]) {
          tags[tag]++;
        } else {
          tags[tag] = 1;
        }
      });
    });

    let tagData = _.map(tags, (count, name) => {
      return {
        display_name: name,
        count: count
      };
    });

    let orgData = _.map(organizations, (count, organization) => {
      return {
        display_name: organization,
        count: count
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
