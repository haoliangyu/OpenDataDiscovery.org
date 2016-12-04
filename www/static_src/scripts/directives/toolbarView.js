import angular from 'angular';

class toolbarView {
  constructor() {
    this.restrict = 'E';
    this.template = require('../../views/components/toolbar-view.html');
    this.controller = 'toolbarCtrl';
    this.controllerAs = 'toolbar';
    this.scope = {};
  }
}

angular.module('OpenDataDiscovery').directive('toolbarView', () => new toolbarView());

export default toolbarView;
