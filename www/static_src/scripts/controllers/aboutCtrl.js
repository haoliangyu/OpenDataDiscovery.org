import angular from 'angular';

class aboutCtrl {

  constructor(ajaxService) {
    'ngInject';

    this.platforms = [
      {
        name: 'CKAN',
        logo: require('../../media/images/ckan-logo.png'),
        url: 'http://ckan.org/'
      },
      {
        name: 'DKAN',
        logo: require('../../media/images/dkan-logo.png'),
        url: 'http://www.nucivic.com/dkan/'
      },
      {
        name: 'Socrata',
        logo: require('../../media/images/socrata-logo.png'),
        url: 'https://socrata.com/solutions/publica-open-data-cloud/'
      },
      {
        name: 'Junar',
        logo: require('../../media/images/junar-logo.jpg'),
        url: 'http://junar.com/'
      },
      {
        name: 'ArcGIS Open Data',
        logo: require('../../media/images/arcgis-logo.png'),
        url: 'http://opendata.arcgis.com/'
      },
      {
        name: 'OpenDataSoft',
        logo: require('../../media/images/opendatasoft-logo.png'),
        url: 'https://www.opendatasoft.com/'
      },
      {
        name: 'GeoNode',
        logo: require('../../media/images/geonode-logo.png'),
        url: 'http://geonode.org/'
      }
    ];

    ajaxService.getInstanceSummary()
      .then(result => {
        this.portalCount = result.summary.portalCount;
      })
      .catch(err => {
        console.error(err);
      });
  }

  openPlatformSite(url) {
    window.open(url, '_blank');
  }
}

aboutCtrl.$inject = ['ajaxService'];

angular.module('OpenDataDiscovery').controller('aboutCtrl', aboutCtrl);

export default aboutCtrl;
