import angular from 'angular';

class homepageCtrl {

  constructor($scope, ajaxService, pageService) {
    'ngInject';

    this.pageService = pageService;
    this.datasetCount = 0;
    this.portalCount = 0;

    window.addEventListener('resize', () => {
      pageService.scrollTo(pageService.currentPage);
    });

    ajaxService.getInstanceSummary()
      .then(result => {
        this.datasetCount = result.summary.datasetCount;
      })
      .catch(err => {
        console.error(err);
      });
  }

  scrollTo(elementID) {
    this.pageService.scrollTo(elementID);
  }

  openGitHubRepo() {
    this.pageService.openGitHubRepo();
  }

  openPlatformSite(url) {
    window.open(url, '_blank');
  }
}

homepageCtrl.$inject = ['$scope', 'ajaxService', 'pageService'];

angular.module('OpenDataDiscovery').controller('homepageCtrl', homepageCtrl);

export default homepageCtrl;
