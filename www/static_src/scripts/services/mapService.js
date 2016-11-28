import 'leaflet';
import 'leaflet.vectorgrid';
import _ from 'lodash';
import angular from 'angular';

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

    let basemap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
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

          const color = _.find(this.styles, style => {
            return style.lowerBound <= properties.count && properties.count <= style.upperBound;
          }).fill;

          return {
            color: '#ececec',
            weight: 2,
            fill: true,
            fillColor: color,
            fillOpacity: 1
          };
        };

        const instanceLayer = L.vectorGrid.protobuf(location.origin + '/vt/regions/{z}/{x}/{y}.pbf', {
          vectorTileLayerStyles: {
            'regions': layerStyle
          },
          interactive: true
        })
        .on('click', this._onClick.bind(this))
        .on('mouseover', this._onMouseOver.bind(this))
        .on('mouseout', this._onMouseOut.bind(this));

        this.map.addLayer(instanceLayer);
        this.map.invalidateSize();

        this.$rootScope.$broadcast('map:ready');
      })
      .then(() => {
        let label = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}.{ext}', {
          attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          subdomains: 'abcd',
          ext: 'png'
        });

        this.map.addLayer(label);
      });
  }

  disableEventPropagation(elementID) {
    var dom = L.DomUtil.get(elementID);
    L.DomEvent.disableClickPropagation(dom);
    L.DomEvent.on(dom, 'mousewheel', L.DomEvent.stopPropagation);
  }

  zoomTo(geometry) {
    const latLngs = _.map(geometry.coordinates[0], coord => {
      return L.latLng(coord[1], coord[0]);
    });

    this.map.fitBounds(L.latLngBounds(latLngs));
  }

  _onClick(e) {
    // get data from the tile
    let properties = e.layer.properties;

    if (_.isString(properties.instances)) {
      properties.instances = JSON.parse(properties.instances);
    }

    this.$rootScope.$broadcast('sidebar:switch', 'Instance Info', _.map(properties.instances, 'id'));

    if (_.isString(properties.bbox)) {
      properties.bbox = JSON.parse(properties.bbox);
    }

    this.zoomTo(properties.bbox);
  }

  _onMouseOver(e) {
    // get data from the tile
    let properties = e.layer.properties;

    if (_.isString(properties.instances)) {
      properties.instances = JSON.parse(properties.instances);
    }

    this.$rootScope.$broadcast('map:inFeature', _.omit(properties, 'bbox'));
  }

  _onMouseOut() {
    this.$rootScope.$broadcast('map:outFeature');
  }
}

mapService.$inject = ['$rootScope', '$compile', 'ajaxService', 'sidebarService'];

angular.module('OpenDataDiscovery').service('mapService', mapService);

export default mapService;
