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
    this.instances = [];

    this.MAXZOOM = 10;
    this.minZoom = 3;
  }

  initialize() {

    this.map = L.map('map', {
      center: [0, 0],
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      zoom: this.minZoom
    });

    let basemap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      subdomains: 'abcd',
      maxZoom: this.MAXZOOM,
      minZoom: this.minZoom
    });

    this.map.addLayer(basemap);

    let baseUrl = this.ajaxService.getBaseUrl();
    let styles;

    this.ajaxService
      .getMapStyles(5)
      .then(result => {
        styles = result.styles;
        return this.ajaxService.getRegionLevels();
      })
      .then(result => {
        _.forEach(result.levels, (level, index) => {
          this.map.createPane(level.name);
          this.map.getPane(level.name).style.pointerEvents = 'none';

          // just make them a bit higher than the tileLayer pane
          this.map.getPane(level.name).style.zIndex = 210 + index * 10;
        });

        return this.ajaxService.getInstances();
      })
      .then(result => {
        this.instances = result.instances;

        _.forEach(result.instances, instance => {
          instance.visible = true;

          let latLngs = L.GeoJSON.coordsToLatLngs(instance.bbox.coordinates[0]);

          // only show the upper region level initially
          let layer = instance.layers[0];

          let layerStyle = {};
          layerStyle[layer.name] = properties => {
            var count = properties.count;
            let color = _.find(styles, style => {
              return style.lowerBound <= count && count <= style.upperBound;
            }).fill;

            return {
              color: '#6c7069',
              weight: 1,
              fill: true,
              fillColor: color,
              fillOpacity: 0.7
            };
          };

          instance.currentMapLayer = L.vectorGrid.protobuf(baseUrl + layer.url, {
            pane: layer.level,
            bbox: L.latLngBounds(latLngs),
            vectorTileLayerStyles: layerStyle,
            onMouseOver: this._onMouseOver.bind(this),
            onMouseOut: this._onMouseOut.bind(this),
            onMouseMove: this._onMouseMove.bind(this),
            onClick: this._onMouseClick.bind(this)
          });

          this.map.addLayer(instance.currentMapLayer);
        });

        this.$rootScope.$broadcast('map:ready');
      });
  }

  toggleInstance(instance) {
    if (!instance.visible) {
      this.map.addLayer(instance.currentMapLayer);
    } else {
      this.map.removeLayer(instance.currentMapLayer);
    }
  }

  _onMouseClick() {
    this.$rootScope.$broadcast('sidebar:open', 'Instance Info');
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

mapService.$inject = ['$rootScope', '$compile', 'ajaxService'];

angular.module('OpenDataDiscovery').service('mapService', mapService);

export default mapService;
