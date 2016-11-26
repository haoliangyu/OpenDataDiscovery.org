import _ from 'lodash';
import angular from 'angular';

class instanceListCtrl {

  constructor($scope, $rootScope, ajaxService, mapService) {
    'ngInject';

    this.$rootScope = $rootScope;
    this.groupBy = 'name';
    this.mapService = mapService;
    this.instances = [];
    this.instanceGroups = {};

    ajaxService.getInstances()
      .then(result => {
        this.instances = result.instances;
        this.groupInstance(this.groupBy);
      });
  }

  groupInstance(groupBy) {
    switch(groupBy) {
      case 'platform':
        this.instanceGroups = _.groupBy(this.instances, 'platform');
        break;
      case 'location':
        this.instanceGroups = _.groupBy(this.instances, instance => {
          return instance.location.country || 'Globe';
        });
        break;
      case 'name':
      default:
        this.instanceGroups = _.groupBy(this.instances, instance => {
          return instance.name[0].toUpperCase();
        });
    }

    this.groupBy = groupBy;
  }

  searchInstance(keyWord) {
    this.groupInstance(this.groupBy);

    if (!keyWord) { return; }

    keyWord = keyWord.toLowerCase();

    _.forEach(this.instanceGroups, instances => {
      _.remove(instances, instance => {
        if (this.groupBy === 'location') {
          return instance.formattedLocation.toLowerCase().indexOf(keyWord) === -1;
        } else if (this.groupBy === 'platform') {
          return instance.platform.toLowerCase().indexOf(keyWord) === -1;
        } else {
          return instance.name.toLowerCase().indexOf(keyWord) === -1;
        }
      });
    });
  }

  zoomTo(instance) {
    this.mapService.zoomTo(instance.bbox);
  }

  seeDetail(instance) {
    this.zoomTo(instance);
    this.$rootScope.$broadcast('sidebar:switch', 'Instance Info', instance.id);
  }
}

instanceListCtrl.$inject = ['$scope', '$rootScope', 'ajaxService', 'mapService'];

angular.module('OpenDataDiscovery').controller('instanceListCtrl', instanceListCtrl);

export default instanceListCtrl;
