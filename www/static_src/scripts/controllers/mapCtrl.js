import angular from 'angular';

class mapCtrl {

  constructor($scope, ajaxService, mapService) {
    'ngInject';

    this.datasets = 0;
    this.showLegend = false;

    $scope.$on('map:ready', () => {
      this.showLegend = true;
    });

    ajaxService.getInstanceSummary()
      .then(result => {
        this.datasets = result.summary.count;
      });

    mapService.initialize();
  }
}

mapCtrl.$inject = ['$scope', 'ajaxService', 'mapService'];

angular.module('OpenDataDiscovery').controller('mapCtrl', mapCtrl);

export default mapCtrl;
