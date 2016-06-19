import angular from 'angular';

class mapView {
  constructor() {
    this.restrict = 'E';
    this.templat = require('../../views/components/map-view.html');
    this.scope= false;
    this.controller = 'mapCtrl';
  }
}

angular.module('OpenDataDiscovery').directive('mapView', mapView);

export default mapView;
