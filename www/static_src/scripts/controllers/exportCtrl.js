import angular from 'angular';

class exportCtrl {

  constructor($scope, ajaxService) {
    'ngInject';
  }
}

exportCtrl.$inject = ['$scope', 'ajaxService'];

angular.module('OpenDataDiscovery').controller('exportCtrl', exportCtrl);

export default exportCtrl;
