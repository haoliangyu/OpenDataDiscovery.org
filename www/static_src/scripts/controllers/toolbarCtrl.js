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
}

toolbarCtrl.$inject = ['$scope', '$rootScope', 'mapService'];

angular.module('OpenDataDiscovery').controller('toolbarCtrl', toolbarCtrl);

export default toolbarCtrl;
