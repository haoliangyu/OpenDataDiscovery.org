import angular from 'angular';

class sidebarView {
  constructor() {
    this.restrict = 'E';
    this.template = require('../../views/components/sidebar-view.html');
    this.controller = 'sidebarCtrl';
    this.controllerAs = 'sidebar';
    this.scope = {};
  }
}

angular.module('OpenDataDiscovery').directive('sidebarView', () => new sidebarView());

export default sidebarView;
