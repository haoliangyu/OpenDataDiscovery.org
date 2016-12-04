import angular from 'angular';

class aboutPage {
  constructor() {
    this.restrict = 'E';
    this.template = require('../../views/pages/about-page.html');
    this.controller = 'aboutCtrl';
    this.controllerAs = 'about';
    this.scope = {};
  }
}

angular.module('OpenDataDiscovery').directive('aboutPage', () => new aboutPage());

export default aboutPage;
