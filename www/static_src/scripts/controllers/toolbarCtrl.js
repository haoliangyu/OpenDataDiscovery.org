import angular from 'angular';

class toolbarCtrl {

  constructor($scope, $rootScope, mapService) {
    'ngInject';

    this.$rootScope = $rootScope;
    this.mapService = mapService;

    this.buttons = [
      {
        name: 'zoom in',
        tooltip: 'Zoom In',
        icon: 'fa-plus',
        click: this.mapZoomIn.bind(this)
      },
      {
        name: 'zoom out',
        tooltip: 'Zoom Out',
        icon: 'fa-minus',
        click: this.mapZoomOut.bind(this)
      },
      {
        name: 'instance list',
        tooltip: 'Open Instance List',
        icon: 'fa-bars',
        click: this.showInstanceList.bind(this)
      },
      {
        name: 'about',
        tooltip: 'About',
        icon: 'fa-info',
        click: this.showAbout.bind(this)
      },
      {
        name: 'github',
        tooltip: 'Visite Projec Repository',
        icon: 'fa-github-alt',
        click: this.showProjectRepo.bind(this)
      }
    ];
  }

  mapZoomIn() {
    this.mapService.map.zoomIn();
  }

  mapZoomOut() {
    this.mapService.map.zoomOut();
  }

  showInstanceList() {
    this.$rootScope.$broadcast('sidebar:open', 'Instance List');
  }

  showAbout() {

  }

  showProjectRepo() {
    window.open('https://github.com/haoliangyu/OpenDataDiscovery.org', '_blank');
  }
}

toolbarCtrl.$inject = ['$scope', '$rootScope', 'mapService'];

angular.module('OpenDataDiscovery').controller('toolbarCtrl', toolbarCtrl);

export default toolbarCtrl;
