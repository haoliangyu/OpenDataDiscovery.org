import angular from 'angular';
import _ from 'lodash';

class instanceInfoCtrl {

  constructor($scope, $q, ajaxService) {
    'ngInject';

    $scope.$on('sidebar:switch', (event, view, instanceIDs) => {
      if (view !== 'Instance Info' || !instanceIDs) { return; }

      if (!_.isArray(instanceIDs)) {
        instanceIDs = [instanceIDs];
      }

      var requests = _.map(instanceIDs, instanceID => {
        return ajaxService.getInstanceInfo(instanceID);
      });

      $q.all(requests)
        .then(results => {
          this.instances = _.map(results, 'instance');
        });
    });
  }
}

instanceInfoCtrl.$inject = ['$scope', '$q', 'ajaxService'];

angular.module('OpenDataDiscovery').controller('instanceInfoCtrl', instanceInfoCtrl);

export default instanceInfoCtrl;
