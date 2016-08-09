import angular from 'angular';

class instanceListView {
  constructor() {
    this.restrict = 'E';
    this.template = require('../../views/components/instance-list-view.html');
    this.controller = 'instanceListCtrl';
    this.controllerAs = 'instanceList';
    this.scope = {};
  }
}

angular.module('OpenDataDiscovery').directive('instanceListView', () => new instanceListView());

export default instanceListView;
