import angular from 'angular';

class sidebarCtrl {

  constructor($scope, $mdSidenav) {
    'ngInject';

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

sidebarCtrl.$inject = ['$scope', '$mdSidenav'];

angular.module('OpenDataDiscovery').controller('sidebarCtrl', sidebarCtrl);

export default sidebarCtrl;
