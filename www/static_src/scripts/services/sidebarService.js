import angular from 'angular';

class sidebarService {

  constructor($rootScope) {
    'ngInject';

    this.$rootScope = $rootScope;
  }

  switchTo(view, instance) {
    this.$rootScope.$broadcast('sidebar:switch', view, instance);
  }

}

sidebarService.$inject = ['$rootScope'];

angular.module('OpenDataDiscovery').service('sidebarService', sidebarService);

export default sidebarService;
