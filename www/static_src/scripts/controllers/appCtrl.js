import angular from 'angular';

class appCtrl {

  constructor($scope) {
    'ngInject';
  }

}

appCtrl.$inject = ['$scope'];

angular.module('OpenDataDiscovery').controller('appCtrl', appCtrl);

export default appCtrl;
