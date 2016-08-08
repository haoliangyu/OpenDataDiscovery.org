import angular from 'angular';

class instanceListCtrl {

  constructor($scope, mapService) {
    'ngInject';

    this.mapService = mapService;
    this.yes = 'yes';
    this.instances = [];
    this.selected = [];

    $scope.$on('map:ready', () => {
      this.instances = mapService.instances;
      this.selected = _.map(mapService.instances, instance => {
        return instance.name;
      });
    });
  }

  toggleInstance(instance) {
    if (instance.visible) {
      var index = _.indexOf(this.selected, instance.name);
      this.selected.splice(index, 1);
    } else {
      this.selected.push(instance.name);
    }

    this.mapService.toggleInstance(instance);
  }

  toggleAllInstances() {
    if (this.isAllSelected()) {
      _.forEach(this.instances, instance => {
        this.toggleInstance(instance);
        instance.visible = false;
      });
      this.selected.length = [];
    } else {
      var unloaded = _.filter(this.instances, instance => {
        return !instance.visible;
      });

      _.forEach(unloaded, instance => {
        this.toggleInstance(instance);
        instance.visible = true;
      });

      this.selected = _.map(this.instances, instance => {
        return instance.name;
      });
    }
  }

  isIndeterminate() {
    return this.selected.length > 0 &&
        this.selected.length < this.instances.length;
  }

  isAllSelected() {
    return this.instances.length === this.selected.length;
  }
}

instanceListCtrl.$inject = ['$scope', 'mapService'];

angular.module('OpenDataDiscovery').controller('instanceListCtrl', instanceListCtrl);

export default instanceListCtrl;
