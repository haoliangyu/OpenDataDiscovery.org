import angular from 'angular';

class headerToolbarCtrl {

  constructor($scope, pageService) {
    'ngInject';

    this.pageService = pageService;

    this.buttons = [
      { label: 'Homepage', id: 'home-page' },
      { label: 'Map', id: 'map-page' },
      { label: 'Data', id: 'export-page' }
    ];
  }

  scrollTo(elementID) {
    this.pageService.scrollTo(elementID);
  }

  openGitHubRepo() {
    this.pageService.openGitHubRepo();
  }
}

headerToolbarCtrl.$inject = ['$scope', 'pageService'];

angular.module('OpenDataDiscovery').controller('headerToolbarCtrl', headerToolbarCtrl);

export default headerToolbarCtrl;
