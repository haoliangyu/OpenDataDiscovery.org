import angular from 'angular';

class aboutCtrl {

  constructor(ajaxService) {
    'ngInject';

    this.platforms = [
      {
        name: 'CKAN',
        logo: require('../../media/images/ckan-logo.png'),
        url: 'http://ckan.org/'
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
}

aboutCtrl.$inject = ['ajaxService'];

angular.module('OpenDataDiscovery').controller('aboutCtrl', aboutCtrl);

export default aboutCtrl;
