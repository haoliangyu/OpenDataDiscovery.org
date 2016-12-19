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
    this.regionGeoJSON = { type: 'FeatureCollection', features: [] };

    this.currentLayer = undefined;
    this.currentLayerType = undefined;

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

        return this.ajaxService.getInstances();
      })
      .then(result => {
        let instances = _.filter(result.instances, instance => {
          return instance.center;
        });

        let groupped = _.groupBy(instances, 'formattedLocation');

        this.regionGeoJSON.features = _.map(groupped, (instances, region) => {
          let totalCount = _.reduce(instances, (count, instance) => {
            return count + instance.datasetCount;
          }, 0);

          return {
            type: 'Feature',
            geometry: instances[0].center,
            properties: {
              instances: _.map(instances, 'id'),
              name: region,
              bbox: instances[0].bbox,
              color: this.getMapStyle(totalCount).fill
            }
          };
        });

        this.showRegionLayer();
        this.map.invalidateSize();

        this.$rootScope.$broadcast('map:ready');
      })
      .then(() => {
        this.map.createPane('labels');
        this.map.getPane('labels').style.zIndex = 500;
        this.map.getPane('labels').style.pointerEvents = 'none';

        let label = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}.{ext}', {
          attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          subdomains: 'abcd',
          ext: 'png',
          pane: 'labels'
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

  showRegionLayer() {
    if (this.currentLayerType === 'region') { return; }

    if (this.currentLayer) {
      this.map.removeLayer(this.currentLayer);
    }

    const layerStyle = properties => {
      if (_.isString(properties.instances)) {
        properties.instances = JSON.parse(properties.instances);
      }

      return {
        color: '#ececec',
        weight: 2,
        fill: true,
        fillColor: this.getMapStyle(properties.count).fill,
        fillOpacity: 1
      };
    };

    const _onClick = e => {
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
    };

    const _onMouseOver = e => {
      // get data from the tile
      let properties = e.layer.properties;

      if (_.isString(properties.instances)) {
        properties.instances = JSON.parse(properties.instances);
      }

      this.$rootScope.$broadcast('map:inFeature', _.omit(properties, 'bbox'));
    };

    const _onMouseOut = () => {
      this.$rootScope.$broadcast('map:outFeature');
    };

    this.currentLayer = L.vectorGrid.protobuf(location.origin + '/vt/regions/{z}/{x}/{y}.pbf', {
      vectorTileLayerStyles: {
        'regions': layerStyle
      },
      interactive: true
    })
    .on('click', _onClick.bind(this))
    .on('mouseover', _onMouseOver.bind(this))
    .on('mouseout', _onMouseOut.bind(this));

    this.map.addLayer(this.currentLayer);
    this.currentLayerType = 'region';
  }

  showMarkerLayer() {
    if (this.currentLayerType === 'marker') { return; }

    if (this.currentLayer) {
      this.map.removeLayer(this.currentLayer);
    }

    let _onClick = e => {
      let properties = e.layer.toGeoJSON().properties;

      this.$rootScope.$broadcast('sidebar:switch', 'Instance Info', properties.instances);
      this.zoomTo(properties.bbox);
    };

    let pointToLayer = (point, latlng) => {
      let properties = point.properties;

      return L.marker(latlng, {
        icon: L.icon({
          iconUrl: `http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|${properties.color.slice(1)}&chf=a,s,ee00FFFF`,
          iconAnchor: [11, 34],
        })
      })
      .bindTooltip(`<strong>${properties.name}</strong>`, {
        offset: L.point([0, -35]),
        direction: 'top'
      });
    };

    this.currentLayer = L.geoJSON(this.regionGeoJSON, {
      pointToLayer: pointToLayer.bind(this)
    })
    .on('click', _onClick.bind(this));

    this.map.addLayer(this.currentLayer);
    this.currentLayerType = 'marker';
  }

  getMapStyle(count) {
    for (let i = 0, n = this.styles.length; i < n; i++) {
      if (this.styles[i].lowerBound <= count && count <= this.styles[i].upperBound) {
        return this.styles[i];
      }
    }

    // default map style
    return { fill: '#fff' };
  }
}

mapService.$inject = ['$rootScope', '$compile', 'ajaxService', 'sidebarService'];

angular.module('OpenDataDiscovery').service('mapService', mapService);

export default mapService;
