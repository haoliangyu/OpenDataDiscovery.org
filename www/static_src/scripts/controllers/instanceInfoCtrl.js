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

      let requests = _.map(instanceIDs, instanceID => {
        return ajaxService.getInstanceInfo(instanceID);
      });

      $q.all(requests)
        .then(results => {
          this.instances = _.map(results, 'instance');
          this.searchResult = _.cloneDeep(this.instances);
        });
    });
  }

  searchInstance(keyWord) {
    keyWord = keyWord.toLowerCase();

    if (keyWord) {
      this.searchResult = _.filter(this.instances, instance => {
        return instance.name.toLowerCase().indexOf(keyWord) !== -1;
      });
    } else {
      this.searchResult = _.cloneDeep(this.instances);
    }
  }
}

instanceInfoCtrl.$inject = ['$scope', '$q', 'ajaxService'];

angular.module('OpenDataDiscovery').controller('instanceInfoCtrl', instanceInfoCtrl);

export default instanceInfoCtrl;
