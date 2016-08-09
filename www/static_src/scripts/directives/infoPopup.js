import angular from 'angular';

var template = require('ngtemplate!../../views/components/info-popup.html');

class infoPopup {
  constructor() {
    this.templateUrl = template;
    this.restrict = 'E';
    this.scope = false;
  }
}

angular.module('OpenDataDiscovery').directive('infoPopup', () => new infoPopup());

export default infoPopup;
