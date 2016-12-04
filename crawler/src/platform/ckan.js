const Promise = require('bluebird');
const request = require('request-promise');
const params = require('../params.js');
const userAgents = require('../userAgents.js');
const _ = require('lodash');

var getMetadata = function(url, options) {
  var formData = {};
  formData[JSON.stringify(options)] = 1;

  var dataRequest = request({
    method: 'POST',
    uri: url + '/api/3/action/package_search',
    form: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': _.sample(userAgents)
    },
    json: true
  });

  return dataRequest;
};

exports.getDataTags = function(url, options) {
  var queryOptions = options || {};
  queryOptions['facet.field'] = 'tags';
  queryOptions['facet.limit'] = params.searchLimit.tag;
  queryOptions.rows = 0;

  return getMetadata(url, queryOptions).then(function(result) {
    return result.search_facets.tags ? result.search_facets.tags.items : [];
  });
};

exports.getOrganizations = function(url, options) {
  var queryOptions = options || {};
  queryOptions['facet.field'] = 'organization';
  queryOptions['facet.limit'] = params.searchLimit.organiation;
  queryOptions.rows = 0;

  return getMetadata(url, queryOptions).then(function(result) {
    return result.search_facets.organization ? result.search_facets.tags.items : [];
  });
};

exports.getDataGroups = function(url, options) {
  var queryOptions = options || {};
  queryOptions['facet.field'] = 'groups';
  queryOptions['facet.limit'] = params.searchLimit.group;
  queryOptions.rows = 0;

  return getMetadata(url, queryOptions).then(function(result) {
    return result.search_facets.groups ? result.search_facets.tags.items : [];
  });
};

exports.getFullMetadata = function(url, options) {
  var queryOptions = options || {};
  queryOptions['facet.field'] = ['groups', 'tags', 'organization'];
  queryOptions['facet.limit'] = params.searchLimit.default;
  queryOptions.rows = 0;

  return getMetadata(url, queryOptions).then(function(response) {
    var search_facets = response.result.search_facets;
    return {
      count: response.result.count,
      categories: search_facets.groups ? search_facets.groups.items : [],
      organizations: search_facets.organization ? search_facets.organization.items : [],
      tags: search_facets.tags ? search_facets.tags.items : []
    };
  });
};

exports.getMetadata = function(url, options) {
  var queryOptions = options || {};
  queryOptions.rows = 0;

  return getMetadata(url, queryOptions);
};
