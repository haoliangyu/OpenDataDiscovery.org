import angular from 'angular';

class mapCtrl {

  constructor($scope) {
    'ngInject';

    
  }

}

mapCtrl.$inject = ['$scope', 'mapService'];

angular.module('OpenDataDiscovery').controller('mapCtrl', mapCtrl);

export default mapCtrl;
