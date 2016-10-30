import angular from 'angular';

class mapPage {
  constructor() {
    this.restrict = 'E';
    this.template = require('../../views/pages/map-page.html');
    this.controller = 'mapCtrl';
    this.controllerAs = 'map';
    this.scope = {};
  }
}

angular.module('OpenDataDiscovery').directive('mapPage', () => new mapPage());

export default mapPage;
