import angular from 'angular';

class exportPage {
  constructor() {
    this.restrict = 'E';
    this.template = require('../../views/pages/export-page.html');
    this.controller = 'exportCtrl';
    this.controllerAs = 'export';
    this.scope = {};
  }
}

angular.module('OpenDataDiscovery').directive('exportPage', () => new exportPage());

export default exportPage;
