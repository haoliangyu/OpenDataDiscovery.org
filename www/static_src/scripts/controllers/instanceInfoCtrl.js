import angular from 'angular';

class instanceInfoCtrl {

  constructor($scope) {
    'ngInject';

    $scope.$on('sidebar:closed', () => {
      delete this.instance;
    });

    $scope.$on('sidebar:open', (e, view, data) => {
      if (view !== 'Instance Info') { return; }
      this.instance = data;
    });
  }
}

instanceInfoCtrl.$inject = ['$scope'];

angular.module('OpenDataDiscovery').controller('instanceInfoCtrl', instanceInfoCtrl);

export default instanceInfoCtrl;
