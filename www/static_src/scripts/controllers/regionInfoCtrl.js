import angular from 'angular';

class regionInfoCtrl {

  constructor($scope, $timeout, mapService) {
    'ngInject';

    this.mapService = mapService;

    this.instances = [];
    this.name = '';
    this.showRegionInfo = false;

    $scope.$on('map:inFeature', (event, properties) => {
      $timeout(() => {
        this.showRegionInfo = true;
        this.instances = properties.instances;
        this.name = properties.name;
        this.count = properties.count;
      });
    });

    $scope.$on('map:outFeature', () => {
      $timeout(() => {
        this.showRegionInfo = false;
      });
    });
  }

  getSquareColor(count) {
    return this.mapService.getMapStyle(count).fill;
  }
}

regionInfoCtrl.$inject = ['$scope', '$timeout', 'mapService'];

angular.module('OpenDataDiscovery').controller('regionInfoCtrl', regionInfoCtrl);

export default regionInfoCtrl;
