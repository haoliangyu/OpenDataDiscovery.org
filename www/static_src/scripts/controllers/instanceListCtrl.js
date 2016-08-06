import angular from 'angular';

class instanceListCtrl {

  constructor($scope, mapService) {
    'ngInject';

    this.mapService = mapService;
    this.yes = 'yes';

    $scope.$on('map:ready', () => {
      this.instances = mapService.instances;
    });
  }

  toggleInstance(instance) {
    this.mapService.toggleInstance(instance);
  }
}

instanceListCtrl.$inject = ['$scope', 'mapService'];

angular.module('OpenDataDiscovery').controller('instanceListCtrl', instanceListCtrl);

export default instanceListCtrl;
