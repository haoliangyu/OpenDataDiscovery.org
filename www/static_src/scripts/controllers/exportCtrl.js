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


    let csvExample = `
      The CSV file will include following columns:

      1. name
      2. platform
      3. location
      4. website
      5. dataset count
      6. tag count
      7. category count
      8. publisher count
      9. update date
    `;

    let jsonExample = [
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

    this.formats = [
      { name: 'JSON', ext: 'json', type: 'application/json', example: $filter('json')(jsonExample) },
      { name: 'CSV', ext: 'csv', type: 'text/plain', example: csvExample }
    ];
  }

  exportData() {
    this.isProcessing = true;

    this.ajaxService.exportData(this.exportDate, this.format.ext)
      .then(data => {
        if (this.format.name === 'JSON') {
          data = JSON.stringify(data);
        }

        let blob = new Blob([data], { type: this.format.type });
        FileSaver.saveAs(blob, `data.${this.format.ext}`);
      })
      .finally(() => {
        this.isProcessing = false;
      });
  }
}

exportCtrl.$inject = ['$filter', 'ajaxService'];

angular.module('OpenDataDiscovery').controller('exportCtrl', exportCtrl);

export default exportCtrl;
