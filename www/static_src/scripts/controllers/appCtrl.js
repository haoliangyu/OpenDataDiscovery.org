import angular from 'angular';

class appCtrl {

  constructor() {
    'ngInject';

    this.pageOptions = {
      navigation: true,
      navigationPosition: 'left',
      scrollingSpeed: 1000,
      anchors: ['home-page', 'map-page', 'export-page']
    };
  }
}

appCtrl.$inject = [];

angular.module('OpenDataDiscovery').controller('appCtrl', appCtrl);

export default appCtrl;
