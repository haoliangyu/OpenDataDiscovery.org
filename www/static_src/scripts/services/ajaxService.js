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
      .get('/api/instances')
      .then(result => {
        return result.data;
      });
  }

  /**
   * Get region level list
   * @return {object} response object
   */
  getRegionLevels() {
    return this.$http
      .get('/api/region_levels')
      .then(result => {
        return result.data;
      });
  }

  /**
   * Get style definition.
   * @param  {integer} classCount   number of style classes
   * @return {object[]}             styles
   */
  getMapStyles(classCount) {
    classCount |= 5;
    return this.$http
      .post('/api/map_styles', { class: classCount })
      .then(result => {
        return result.data;
      });
  }

  /**
   * [getInstanceInfo description]
   * @param  {integer} instanceID instance ID
   * @param  {integer} regionID   region ID
   * @return {object}             instance info
   */
  getInstanceInfo(instanceID, regionID) {
    return this.$http
      .get(`/api/instance/${instanceID}/${regionID}`, {
        cache: true
      })
      .then(result => {
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
