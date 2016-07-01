import angular from 'angular';

class mapView {
  constructor() {
    this.restrict = 'E';
    this.template = require('../../views/components/map-view.html');
    this.scope = false;
    this.controller = 'mapCtrl';
  }
}

angular.module('OpenDataDiscovery').directive('mapView', () => new mapView());

export default mapView;
