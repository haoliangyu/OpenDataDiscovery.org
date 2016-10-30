import angular from 'angular';

class homePage {
  constructor() {
    this.restrict = 'E';
    this.template = require('../../views/pages/home-page.html');
    this.controller = 'homepageCtrl';
    this.controllerAs = 'homepage';
    this.scope = {};
  }
}

angular.module('OpenDataDiscovery').directive('homePage', () => new homePage());

export default homePage;
