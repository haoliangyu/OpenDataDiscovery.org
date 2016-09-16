import angular from 'angular';

class regionInfoView {
  constructor() {
    this.restrict = 'E';
    this.template = require('../../views/components/region-info-view.html');
    this.controller = 'regionInfoCtrl';
    this.controllerAs = 'regionInfo';
    this.scope = {};
  }
}

angular.module('OpenDataDiscovery').directive('regionInfoView', () => new regionInfoView());

export default regionInfoView;
