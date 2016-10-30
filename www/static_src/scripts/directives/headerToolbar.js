import angular from 'angular';

class headerToolbar {
  constructor() {
    this.restrict = 'E';
    this.template = require('../../views/components/header-toolbar.html');
    this.controller = 'headerToolbarCtrl';
    this.controllerAs = 'headerToolbar';
    this.scope = {};
  }
}

angular.module('OpenDataDiscovery').directive('headerToolbar', () => new headerToolbar());

export default headerToolbar;
