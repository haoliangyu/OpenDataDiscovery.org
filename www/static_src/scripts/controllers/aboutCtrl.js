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
