import 'leaflet';
import 'topojson';
import angular from 'angular';

require('../../../../node_modules/leaflet.vectorgrid/dist/Leaflet.VectorGrid.js');

class mapService {

  constructor($rootScope, $compile, ajaxService) {
    'ngInject';

    this.$rootScope = $rootScope;
    this.$compile = $compile;
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

    let baseUrl = this.ajaxService.getBaseUrl();
    console.log(baseUrl);
    this.ajaxService
      .getInstances()
      .then(result => {
        _.forEach(result.instances, instance => {
          let latLngs = L.GeoJSON.coordsToLatLngs(instance.bbox.coordinates[0]);
          let layer = instance.layers[0];

          let tileLayer = L.vectorGrid.protobuf(baseUrl + layer.url, {
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

    // get data from the tile
    let coords = e.target.getCoords();
    let geojson = e.target.toGeoJSON(coords.x, coords.y, coords.z);

    let content = angular.element('<info-popup></info-popup>');
    let scope = this.$rootScope.$new(true);

    if (typeof geojson.properties.top_tag === 'string') {
      geojson.properties.top_tag = JSON.parse(geojson.properties.top_tag);
    }

    if (typeof geojson.properties.top_category === 'string') {
      geojson.properties.top_category = JSON.parse(geojson.properties.top_category);
    }

    if (typeof geojson.properties.top_organization === 'string') {
      geojson.properties.top_organization = JSON.parse(geojson.properties.top_organization);
    }


    scope.properties = geojson.properties;

    this.currentPopup = L.popup({
      offset: L.point(0, -1),
      closeButton: false,
      minWidth: 200
    })
    .setContent(this.$compile(content)(scope)[0])
    .setLatLng(e.latlng)
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

mapService.$inject = ['$rootScope', '$compile', 'ajaxService'];

angular.module('OpenDataDiscovery').service('mapService', mapService);

export default mapService;
