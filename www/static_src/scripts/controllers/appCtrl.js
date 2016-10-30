import angular from 'angular';

class appCtrl {

  constructor() {
    'ngInject';
  }
}

appCtrl.$inject = [];

angular.module('OpenDataDiscovery').controller('appCtrl', appCtrl);

export default appCtrl;
