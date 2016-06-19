import angular from 'angular';
import mapboxgl from 'mapbox-gl';

class mapService {

  constructor(ajaxService) {
    'ngInject';

    this.ajaxService = ajaxService;
    mapboxgl.accessToken = 'pk.eyJ1IjoiZHozMTY0MjQiLCJhIjoiNzI3NmNkOTcyNWFlNGQxNzU2OTA1N2EzN2FkNWIwMTcifQ.NS8KWg47FzfLPlKY0JMNiQ';
  }

  initialize() {

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v9',
      zoom: 13,
      center: [-122.447303, 37.753574]
    });

    this.map.on('load', () => {
      // load the first layer of instance by default
      this.ajaxService.getInstances()
          .then(result => {
            this.instances = result.instances;
            _.forEach(result.instances, instance => {
              this.map.addSource(instance.name, {
                type: 'vector',
                tiles: _.map(instance.layers, 'url')
              });
            });
          });
    });

    this.map.addControl(new mapboxgl.Navigation());
  }
}

mapService.$inject = ['ajaxService'];

angular.module('OpenDataDiscovery').service('mapService', mapService);

export default mapService;
