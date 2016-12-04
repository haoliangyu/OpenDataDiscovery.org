import angular from 'angular';

class instanceInfoView {
  constructor() {
    this.restrict = 'E';
    this.template = require('../../views/components/instance-info-view.html');
    this.controller = 'instanceInfoCtrl';
    this.controllerAs = 'instanceInfo';
    this.scope = {};
  }
}

angular.module('OpenDataDiscovery').directive('instanceInfoView', () => new instanceInfoView());

export default instanceInfoView;
