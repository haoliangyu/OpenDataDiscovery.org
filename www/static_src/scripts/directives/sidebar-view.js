import angular from 'angular';

class sidebarView {
  constructor() {
    this.restrict = 'E';
    this.template = require('../../views/components/sidebar-view.html');
    this.scope = false;
    this.controller = 'sidebarCtrl';
  }
}

angular.module('OpenDataDiscovery').directive('sidebarView', () => new sidebarView());

export default sidebarView;
