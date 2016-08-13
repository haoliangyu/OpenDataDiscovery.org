import angular from 'angular';

class mapView {
  constructor() {
    this.restrict = 'E';
    this.template = require('../../views/components/map-view.html');
    this.controller = 'mapCtrl';
    this.controllerAs = 'map';
    this.scope = {};
  }
}

angular.module('OpenDataDiscovery').directive('mapView', () => new mapView());

export default mapView;
