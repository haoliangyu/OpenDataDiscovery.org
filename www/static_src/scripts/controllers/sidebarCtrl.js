import angular from 'angular';

class sidebarCtrl {

  constructor($scope, $rootScope, $mdSidenav, sidebarService) {
    'ngInject';

    this.$mdSidenav = $mdSidenav;
    this.$rootScope = $rootScope;
    this.sidebarService = sidebarService;
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
    this.$mdSidenav('right').toggle()
      .then(() => {
        this.sidebarService.visible = true;

        if (view) {
          var tabIndex = _.indexOf(this.tabs, view);
          this.selectedTab = tabIndex > -1 ? tabIndex : 0;
        }
      });
  }

  close() {
    this.$mdSidenav('right').close()
      .then(() => {
        this.sidebarService.visible = false;
        this.$rootScope.$broadcast('sidebar:closed');
      });
  }
}

sidebarCtrl.$inject = ['$scope', '$rootScope', '$mdSidenav', 'sidebarService'];

angular.module('OpenDataDiscovery').controller('sidebarCtrl', sidebarCtrl);

export default sidebarCtrl;
