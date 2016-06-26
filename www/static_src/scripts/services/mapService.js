import 'leaflet';
import 'topojson';
import angular from 'angular';

require('../../../../node_modules/leaflet.vectorgrid/dist/Leaflet.VectorGrid.js');

class mapService {

  constructor(ajaxService) {
    'ngInject';

    this.ajaxService = ajaxService;
  }

  initialize() {

    this.map = L.map('map', {
      center: [0, 0],
      zoom: 2
    });

    var basemap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      subdomains: 'abcd',
      maxZoom: 19
    });

    this.map.addLayer(basemap);

    this.ajaxService
      .getInstances()
      .then(result => {
        _.forEach(result.instances, instance => {
          let latLngs = L.GeoJSON.coordsToLatLngs(instance.bbox.coordinates[0]);

          let layer = L.vectorGrid.protobuf(instance.layers[0].url, {
            bbox: L.latLngBounds(latLngs)
          });

          this.map.addLayer(layer);
        });
      });
  }
}

mapService.$inject = ['ajaxService'];

angular.module('OpenDataDiscovery').service('mapService', mapService);

export default mapService;
