import mapboxgl from 'mapbox-gl';
import angular from 'angular';

class mapService {

  constructor($rootScope, $compile, ajaxService) {
    'ngInject';

    this.$rootScope = $rootScope;
    this.$compile = $compile;
    this.ajaxService = ajaxService;
    this.maxZoom = 10;
    this.minZoom = 3;

    mapboxgl.accessToken = 'pk.eyJ1IjoiZHozMTY0MjQiLCJhIjoiNzI3NmNkOTcyNWFlNGQxNzU2OTA1N2EzN2FkNWIwMTcifQ.NS8KWg47FzfLPlKY0JMNiQ';
  }

  initialize() {

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v9',
      zoom: this.minZoom,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      center: [0, 0]
    });

    this.map.on('load', () => {
      // load the first layer of instance by default
      this.ajaxService.getInstances()
        .then(result => {
          this.instances = result.instances;
          _.forEach(result.instances, instance => {
            var layer = instance.layers[0];

            this.map.addSource(layer.name, {
              type: 'vector',
              tiles: [location.origin + layer.url],
              minZoom: this.minZoom,
              maxZoom: this.maxZoom
            });

            this.map.addLayer({
              id: layer.name,
              source: layer.name,
              'source-layer': layer.name,
              type: 'fill'
            });
          });
        });
    });
  }
}

mapService.$inject = ['$rootScope', '$compile', 'ajaxService'];

angular.module('OpenDataDiscovery').service('mapService', mapService);

export default mapService;
