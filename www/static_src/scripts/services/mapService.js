import 'leaflet';
import 'topojson';
import angular from 'angular';

require('../../../../node_modules/leaflet.vectorgrid/dist/Leaflet.VectorGrid.js');

class mapService {

  constructor($rootScope, $compile, ajaxService, sidebarService) {
    'ngInject';

    this.$rootScope = $rootScope;
    this.$compile = $compile;
    this.ajaxService = ajaxService;
    this.sidebarService = sidebarService;
    this.styles = [];

    this.minZoom = 3;
    this.maxZoom = 10;
  }

  initialize() {

    this.map = L.map('map', {
      center: [0, 0],
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      zoom: this.minZoom,
      zoomControl: false
    });

    let basemap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      subdomains: 'abcd'
    });

    this.map.addLayer(basemap);

    this.ajaxService
      .getMapStyles(5)
      .then(result => {
        this.styles = result.styles;

        const layerStyle = properties => {
          if (_.isString(properties.instances)) {
            properties.instances = JSON.parse(properties.instances);
          }

          const totalCount = _.reduce(properties.instances, (count, instance) => {
            return count + instance.count;
          }, 0);

          const color = _.find(this.styles, style => {
            return style.lowerBound <= totalCount && totalCount <= style.upperBound;
          }).fill;

          return {
            color: '#6c7069',
            weight: 1,
            fill: true,
            fillColor: color,
            fillOpacity: 0.7
          };
        };

        const instanceLayer = L.vectorGrid.protobuf(location.origin + '/vt/regions/{z}/{x}/{y}.pbf', {
          vectorTileLayerStyles: layerStyle,
          onMouseOver: this._onMouseOver.bind(this),
          onMouseOut: this._onMouseOut.bind(this),
          onMouseMove: this._onMouseMove.bind(this)
        });

        this.map.addLayer(instanceLayer);
        this.map.invalidateSize();

        this.$rootScope.$broadcast('map:ready');
      });
  }

  zoomTo(bbox) {
    const latLngs = _.map(bbox.coordinates[0], coord => {
      return L.latLng(coord[1], coord[0]);
    });

    this.map.fitBounds(L.latLngBounds(latLngs));
  }

  _onMouseOver(e) {
    this.map.closePopup();

    // get data from the tile
    const coords = e.target.getCoords();
    const geojson = e.target.toGeoJSON(coords.x, coords.y, coords.z);

    const content = angular.element('<info-popup></info-popup>');
    const scope = this.$rootScope.$new(true);

    if (_.isString(geojson.properties.instances)) {
      geojson.properties.instances = JSON.parse(geojson.properties.instances);
    }

    scope.region = geojson.properties;

    this.currentPopup = L.popup({
      offset: L.point(0, -1),
      closeButton: false,
      minWidth: 250
    })
    .setContent(this.$compile(content)(scope)[0])
    .setLatLng(e.latlng)
    .openOn(this.map);
  }

  _onMouseOut() {
    this.map.closePopup();
    delete this.currentPopup;
  }

  _onMouseMove(e) {
    if (this.currentPopup) {
      this.currentPopup.setLatLng(e.latlng);
    }
  }
}

mapService.$inject = ['$rootScope', '$compile', 'ajaxService', 'sidebarService'];

angular.module('OpenDataDiscovery').service('mapService', mapService);

export default mapService;
