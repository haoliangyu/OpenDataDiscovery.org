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
        name: 'world',
        tooltip: 'Show the World',
        icon: 'fa-globe',
        click: this.maxMap.bind(this)
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

  maxMap() {
    this.mapService.map.fitWorld();
  }

  showProjectRepo() {
    window.open('https://github.com/haoliangyu/OpenDataDiscovery.org', '_blank');
  }
}

toolbarCtrl.$inject = ['$scope', '$rootScope', 'mapService'];

angular.module('OpenDataDiscovery').controller('toolbarCtrl', toolbarCtrl);

export default toolbarCtrl;
