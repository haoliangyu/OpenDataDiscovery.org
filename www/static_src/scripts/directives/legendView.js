import angular from 'angular';

class legendView {
  constructor() {
    this.template = require('../../views/components/legend-view.html');
    this.restrict = 'E';
    this.scope = {};
    this.controller = 'legendCtrl';
    this.controllerAs = 'legend';
  }
}

angular.module('OpenDataDiscovery').directive('legendView', () => new legendView());

export default legendView;
