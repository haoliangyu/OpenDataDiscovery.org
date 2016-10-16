import angular from 'angular';

class instanceInfoChartCtrl {

  constructor($scope) {
    'ngInject';
  }

}

instanceInfoChartCtrl.$inject = ['$scope'];

angular.module('OpenDataDiscovery').controller('instanceInfoChartCtrl', instanceInfoChartCtrl);

export default instanceInfoChartCtrl;
