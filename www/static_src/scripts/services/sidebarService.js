import angular from 'angular';

class sidebarService {

  constructor() {
    'ngInject';
    this.visible = false;
  }

}

sidebarService.$inject = [];

angular.module('OpenDataDiscovery').service('sidebarService', sidebarService);

export default sidebarService;
