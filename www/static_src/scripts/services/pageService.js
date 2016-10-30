import angular from 'angular';

class pageService {

  constructor($location, $anchorScroll) {
    'ngInject';

    this.$location = $location;
    this.$anchorScroll = $anchorScroll;
  }

  /**
   * Open a new browser tab to the project's repo.
   * @return {undefined}
   */
  openGitHubRepo() {
    window.open('https://github.com/haoliangyu/OpenDataDiscovery.org', '_blank');
  }

  /**
   * Scroll to a HTML element with given ID
   * @param   {string}      elementID   HTML element ID
   * @return  {undefined}
   */
  scrollTo(elementID) {
    this.$location.hash(elementID);
    this.$anchorScroll();
  }
}

pageService.$inject = ['$location', '$anchorScroll'];

angular.module('OpenDataDiscovery').service('pageService', pageService);

export default pageService;
