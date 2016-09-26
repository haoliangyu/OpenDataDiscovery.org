import angular from 'angular';

class sidebarCtrl {

  constructor($scope, sidebarService) {
    'ngInject';

    this.sidebarService = sidebarService;
    this.tabs = ['Instance List', 'Instance Info'];

    /**
     * Sidebar Events
     */

    $scope.$on('sidebar:switch', (event, view) => {
      this.switchTo(view);
    });
  }

  switchTo(view) {
    var tabIndex = _.indexOf(this.tabs, view);
    this.selectedTab = tabIndex > -1 ? tabIndex : 0;
  }
}

sidebarCtrl.$inject = ['$scope', 'sidebarService'];

angular.module('OpenDataDiscovery').controller('sidebarCtrl', sidebarCtrl);

export default sidebarCtrl;
