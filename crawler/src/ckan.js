var Promise = require('bluebird');
var request = require('request-promise');
var params = require('./params.js');
var userAgents = require('./userAgents.js');
var _ = require('lodash');

var gentleRequest = function(request) {
  return Promise.delay(_.random(params.minWait, params.maxWait))
                .then(function() {
                  return Promise.timeout(request, params.maxTimeout);
                });
};

var getMetadata = function(url, options) {
  var dataRequest = request({
    method: 'POST',
    uri: url + '/api/3/action/package_search',
    form: { JSON.stringify(options): 1 },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': _.sample(userAgents)
    }
  });

  return gentleRequest(dataRequest);
}

exports.getDataTags = function(url, options) {
  var queryOptions = options || {};
  queryOptions['facet.field'] = 'tags';
  queryOptions['facet.limit'] = params.searchLimit.tag;
  queryOptions.rows = 0;

  return getMetadata(url, queryOptions).then(function(result) {
    return result.search_facets.tags.items;
  });
};

exports.getOrganizations = function(url, options) {
  var queryOptions = options || {};
  queryOptions['facet.field'] = 'organization';
  queryOptions['facet.limit'] = params.searchLimit.organiation;
  queryOptions.rows = 0;

  return getMetadata(url, queryOptions).then(function(result) {
    return result.search_facets.organization.items;
  });
};

exports.getDataGroups = function(url, options) {
  var queryOptions = options || {};
  queryOptions['facet.field'] = 'groups';
  queryOptions['facet.limit'] = params.searchLimit.group;
  queryOptions.rows = 0;

  return getMetadata(url, queryOptions).then(function(result) {
    return result.search_facets.groups.items;
  });
};

exports.getFullMetadata = function(url, options) {
  var queryOptions = options || {};
  queryOptions['facet.field'] = ['groups', 'tags', 'organization'];
  queryOptions['facet.limit'] = params.searchLimit.default;
  queryOptions.rows = 0;

  return getMetadata(url, queryOptions).then(function(result) {
    return {
      count: result.count,
      categories: result.search_facets.groups.items,
      organizations: result.search_facets.organization.items,
      tags: result.search_facets.tags.items
    };
  });
};

exports.getMetadata = function(url, options) {
  var queryOptions = options || {};
  queryOptions.rows = 0;

  return getMetadata(url, queryOptions);
};
