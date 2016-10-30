import angular from 'angular';
import FileSaver from 'file-saver';

class exportCtrl {

  constructor($filter, ajaxService) {
    'ngInject';

    this.$filter = $filter;
    this.ajaxService = ajaxService;

    this.exportDate = new Date();
    this.minDate = new Date(2016, 9, 1);
    this.maxDate = new Date();
    this.isProcessing = false;

    this.example = [
      {
        name: 'data.gov',
        location: 'United States',
        dataset_count: 328421,
        update_date: '2016-10-21',
        tags: [
          { name: 'GIS', dataset_count: 23123, update_date: '2016-10-15' }
        ],
        categories: [
          { name: 'Economics', dataset_count: 5320, update_date: '2016-10-15' }
        ],
        organizations: [
          { "name": "NOAA", "dataset_count": 126900, "update_date": "2016-10-02" }
        ]
      }
    ];
  }

  exportData() {
    this.isProcessing = true;

    this.ajaxService.exportData(this.exportDate)
      .then(data => {
        let content = this.$filter('json')(data.portals);
        let blob = new Blob([content], { type: 'application/json' });
        FileSaver.saveAs(blob, 'data.json');
      })
      .finally(() => {
        this.isProcessing = false;
      });
  }
}

exportCtrl.$inject = ['$filter', 'ajaxService'];

angular.module('OpenDataDiscovery').controller('exportCtrl', exportCtrl);

export default exportCtrl;
