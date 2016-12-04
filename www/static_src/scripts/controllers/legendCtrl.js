import angular from 'angular';
import _ from 'lodash';

class legendCtrl {

  constructor($scope, mapService) {
    'ngInject';
    this.styles = [];

    $scope.$on('map:ready', () => {
      this.styles = _.cloneDeep(mapService.styles);
      this.styles.reverse();
    });
  }
}

legendCtrl.$inject = ['$scope', 'mapService'];

angular.module('OpenDataDiscovery').controller('legendCtrl', legendCtrl);

export default legendCtrl;
