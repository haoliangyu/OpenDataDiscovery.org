import angular from 'angular';

class ajaxService {

  constructor($http) {
    'ngInject';
    this.$http = $http;
  }

  /**
   * Get CKAN instance information list
   * @return {object} response object
   */
  getInstances() {
    return this.$http
      .get('/api/info/instances')
      .then(function(result) {
        return result.data;
      });
  }

  /**
   * Get region level list
   * @return {object} response object
   */
  getRegionLevels() {
    return this.$http
      .get('/api/info/region_levels')
      .then(function(result) {
        return result.data;
      });
  }

  /**
   * Get the current base url;.
   * @return {string} base url
   */
  getBaseUrl() {
    return location.origin;
  }

}

ajaxService.$inject = ['$http'];

angular.module('OpenDataDiscovery').service('ajaxService', ajaxService);

export default ajaxService;
