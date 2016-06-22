import 'leaflet';
import angular from 'angular';

import 'geojson-vt';
import 'pbf';
import 'topojson';
import 'vector-tile';
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
          if (instance.layers[0].name === 'datagov_nation') return;
          var layer = L.vectorGrid.protobuf(instance.layers[0].url);
          this.map.addLayer(layer);
        });
      });
  }
}

mapService.$inject = ['ajaxService'];

angular.module('OpenDataDiscovery').service('mapService', mapService);

export default mapService;
