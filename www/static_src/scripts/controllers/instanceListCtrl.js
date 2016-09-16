import angular from 'angular';

class instanceListCtrl {

  constructor($scope, $rootScope, ajaxService, mapService) {
    'ngInject';

    this.$rootScope = $rootScope;
    this.mapService = mapService;
    this.instances = [];

    ajaxService.getInstances()
      .then((result) => {
        this.instances = result.instances;
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
