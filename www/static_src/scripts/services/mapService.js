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
          let layer = instance.layers[0];

          let tileLayer = L.vectorGrid.protobuf(layer.url, {
            bbox: L.latLngBounds(latLngs),
            vectorTileLayerStyles: {
              // all tilesplash layer is named 'vectile' internally
              vectile: {
                weight: 3,
                fillColor: '#449bf6',
                fillOpacity: 0.7,
                fill: true
              }
            },
            onMouseOver: this._onMouseOver.bind(this),
            onMouseOut: this._onMouseOut.bind(this),
            onMouseMove: this._onMouseMove.bind(this)
          });

          this.map.addLayer(tileLayer);
        });
      });
  }

  _onMouseOver(e) {
    this.map.closePopup();

    this.currentPopup = L.popup({
      offset: L.point(0, -1),
      closeButton: false
    })
    .setLatLng(e.latlng)
    .setContent('test')
    .openOn(this.map);
  }

  _onMouseOut(e) {
    this.map.closePopup();
    delete this.currentPopup;
  }

  _onMouseMove(e) {
    if (this.currentPopup) {
      this.currentPopup.setLatLng(e.latlng);
    }
  }
}

mapService.$inject = ['ajaxService'];

angular.module('OpenDataDiscovery').service('mapService', mapService);

export default mapService;
