import angular from 'angular';

class mapCtrl {

  constructor($scope, mapService, $mdSidenav) {
    'ngInject';

    mapService.initialize();

    this.$mdSidenav = $mdSidenav;

    /**
     * Sidebar Events
     */

    $scope.$on('sidebar:open', () => {
      this.open();
    });

    $scope.$on('sidebar:close', () => {
      this.close();
    });
  }

  open() {
    this.$mdSidenav('right').toggle();
  }

  close() {
    this.$mdSidenav('right').close();
  }

}

mapCtrl.$inject = ['$scope', 'mapService', '$mdSidenav'];

angular.module('OpenDataDiscovery').controller('mapCtrl', mapCtrl);

export default mapCtrl;
