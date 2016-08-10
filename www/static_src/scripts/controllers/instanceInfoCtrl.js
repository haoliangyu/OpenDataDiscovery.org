import angular from 'angular';

class instanceInfoCtrl {

  constructor($scope) {
    'ngInject';
  }
}

instanceInfoCtrl.$inject = ['$scope'];

angular.module('OpenDataDiscovery').controller('instanceInfoCtrl', instanceInfoCtrl);

export default instanceInfoCtrl;
