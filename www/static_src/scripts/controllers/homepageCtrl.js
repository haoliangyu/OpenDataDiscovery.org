import angular from 'angular';

class homepageCtrl {

  constructor($scope, $timeout, ajaxService) {
    'ngInject';

    this.datasetCount = 0;
    this.portalCount = 0;

    ajaxService.getInstanceSummary()
      .then(result => {
        this.portalCount = result.summary.portalCount;
        this.datasetCount = result.summary.datasetCount;
      })
      .catch(err => {
        console.error(err);
      });
  }

  jumpToRepo() {
    window.open('https://github.com/haoliangyu/OpenDataDiscovery.org', '_blank');
  }
}

homepageCtrl.$inject = ['$scope', '$timeout', 'ajaxService'];

angular.module('OpenDataDiscovery').controller('homepageCtrl', homepageCtrl);

export default homepageCtrl;
