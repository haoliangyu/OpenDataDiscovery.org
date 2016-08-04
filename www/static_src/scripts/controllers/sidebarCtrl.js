import angular from 'angular';

class sidebarCtrl {

  constructor($scope) {
    'ngInject';
  }
}

sidebarCtrl.$inject = ['$scope'];

angular.module('OpenDataDiscovery').controller('sidebarCtrl', sidebarCtrl);

export default sidebarCtrl;
