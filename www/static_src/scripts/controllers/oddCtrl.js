import angular from 'angular';

class oddCtrl {

  constructor($scope) {
    'ngInject';
  }

}

oddCtrl.$inject = ['$scope'];

angular.module('OpenDataDiscovery').controller('oddCtrl', oddCtrl);

export default oddCtrl;
