import angular from 'angular';

class ajaxService {

  constructor($http) {
    'ngInject';
    this.$http = $http;
  }

  /**
   * Get CKAN instance information list
   * @return {array} CKAN instances
   */
  getInstances() {
    return this.$http
      .get('/api/info/instance')
      .then(function(result) {
        return result.data;
      });
  }

}

ajaxService.$inject = ['$http'];

angular.module('OpenDataDiscovery').service('ajaxService', ajaxService);

export default ajaxService;
