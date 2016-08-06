import angular from 'angular';

class sidebarCtrl {

  constructor($scope, $mdSidenav) {
    'ngInject';

    this.$mdSidenav = $mdSidenav;
    this.tabs = ['Instance List', 'Instance Info'];

    /**
     * Sidebar Events
     */

    $scope.$on('sidebar:open', (event, view) => {
      this.open(view);
    });

    $scope.$on('sidebar:close', () => {
      this.close();
    });
  }

  open(view) {
    this.$mdSidenav('right').toggle();

    if (view) {
      var tabIndex = _.indexOf(this.tabs, view);
      this.selectedTab = tabIndex > -1 ? tabIndex : 0;
    }
  }

  close() {
    this.$mdSidenav('right').close();
  }
}

sidebarCtrl.$inject = ['$scope', '$mdSidenav'];

angular.module('OpenDataDiscovery').controller('sidebarCtrl', sidebarCtrl);

export default sidebarCtrl;
